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

app = FastAPI(title="MediKiosk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(identity_router)
app.include_router(documents_router)
app.include_router(discovery_router)
app.include_router(hospital_router)
app.include_router(summary_router)
app.include_router(prescription_router)
app.include_router(fhir_router)
app.include_router(intake_router)


@app.get("/health")
def health():
    return {"status": "ok"}