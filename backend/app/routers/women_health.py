from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import require_roles
from app.schemas.women_timeline import (
    WomenTimelineCreate,
    WomenTimelineResponse,
    GynaeClinicalDigest,
)
from app.services.female_health.women_health_service import (
    women_health_service,
    GYNAE_SPECIALTIES,
)


router = APIRouter(prefix="/api/women-health", tags=["Lifelong Women's Health"])


@router.post("/timeline/log", response_model=WomenTimelineResponse, status_code=status.HTTP_201_CREATED)
def log_timeline_event(
    payload: WomenTimelineCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("patient", "doctor")),
):
    result = women_health_service.log_timeline_event(
        db,
        data=payload.model_dump(exclude_unset=True),
    )
    return WomenTimelineResponse.model_validate(result)


@router.get("/timeline/patient/{patient_id}", response_model=list[WomenTimelineResponse])
def get_patient_timeline(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("patient", "doctor")),
):
    role = current_user.get("role")
    specialty = current_user.get("specialty")

    if role == "patient" and str(current_user["sub"]) == str(patient_id):
        events = women_health_service.get_patient_timeline(
            db, patient_id=patient_id, requesting_doctor_specialty="Gynecology"
        )
    else:
        events = women_health_service.get_patient_timeline(
            db, patient_id=patient_id, requesting_doctor_specialty=specialty
        )
    return [WomenTimelineResponse.model_validate(e) for e in events]


@router.get("/gynae-digest/{patient_id}", response_model=GynaeClinicalDigest)
def get_gynae_clinical_digest(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    specialty = current_user.get("specialty")
    if specialty not in GYNAE_SPECIALTIES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Gynae Clinical Digest requires Gynecologist/Obstetrician specialty",
        )
    result = women_health_service.generate_gynae_clinical_digest(db, patient_id=patient_id)
    return GynaeClinicalDigest(**result)
