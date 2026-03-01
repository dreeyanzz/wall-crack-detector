"""
DetectionEngine — thread-safe YOLOv8 crack detection with MJPEG output.

Uses a YOLOv8 segmentation model (crack_n.pt / crack_m.pt) to detect and
draw crack instance masks in real time.
"""

import sys
import cv2
import threading
import time
import numpy as np
from datetime import datetime
from pathlib import Path

from ultralytics import YOLO

# Colors assigned to crack instances
_COLORS = [
    (0, 255, 100), (255, 100, 0), (0, 100, 255),
    (255, 0, 150), (0, 255, 255), (255, 255, 0),
    (150, 0, 255), (0, 200, 100), (100, 255, 0),
]


def _base_dir() -> Path:
    """Return project root — works both normally and inside a PyInstaller bundle."""
    if getattr(sys, "frozen", False):
        return Path(sys._MEIPASS)
    return Path(__file__).resolve().parent.parent


def _writable_dir() -> Path:
    """Writable directory next to the exe (frozen) or project root (dev)."""
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent.parent


SCREENSHOT_DIR = _writable_dir() / "screenshots"
SCREENSHOT_DIR.mkdir(exist_ok=True)

MODEL_DIR = _base_dir()


class DetectionEngine:
    """Thread-safe crack detection engine backed by YOLOv8 instance segmentation."""

    def __init__(self) -> None:
        # --- lock protects all mutable state below ---
        self._lock = threading.Lock()

        # state
        self._running = False
        self._paused = False
        self._cap: cv2.VideoCapture | None = None
        self._thread: threading.Thread | None = None

        # stats
        self._crack_count = 0
        self._fps = 0.0
        self._session_start: float | None = None
        self._screenshot_count = 0

        # settings
        self._confidence = 0.45
        self._camera_index = 0
        self._camera_url = ""
        self._model_name = "crack_n.pt"
        self._show_labels = True
        self._show_confidence = True

        # current JPEG-encoded frame (bytes) for MJPEG streaming
        self._jpeg_frame: bytes | None = None
        self._frame_event = threading.Event()

        # raw BGR frame for screenshots
        self._raw_frame = None

        # model (loaded once, reloaded on model change)
        self._model: YOLO | None = None
        self._load_model()

    # ------------------------------------------------------------------
    # Model
    # ------------------------------------------------------------------

    def _load_model(self) -> None:
        model_path = MODEL_DIR / self._model_name
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")
        self._model = YOLO(str(model_path))

    # ------------------------------------------------------------------
    # Public control methods (called from route handlers)
    # ------------------------------------------------------------------

    def start(self) -> dict:
        with self._lock:
            if self._running:
                return {"status": "already_running"}

            if self._camera_url:
                cap = cv2.VideoCapture(self._camera_url)
            else:
                # On Windows prefer DirectShow — MSMF often fails to read frames
                backend = cv2.CAP_DSHOW if sys.platform == "win32" else cv2.CAP_ANY
                cap = cv2.VideoCapture(self._camera_index, backend)
                if not cap.isOpened():
                    # Fallback to default backend
                    cap = cv2.VideoCapture(self._camera_index)
            if not cap.isOpened():
                return {"status": "error", "message": "Cannot open camera"}

            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

            self._cap = cap
            self._running = True
            self._paused = False
            self._crack_count = 0
            self._screenshot_count = 0
            self._fps = 0.0
            self._session_start = time.time()
            self._jpeg_frame = None

            # Create and start inside the lock so stop() can never see an
            # unstarted Thread object and crash on join().
            self._thread = threading.Thread(target=self._detection_loop, daemon=True)
            self._thread.start()

        return {"status": "started"}

    def stop(self) -> dict:
        with self._lock:
            if not self._running:
                return {"status": "not_running"}
            self._running = False

        # wait for thread to finish
        if self._thread is not None:
            self._thread.join(timeout=3)
            self._thread = None

        with self._lock:
            if self._cap is not None:
                self._cap.release()
                self._cap = None

            summary = {
                "status": "stopped",
                "duration": self._format_time(time.time() - self._session_start) if self._session_start else "00:00:00",
                "screenshots": self._screenshot_count,
            }
            self._session_start = None
            self._jpeg_frame = None
            self._raw_frame = None
            self._fps = 0.0
            self._crack_count = 0
            # signal any waiting generator
            self._frame_event.set()
            return summary

    def pause(self) -> dict:
        with self._lock:
            if not self._running:
                return {"status": "not_running"}
            self._paused = not self._paused
            return {"status": "paused" if self._paused else "resumed"}

    # ------------------------------------------------------------------
    # Stats / settings
    # ------------------------------------------------------------------

    def get_stats(self) -> dict:
        with self._lock:
            elapsed = ""
            if self._session_start and self._running:
                elapsed = self._format_time(time.time() - self._session_start)
            return {
                "crack_count": self._crack_count,
                "fps": round(self._fps, 1),
                "session_time": elapsed,
                "screenshots": self._screenshot_count,
                "running": self._running,
                "paused": self._paused,
            }

    def get_settings(self) -> dict:
        with self._lock:
            return {
                "confidence": self._confidence,
                "camera_index": self._camera_index,
                "camera_url": self._camera_url,
                "model_name": self._model_name,
                "show_labels": self._show_labels,
                "show_confidence": self._show_confidence,
            }

    def update_settings(self, data: dict) -> dict:
        reload_model = False
        with self._lock:
            if "confidence" in data:
                self._confidence = max(0.1, min(0.95, float(data["confidence"])))
            if "camera_index" in data:
                self._camera_index = int(data["camera_index"])
            if "camera_url" in data:
                self._camera_url = str(data["camera_url"]).strip()
            if "show_labels" in data:
                self._show_labels = bool(data["show_labels"])
            if "show_confidence" in data:
                self._show_confidence = bool(data["show_confidence"])
            if "model_name" in data:
                new_model = data["model_name"]
                if new_model != self._model_name:
                    if not (MODEL_DIR / new_model).exists():
                        raise ValueError(f"Model file not found: {new_model}")
                    self._model_name = new_model
                    reload_model = True

        if reload_model:
            self._load_model()

        return self.get_settings()

    # ------------------------------------------------------------------
    # Screenshots
    # ------------------------------------------------------------------

    def take_screenshot(self) -> dict:
        with self._lock:
            if self._raw_frame is None:
                return {"status": "error", "message": "No frame available"}
            frame = self._raw_frame.copy()

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = f"detection_{timestamp}.jpg"
        filepath = SCREENSHOT_DIR / filename
        cv2.imwrite(str(filepath), frame)

        with self._lock:
            self._screenshot_count += 1

        return {"status": "ok", "filename": filename}

    def list_screenshots(self) -> list[dict]:
        files = sorted(SCREENSHOT_DIR.glob("*.jpg"), reverse=True)
        return [{"name": f.name, "size": f.stat().st_size} for f in files]

    # ------------------------------------------------------------------
    # MJPEG streaming
    # ------------------------------------------------------------------

    def frame_generator(self):
        """Yields MJPEG multipart frames. Used by StreamingResponse."""
        while True:
            self._frame_event.wait(timeout=1.0)
            self._frame_event.clear()

            with self._lock:
                if not self._running:
                    break
                jpeg = self._jpeg_frame

            if jpeg is not None:
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" + jpeg + b"\r\n"
                )

    # ------------------------------------------------------------------
    # Internal detection loop
    # ------------------------------------------------------------------

    def _detection_loop(self) -> None:
        prev_time = time.time()

        while True:
            try:
                with self._lock:
                    if not self._running:
                        break
                    paused = self._paused
                    cap = self._cap
                    conf = self._confidence
                    show_labels = self._show_labels
                    show_conf = self._show_confidence

                if paused:
                    time.sleep(0.05)
                    continue

                if cap is None:
                    break

                ret, frame = cap.read()
                if not ret:
                    with self._lock:
                        self._running = False
                    break

                # Run YOLO segmentation (expensive — lock NOT held)
                results = self._model.predict(
                    frame, conf=conf, verbose=False
                )

                crack_count = 0
                if results[0].masks is not None:
                    overlay = frame.copy()
                    for i, (mask_pts, box) in enumerate(zip(results[0].masks.xy, results[0].boxes)):
                        pts = np.array(mask_pts, dtype=np.int32)
                        conf_val = float(box.conf[0])
                        color = _COLORS[i % len(_COLORS)]
                        cv2.fillPoly(overlay, [pts], color=color)
                        cv2.polylines(frame, [pts], isClosed=True, color=color, thickness=2)
                        if show_labels or show_conf:
                            x1, y1 = int(box.xyxy[0][0]), int(box.xyxy[0][1])
                            self._draw_label(frame, x1, y1, conf_val, show_labels, show_conf, color)
                        crack_count += 1
                    cv2.addWeighted(overlay, 0.25, frame, 0.75, 0, frame)

                # Encode frame to JPEG
                _, jpeg_buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                jpeg_bytes = jpeg_buf.tobytes()

                # Calculate FPS
                now = time.time()
                dt = now - prev_time
                prev_time = now
                fps = (1.0 / dt) if dt > 0 else 0.0

                # Write shared state under lock
                with self._lock:
                    self._crack_count = crack_count
                    self._fps = self._fps * 0.8 + fps * 0.2
                    self._raw_frame = frame
                    self._jpeg_frame = jpeg_bytes

                # Signal waiting MJPEG generators
                self._frame_event.set()

            except Exception as e:
                print(f"[detection-loop] error: {e}")
                import traceback
                traceback.print_exc()
                time.sleep(0.1)

    # ------------------------------------------------------------------
    # Drawing helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _draw_label(frame, x1, y1, confidence, show_labels, show_conf, color):
        parts = []
        if show_labels:
            parts.append("crack")
        if show_conf:
            parts.append(f"{confidence * 100:.1f}%")
        if not parts:
            return
        label = " | ".join(parts)

        font = cv2.FONT_HERSHEY_SIMPLEX
        (tw, th), _ = cv2.getTextSize(label, font, 0.55, 1)
        label_y = y1 - 10 if y1 - 10 > th else y1 + th + 10
        cv2.rectangle(frame, (x1, label_y - th - 8), (x1 + tw + 14, label_y + 4), color, -1)
        cv2.putText(frame, label, (x1 + 7, label_y - 4), font, 0.55, (0, 0, 0), 2, cv2.LINE_AA)

    @staticmethod
    def _format_time(seconds: float) -> str:
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        return f"{h:02d}:{m:02d}:{s:02d}"
