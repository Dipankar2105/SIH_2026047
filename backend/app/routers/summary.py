import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.rbac import require_roles, verify_patient_access
from app.models.summary import Summary
from app.services.summary.summary_service import summary_service
from app.schemas.summary import (
    SummaryCreate,
    SummaryUpdate,
    SummaryGenerateRequest,
    SummaryResponse,
    SummaryReviewRequest,
    SummaryReviewResponse,
    PatientSummaryResponse,
)

router = APIRouter(prefix="/summary", tags=["Clinical Summaries"])


@router.post("", response_model=SummaryResponse, status_code=status.HTTP_201_CREATED)
def create_manual_summary_endpoint(
    payload: SummaryCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor", "hospital_admin", "super_admin")),
):
    verify_patient_access(current_user, payload.patient_id, db=db)
    doctor_id = current_user.get("sub")
    doc_uuid = None
    if doctor_id:
        try:
            doc_uuid = uuid.UUID(doctor_id)
        except Exception:
            pass
        if doc_uuid:
            from app.models.doctor import Doctor
            if not db.get(Doctor, doc_uuid):
                doc_uuid = None
    summary = Summary(
        patient_id=payload.patient_id,
        session_id=payload.session_id,
        doctor_id=doc_uuid or payload.doctor_id,
        summary_text=payload.summary_text,
        summary_type=payload.summary_type or "clinical",
        status=payload.status or "draft",
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)
    return SummaryResponse.model_validate(summary)


@router.post("/generate", response_model=SummaryResponse, status_code=status.HTTP_201_CREATED)
def generate_clinical_summary_endpoint(
    payload: SummaryGenerateRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor", "hospital_admin", "super_admin")),
):
    verify_patient_access(current_user, payload.patient_id, db=db)
    doctor_id = current_user.get("sub")
    result = summary_service.generate_clinical_summary(
        db,
        patient_id=str(payload.patient_id),
        session_id=str(payload.session_id) if payload.session_id else None,
        doctor_id=doctor_id,
    )
    if not request.url.path.startswith("/api/"):
        response.status_code = status.HTTP_200_OK
    else:
        response.status_code = status.HTTP_201_CREATED
    return SummaryResponse.model_validate(result)


@router.get("/session/{session_id}", response_model=SummaryResponse)
def get_latest_session_summary_endpoint(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor", "hospital_admin", "super_admin")),
):
    result = summary_service.get_latest_session_summary(db, session_id=session_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No summaries found for session")
    return SummaryResponse.model_validate(result)


@router.post("/{summary_id}/review", response_model=SummaryReviewResponse)
def review_summary_endpoint(
    summary_id: str,
    payload: SummaryReviewRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor", "hospital_admin", "super_admin")),
):
    doctor_id = current_user.get("sub")
    raw_action = payload.action or payload.status or "accept"
    if raw_action.lower() in ["approved", "approve", "accept", "accepted"]:
        action = "accept"
    elif raw_action.lower() in ["reject", "rejected"]:
        action = "reject"
    elif raw_action.lower() in ["edit", "edited"]:
        action = "edit"
    else:
        action = raw_action

    try:
        result = summary_service.review_summary(
            db,
            summary_id=summary_id,
            action=action,
            doctor_id=doctor_id,
            edited_text=payload.edited_text,
            rejection_reason=payload.rejection_reason or payload.doctor_notes,
        )
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Summary not found")
    return SummaryReviewResponse(**result)


@router.post("/patient-summary/{session_id}", response_model=PatientSummaryResponse, status_code=status.HTTP_201_CREATED)
def generate_patient_summary_endpoint(
    session_id: str,
    patient_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor", "hospital_admin", "super_admin")),
):
    doctor_id = current_user.get("sub")
    result = summary_service.generate_patient_summary(
        db, patient_id=patient_id, session_id=session_id, doctor_id=doctor_id
    )
    return PatientSummaryResponse.model_validate(result)


@router.get("/patient-summary/{session_id}", response_model=PatientSummaryResponse)
def get_patient_summary_endpoint(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = summary_service.get_latest_patient_summary(db, session_id=session_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient summary not found")
    return PatientSummaryResponse.model_validate(result)


@router.get("/patient/{patient_id}", response_model=List[SummaryResponse])
def get_patient_summaries_endpoint(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, patient_id, db=db)
    summaries = summary_service.get_patient_summaries(db, patient_id)
    return [SummaryResponse.model_validate(s) for s in summaries]


@router.get("/{summary_id}", response_model=SummaryResponse)
def get_summary_endpoint(
    summary_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = summary_service.get_summary(db, summary_id=summary_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Summary not found")
    verify_patient_access(current_user, result.patient_id, db=db)
    return SummaryResponse.model_validate(result)


@router.put("/{summary_id}", response_model=SummaryResponse)
def update_summary_endpoint(
    summary_id: uuid.UUID,
    summary_in: SummaryUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor", "hospital_admin", "super_admin")),
):
    summary = summary_service.get_summary(db, summary_id)
    if not summary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Summary not found")
    if summary_in.summary_text is not None:
        summary.summary_text = summary_in.summary_text
    if summary_in.status is not None:
        summary.status = summary_in.status
    if summary_in.doctor_id is not None:
        summary.doctor_id = summary_in.doctor_id
    db.commit()
    db.refresh(summary)
    return SummaryResponse.model_validate(summary)
