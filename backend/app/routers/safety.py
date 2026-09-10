import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.rbac import require_roles
from app.services.safety import red_flag_service

router = APIRouter(prefix="/safety", tags=["Clinical Safety & Triage"])


class SafetyCheckRequest(BaseModel):
    message: str
    language: Optional[str] = "en"


class SafetyCheckResponse(BaseModel):
    message: str
    is_emergency: bool
    severity: str
    recommended_specialty: Optional[str]
    matched_category: Optional[str]


class RedFlagResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    flag_type: str
    description: Optional[str]
    severity: str
    triggered: bool

    model_config = ConfigDict(from_attributes=True)


@router.post("/check", response_model=SafetyCheckResponse)
def evaluate_message_safety(req: SafetyCheckRequest):
    """
    Evaluates clinical text for emergency red-flag conditions.
    """
    is_em, sev, spec, cat = red_flag_service.detect_red_flags(req.message)
    return SafetyCheckResponse(
        message=req.message,
        is_emergency=is_em,
        severity=sev,
        recommended_specialty=spec,
        matched_category=cat,
    )


@router.get("/red-flags", response_model=List[RedFlagResponse])
def get_active_red_flags(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor", "hospital_admin", "kiosk_operator", "super_admin")),
):
    """
    Retrieves triggered emergency red-flags for doctor and triage alert dashboards.
    """
    flags = red_flag_service.list_active_red_flags(db, limit)
    return [RedFlagResponse.model_validate(f) for f in flags]


@router.get("/red-flags/session/{session_id}", response_model=List[RedFlagResponse])
def get_session_red_flags(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Retrieves red-flags triggered within a specific kiosk/clinical session.
    """
    flags = red_flag_service.get_session_red_flags(db, session_id)
    return [RedFlagResponse.model_validate(f) for f in flags]
