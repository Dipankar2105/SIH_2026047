from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import Stringified


class TrustedCircleCreate(BaseModel):
    patient_id: UUID
    relative_name: str
    relative_phone: str
    relationship: str
    can_see_pregnancy: bool = False
    can_see_appointments: bool = True
    can_see_emergency_status: bool = True
    can_see_period_history: bool = False
    can_see_fertility: bool = False
    can_see_medications: bool = False


class TrustedCircleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Stringified
    patient_id: Stringified
    relative_name: str
    relative_phone: str
    relationship: str
    can_see_pregnancy: bool
    can_see_appointments: bool
    can_see_emergency_status: bool
    can_see_period_history: bool
    can_see_fertility: bool
    can_see_medications: bool
