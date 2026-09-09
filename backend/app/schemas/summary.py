from uuid import UUID
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class SummaryGenerateRequest(BaseModel):
    patient_id: UUID
    session_id: UUID


class SummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    patient_id: UUID
    session_id: Optional[UUID] = None
    summary_text: str
    status: str
    doctor_id: Optional[UUID] = None
    summary_type: str
    created_at: str


class SummaryReviewRequest(BaseModel):
    action: str
    edited_text: Optional[str] = None
    rejection_reason: Optional[str] = None


class SummaryReviewResponse(BaseModel):
    summary_id: UUID
    action: str
    status: str
    message: str


class PatientSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    patient_id: UUID
    session_id: Optional[UUID] = None
    summary_text: str
    key_points: List[str] = []
    warning_signs: List[str] = []
    follow_up_info: str = ""
