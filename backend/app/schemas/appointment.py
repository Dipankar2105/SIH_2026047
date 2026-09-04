from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AppointmentCreate(BaseModel):
    patient_id: str
    doctor_id: str
    hospital_id: str
    appointment_time: datetime
    reason: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    hospital_id: str
    appointment_time: datetime
    status: str
    token_number: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
