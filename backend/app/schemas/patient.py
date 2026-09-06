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
