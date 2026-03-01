import sys
import cv2
from fastapi import APIRouter

router = APIRouter()


def create_router() -> APIRouter:
    @router.get("/cameras")
    def list_cameras():
        available = []
        for i in range(5):
            backend = cv2.CAP_DSHOW if sys.platform == "win32" else cv2.CAP_ANY
            cap = cv2.VideoCapture(i, backend)
            if cap.isOpened():
                available.append({"index": i, "label": f"Camera {i}"})
            cap.release()
        return available

    return router
