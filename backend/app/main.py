from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.identity import router as identity_router
from app.routers.documents import router as documents_router
from app.routers.discovery import router as discovery_router
from app.routers.hospital import router as hospital_router
from app.routers.summary import router as summary_router
from app.routers.prescription import router as prescription_router
from app.routers.fhir import router as fhir_router
from app.routers.intake import router as intake_router
from app.routers.safety import router as safety_router
from app.routers.voice import router as voice_router
from app.routers.emergency import router as emergency_router

app = FastAPI(
    title="MediKiosk API",
    description="Unified API for AarogyaFlow / MediKiosk kiosk and clinical workflows",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root-level mount (for internal router paths like /identity, /prescriptions, etc.)
all_routers = [
    identity_router,
    documents_router,
    discovery_router,
    hospital_router,
    summary_router,
    prescription_router,
    fhir_router,
    intake_router,
    safety_router,
    voice_router,
    emergency_router,
]

for r in all_routers:
    app.include_router(r)
    # Also mount under /api prefix for Track C and external API clients
    app.include_router(r, prefix="/api")


@app.get("/", tags=["Health"])
@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok"}