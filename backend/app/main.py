from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
import app.models  # Import all models to ensure metadata registration

# Create tables in dev mode automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check Route
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENV
    }

# Include API Routers
from app.routers import (
    identity,
    discovery,
    hospital,
    intake,
    safety,
    voice,
    documents,
    summary,
    prescription,
    fhir
)

app.include_router(identity.router, prefix=settings.API_V1_STR)
app.include_router(discovery.router, prefix=settings.API_V1_STR)
app.include_router(hospital.router, prefix=settings.API_V1_STR)
app.include_router(intake.router, prefix=settings.API_V1_STR)
app.include_router(safety.router, prefix=settings.API_V1_STR)
app.include_router(voice.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(summary.router, prefix=settings.API_V1_STR)
app.include_router(prescription.router, prefix=settings.API_V1_STR)
app.include_router(fhir.router, prefix=settings.API_V1_STR)
