import uuid
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.common import Stringified


class SummaryCreate(BaseModel):
    patient_id: uuid.UUID
    session_id: Optional[uuid.UUID] = None
    doctor_id: Optional[uuid.UUID] = None
    summary_type: str = "clinical"
    summary_text: str
    status: str = "draft"


class SummaryUpdate(BaseModel):
    summary_text: Optional[str] = None
    status: Optional[str] = None
    doctor_id: Optional[uuid.UUID] = None


class SummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    session_id: Optional[uuid.UUID] = None
    summary_text: str
    status: str = "draft"
    doctor_id: Optional[uuid.UUID] = None
    summary_type: str = "clinical"
    created_at: Stringified


class SummaryGenerateRequest(BaseModel):
    patient_id: uuid.UUID
    session_id: Optional[uuid.UUID] = None
    doctor_id: Optional[uuid.UUID] = None
    recommended_specialty: Optional[str] = "General Medicine"


class SummaryReviewRequest(BaseModel):
    action: Optional[str] = "accept"
    status: Optional[str] = None
    doctor_notes: Optional[str] = None
    edited_text: Optional[str] = None
    rejection_reason: Optional[str] = None


class SummaryReviewResponse(BaseModel):
    summary_id: uuid.UUID
    action: str
    status: str
    message: str


class PatientSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    session_id: Optional[uuid.UUID] = None
    summary_text: str
    plain_text: Optional[str] = None
    key_points: List[str] = []

    def model_post_init(self, __context: Any) -> None:
        if not self.plain_text and self.summary_text:
            self.plain_text = self.summary_text.replace("[PATIENT_SUMMARY]\n", "").replace("[DOCTOR_FINAL]\n", "").strip()
    warning_signs: List[str] = []
    follow_up_info: str = ""
