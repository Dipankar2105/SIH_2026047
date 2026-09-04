from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LoginRequest(BaseModel):
    phone_number: str
    password_or_otp: str
    role: str = "PATIENT"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    role: str
    user_id: str

class KioskSessionCreate(BaseModel):
    kiosk_device_id: str
    hospital_id: Optional[str] = None
    language: Optional[str] = "en"

class KioskSessionResponse(BaseModel):
    id: str
    kiosk_device_id: str
    status: str
    current_step: int
    is_emergency: bool
    triage_priority: str
    created_at: datetime

    class Config:
        from_attributes = True
