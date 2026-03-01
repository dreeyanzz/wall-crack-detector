from fastapi import APIRouter, Body, HTTPException

from backend.detector import DetectionEngine

router = APIRouter()


def create_router(engine: DetectionEngine) -> APIRouter:
    @router.get("/settings")
    def get_settings():
        return engine.get_settings()

    @router.put("/settings")
    def update_settings(data: dict = Body(...)):
        try:
            return engine.update_settings(data)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    return router
