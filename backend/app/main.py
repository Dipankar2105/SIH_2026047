from fastapi import FastAPI

from app.routers.identity import router as identity_router
from app.routers.documents import router as documents_router
from app.routers.discovery import router as discovery_router
from app.routers.hospital import router as hospital_router

app = FastAPI(title="MediKiosk API")

app.include_router(identity_router)
app.include_router(documents_router)
app.include_router(discovery_router)
app.include_router(hospital_router)


@app.get("/health")
def health():
    return {"status": "ok"}