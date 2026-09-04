from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class DoctorBase(BaseModel):
    full_name: str
    registration_number: str
    specialization: str
    experience_years: int = 0
    phone_number: str
    email: EmailStr
    hospital_id: Optional[str] = None
    bio: Optional[str] = None

class DoctorCreate(DoctorBase):
    pass

class DoctorResponse(DoctorBase):
    id: str
    is_available: bool
    created_at: datetime

    class Config:
        from_attributes = True
