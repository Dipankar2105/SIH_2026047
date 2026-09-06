import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ConsentCreate(BaseModel):
    patient_id: uuid.UUID
    consent_type: str = "health_record_sharing"
    purpose: Optional[str] = "Kiosk Consultation & Treatment"
    scope: Optional[str] = "view_records"
    expires_in_hours: Optional[int] = 24


class ConsentResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    consent_type: str
    granted: bool
    purpose: Optional[str] = None
    scope: Optional[str] = None
    granted_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConsentStatusResponse(BaseModel):
    patient_id: uuid.UUID
    is_valid: bool
    consent_type: str
    granted: bool
    expired: bool
    revoked: bool
    scope: Optional[str] = None
