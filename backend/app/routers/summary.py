from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import require_roles
from app.schemas.summary import (
    SummaryGenerateRequest,
    SummaryResponse,
    SummaryReviewRequest,
    SummaryReviewResponse,
    PatientSummaryResponse,
)
from app.services.summary.summary_service import summary_service


router = APIRouter(prefix="/api/summary", tags=["Clinical Summaries"])


@router.post("/generate", response_model=SummaryResponse, status_code=status.HTTP_201_CREATED)
def generate_clinical_summary(
    payload: SummaryGenerateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    doctor_id = current_user["sub"]
    result = summary_service.generate_clinical_summary(
        db, patient_id=str(payload.patient_id), session_id=str(payload.session_id), doctor_id=doctor_id
    )
    return SummaryResponse.model_validate(result)


@router.get("/{summary_id}", response_model=SummaryResponse)
def get_summary(
    summary_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    result = summary_service.get_summary(db, summary_id=summary_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Summary not found")
    return SummaryResponse.model_validate(result)


@router.get("/session/{session_id}", response_model=SummaryResponse)
def get_latest_session_summary(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    result = summary_service.get_latest_session_summary(db, session_id=session_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No summaries found for session")
    return SummaryResponse.model_validate(result)


@router.post("/{summary_id}/review", response_model=SummaryReviewResponse)
def review_summary(
    summary_id: str,
    payload: SummaryReviewRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    doctor_id = current_user["sub"]
    try:
        result = summary_service.review_summary(
            db,
            summary_id=summary_id,
            action=payload.action,
            doctor_id=doctor_id,
            edited_text=payload.edited_text,
            rejection_reason=payload.rejection_reason,
        )
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Summary not found")
    return SummaryReviewResponse(**result)


@router.post("/patient-summary/{session_id}", response_model=PatientSummaryResponse, status_code=status.HTTP_201_CREATED)
def generate_patient_summary(
    session_id: str,
    patient_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    doctor_id = current_user["sub"]
    result = summary_service.generate_patient_summary(
        db, patient_id=patient_id, session_id=session_id, doctor_id=doctor_id
    )
    return PatientSummaryResponse.model_validate(result)


@router.get("/patient-summary/{session_id}", response_model=PatientSummaryResponse)
def get_patient_summary(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    result = summary_service.get_latest_patient_summary(db, session_id=session_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient summary not found")
    return PatientSummaryResponse.model_validate(result)
