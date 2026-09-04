from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class HospitalBase(BaseModel):
    name: str
    facility_id: Optional[str] = None
    address: str
    city: str
    state: str
    pincode: str
    contact_number: str
    email: Optional[EmailStr] = None

class HospitalCreate(HospitalBase):
    pass

class HospitalResponse(HospitalBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
