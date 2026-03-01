from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from backend.detector import DetectionEngine, SCREENSHOT_DIR

router = APIRouter()


def _safe_path(name: str):
    """Resolve the screenshot path and reject any traversal attempts."""
    path = (SCREENSHOT_DIR / name).resolve()
    if not path.is_relative_to(SCREENSHOT_DIR.resolve()):
        raise HTTPException(status_code=400, detail="Invalid filename")
    return path


def create_router(engine: DetectionEngine) -> APIRouter:
    @router.post("/screenshot")
    def take_screenshot():
        result = engine.take_screenshot()
        if result.get("status") == "error":
            raise HTTPException(status_code=409, detail=result["message"])
        return result

    @router.get("/screenshots")
    def list_screenshots():
        return engine.list_screenshots()

    @router.get("/screenshots/{name}")
    def get_screenshot(name: str):
        path = _safe_path(name)
        if not path.exists() or not path.is_file():
            raise HTTPException(status_code=404, detail="Not found")
        return FileResponse(path, media_type="image/jpeg")

    @router.delete("/screenshots/{name}")
    def delete_screenshot(name: str):
        path = _safe_path(name)
        if not path.exists() or not path.is_file():
            raise HTTPException(status_code=404, detail="Not found")
        path.unlink()
        return {"status": "ok"}

    return router
