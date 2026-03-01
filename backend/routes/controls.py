from fastapi import APIRouter, HTTPException

from backend.detector import DetectionEngine

router = APIRouter()


def create_router(engine: DetectionEngine) -> APIRouter:
    @router.post("/start")
    def start():
        result = engine.start()
        if result.get("status") == "error":
            raise HTTPException(status_code=409, detail=result["message"])
        return result

    @router.post("/pause")
    def pause():
        return engine.pause()

    @router.post("/stop")
    def stop():
        return engine.stop()

    return router
