from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse, Response

from backend.detector import DetectionEngine

router = APIRouter()


def create_router(engine: DetectionEngine) -> APIRouter:
    @router.get("/stream")
    def video_stream():
        return StreamingResponse(
            engine.frame_generator(),
            media_type="multipart/x-mixed-replace; boundary=frame",
        )

    @router.get("/frame")
    def latest_frame(w: int = Query(480), h: int = Query(320)):
        """Single JPEG snapshot of the latest annotated frame. Sized for ESP32/TFT."""
        jpeg = engine.get_latest_frame(width=w, height=h)
        if jpeg is None:
            return Response(status_code=204)
        return Response(content=jpeg, media_type="image/jpeg")

    return router
