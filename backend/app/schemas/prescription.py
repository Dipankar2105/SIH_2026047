from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PrescriptionItemBase(BaseModel):
    drug_name: str
    dosage: str
    frequency: str
    duration_days: int
    instructions: Optional[str] = None

class PrescriptionCreate(BaseModel):
    patient_id: str
    doctor_id: str
    diagnosis: str
    notes: Optional[str] = None
    items: List[PrescriptionItemBase]

class PrescriptionItemResponse(PrescriptionItemBase):
    id: str

    class Config:
        from_attributes = True

class PrescriptionResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    diagnosis: str
    notes: Optional[str] = None
    items: List[PrescriptionItemResponse]
    created_at: datetime

    class Config:
        from_attributes = True
