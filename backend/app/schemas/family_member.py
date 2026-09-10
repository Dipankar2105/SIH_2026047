from typing import Optional
from pydantic import BaseModel
import uuid
from datetime import datetime
from app.schemas.patient import PatientResponse


class FamilyMemberCreate(BaseModel):
    dependent_patient_id: uuid.UUID
    relationship: str


class FamilyMemberResponse(BaseModel):
    id: uuid.UUID
    primary_patient_id: uuid.UUID
    dependent_patient_id: uuid.UUID
    relationship: str
    created_at: datetime
    dependent_patient: Optional[PatientResponse] = None

    class Config:
        from_attributes = True
