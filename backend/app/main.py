from fastapi import FastAPI

from app.config import settings

from app.routers.intake import router as intake_router
from app.routers.safety import router as safety_router
from app.routers.voice import router as voice_router


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "AarogyaFlow Track B - "
        "Conversational AI Intake & Safety Backend"
    ),
)


app.include_router(
    intake_router,
    prefix=settings.api_prefix,
)

app.include_router(
    safety_router,
    prefix=settings.api_prefix,
)

app.include_router(
    voice_router,
    prefix=settings.api_prefix,
)


@app.get("/")
def root():
    return {
        "message": (
            "AarogyaFlow Track B Backend is running"
        ),
        "version": settings.app_version,
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "aarogyaflow-track-b",
    }
