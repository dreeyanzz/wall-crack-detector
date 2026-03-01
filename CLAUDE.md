# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Crack Detection System -- a real-time crack detection web application using YOLOv8 instance segmentation and OpenCV. Points a camera at a wall/surface and draws polygon masks over detected cracks in real time. React + Tailwind CSS frontend served by a FastAPI backend. Distributed to customers as a standalone Windows exe via PyInstaller.

## Commands

| Task | Command |
|------|---------|
| Run the app (production) | `python run.py` |
| Install Python deps | `pip install -r requirements.txt` |
| Install frontend deps | `cd frontend && npm install` |
| Build frontend | `cd frontend && npm run build` |
| Dev: backend with reload | `uvicorn backend.app:app --reload --port 8000` |
| Dev: frontend with HMR | `cd frontend && npm run dev` |
| Build standalone exe | `python build.py` |
| Build + publish GitHub release | `python release.py v1.2.3 [--notes "..."]` |

There is no linter configuration and no automated test suite.
`release.py` requires the `gh` CLI to be installed and authenticated (`gh auth login`).

## Architecture

### Backend (`backend/`)

- **`app.py`** -- FastAPI application. Mounts API routes under `/api` and serves the built React static files for all other paths.
- **`detector.py`** -- `DetectionEngine` class. Thread-safe crack detection using YOLOv8 segmentation (`model.predict()`). Runs detection in a daemon thread, draws polygon masks on frames, encodes to JPEG for MJPEG streaming. A single `threading.Lock` protects shared state; the lock is NOT held during the expensive `model.predict()` call.
- **`routes/`** -- FastAPI routers split by concern: `stream.py` (MJPEG), `controls.py` (start/pause/stop), `settings.py`, `stats.py`, `screenshots.py`. Each uses a `create_router(engine)` factory pattern.

### Frontend (`frontend/`)

Vite + React 19 + TypeScript + Tailwind CSS.

- **`src/api.ts`** -- Thin fetch wrappers for all `/api` endpoints.
- **`src/hooks/useStats.ts`** -- Polls `GET /api/stats` every 500ms.
- **`src/hooks/useSettings.ts`** -- Fetches and optimistically updates settings.
- **`src/components/`** -- `Layout`, `VideoFeed` (MJPEG via `<img>`), `ControlBar`, `StatsPanel`, `SettingsPanel`, `ScreenshotGallery`. Shared UI primitives live in `src/components/ui/` (Toast, Modal, Spinner, Skeleton, ToggleSwitch, Tooltip, etc.).
- **`src/types.ts`** -- Shared TypeScript interfaces: `Stats`, `Settings`, `Screenshot`.

### Data Flow

```
Camera -> OpenCV VideoCapture -> YOLOv8 model.predict()
  -> Segmentation masks (polygons per crack instance)
  -> Draw filled polygon overlays on frame -> cv2.imencode JPEG
  -> MJPEG StreamingResponse -> <img> in React frontend
  -> Stats polled via REST -> StatsPanel + SettingsPanel
```

### Packaging (`build.py`, `run_exe.py`)

- `build.py` runs PyInstaller to produce `dist/CrackDetector/` with the exe and all dependencies.
- `run_exe.py` is the frozen entry point -- no installs, just model load and server start.
- Path resolution uses `sys.frozen` / `sys._MEIPASS` to find bundled data files.
- `_base_dir()` returns read-only bundle root; `_writable_dir()` returns the exe's directory for screenshots.

### Camera Input

Two modes, switchable in the Settings panel:

- **Built-in** — uses `cv2.VideoCapture(index)`. On Windows, tries DirectShow first, falls back to default backend.
- **IP Camera** — pass any HTTP MJPEG URL (e.g. `http://192.168.1.42:8080/video`). OpenCV reads it natively; no extra dependencies. Recommended Android app: **IP Webcam** by Pavel Khlebovich (free, Play Store).

`_camera_url = ""` means built-in. Any non-empty string is treated as an IP stream URL.

### Key Defaults

- Confidence threshold: 0.45 (adjustable via UI, range 0.1-0.95)
- Camera: built-in index 0 (switchable to IP Camera URL in UI)
- JPEG quality: 80
- Camera resolution: 1280x720 (set via cap.set; no-op on IP streams)
- Server: 127.0.0.1:8000
- Color scheme: dark theme (gray-950) with `#00d4ff` cyan accent

### Model Files

Crack segmentation weights live in project root (from `OpenSistemas/YOLOv8-crack-seg` on HuggingFace):
- `crack_n.pt` -- nano variant (fast, default)
- `crack_m.pt` -- medium variant (more accurate, optional)

To download:
```bash
pip install huggingface_hub
python -c "
from huggingface_hub import hf_hub_download
import shutil
p = hf_hub_download('OpenSistemas/YOLOv8-crack-seg', 'yolov8n/weights/best.pt')
shutil.copy(p, 'crack_n.pt')
p = hf_hub_download('OpenSistemas/YOLOv8-crack-seg', 'yolov8m/weights/best.pt')
shutil.copy(p, 'crack_m.pt')
"
```

### Dependencies

Python: `ultralytics`, `opencv-python`, `fastapi`, `uvicorn`, `Pillow`
Frontend: `react`, `react-dom`, `tailwindcss`, `vite`, `typescript`
Build: `pyinstaller`

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) -- System design, threading model, design decisions
- [DEVELOPMENT.md](DEVELOPMENT.md) -- Developer setup, how to add features, debugging
- [API.md](API.md) -- Full REST API reference with examples
- [DEPLOYMENT.md](DEPLOYMENT.md) -- Building the exe, distributing to customers
