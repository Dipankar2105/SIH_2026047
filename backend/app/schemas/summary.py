from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SummaryGenerateRequest(BaseModel):
    kiosk_session_id: str
    patient_id: str

class SummaryResponse(BaseModel):
    id: str
    patient_id: str
    kiosk_session_id: Optional[str] = None
    summary_type: str
    chief_complaints_summary: str
    clinical_history_summary: Optional[str] = None
    recommended_specialty: Optional[str] = None
    ai_generated_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
