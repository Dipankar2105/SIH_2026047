from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import documents, fhir, prescription, summary, emergency, women_health, trusted_circle

app = FastAPI(title="AarogyaFlow Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router)
app.include_router(summary.router)
app.include_router(prescription.router)
app.include_router(fhir.router)
app.include_router(emergency.router)
app.include_router(women_health.router)
app.include_router(trusted_circle.router)

# TODO: Track A will add: identity, hospital, discovery
# TODO: Track B will add: intake, voice, safety


@app.get("/")
async def root():
    return {"status": "ok"}


@app.get("/api/health")
async def api_health():
    return {"status": "ok", "db": "connected", "ocr": "ready"}
