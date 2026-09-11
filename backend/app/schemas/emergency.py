from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import Stringified


class EmergencyProfileCreate(BaseModel):
    patient_id: UUID
    blood_group: Optional[str] = None
    known_allergies: Optional[List[str]] = Field(default_factory=list)
    critical_conditions: Optional[List[str]] = Field(default_factory=list)
    active_medications: Optional[List[str]] = Field(default_factory=list)
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    preferred_hospital: Optional[str] = None


class EmergencyProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Stringified
    patient_id: Stringified
    qr_token: str
    blood_group: Optional[str] = None
    known_allergies: List[str] = Field(default_factory=list)
    critical_conditions: List[str] = Field(default_factory=list)
    active_medications: List[str] = Field(default_factory=list)
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    preferred_hospital: Optional[str] = None
    is_active: bool
    created_at: Stringified


class EmergencyCardPublicResponse(BaseModel):
    patient_name: str
    abha_id: Optional[str] = None
    blood_group: Optional[str] = None
    known_allergies: List[str] = Field(default_factory=list)
    active_medications: List[str] = Field(default_factory=list)
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    preferred_hospital: Optional[str] = None
