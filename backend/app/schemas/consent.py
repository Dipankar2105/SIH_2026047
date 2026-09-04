from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ConsentCreate(BaseModel):
    patient_id: str
    purpose: str
    hi_types: List[str]

class ConsentResponse(BaseModel):
    id: str
    patient_id: str
    consent_id: str
    purpose: str
    status: str
    granted_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    hi_types: str

    class Config:
        from_attributes = True
