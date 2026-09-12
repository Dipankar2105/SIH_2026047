import uuid
from datetime import date, datetime
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, Field, ConfigDict


class PatientCreate(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    preferred_language: Optional[str] = "en"
    abha_id: Optional[str] = None
    abha_address: Optional[str] = None


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    preferred_language: Optional[str] = None
    abha_id: Optional[str] = None
    abha_address: Optional[str] = None


class PatientResponse(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    preferred_language: str = "en"
    abha_id: Optional[str] = None
    abha_address: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LanguageSelection(BaseModel):
    preferred_language: str = Field(..., description="ISO 639-1 language code e.g. en, hi, ta, te, kn, mr, bn")


class LanguagePackResponse(BaseModel):
    language_code: str
    translations: Dict[str, str]


class MobileOtpRequest(BaseModel):
    mobile: str = Field(..., pattern=r"^\d{10}$", description="10-digit Indian mobile phone number")


class MobileOtpVerify(BaseModel):
    txn_id: str = Field(..., description="Transaction ID from the request-otp response")
    otp: str = Field(..., min_length=4, max_length=6, description="4 to 6 digit OTP")
    patient_id: Optional[uuid.UUID] = Field(None, description="Optional patient UUID to link upon verification")


class MobileOtpResponse(BaseModel):
    txnId: str
    message: str


class TranslateRequest(BaseModel):
    text: str = Field(..., description="Text to translate")
    target_language: str = Field(..., description="Target ISO 639-1 code e.g. hi, mr, ta, te, kn, bn, en")
    source_language: Optional[str] = Field("en", description="Source language code, default en")


class TranslateResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str

