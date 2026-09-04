from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime

class PatientBase(BaseModel):
    full_name: str
    phone_number: str
    gender: str
    email: Optional[EmailStr] = None
    date_of_birth: Optional[date] = None
    age: Optional[int] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    abha_number: Optional[str] = None
    abha_address: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ABHALookupRequest(BaseModel):
    abha_number_or_address: str
