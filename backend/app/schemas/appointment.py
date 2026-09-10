import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict


class SymptomRecommendationRequest(BaseModel):
    symptoms: str
    patient_id: Optional[uuid.UUID] = None


class DoctorRecommendationItem(BaseModel):
    doctor_id: uuid.UUID
    name: str
    specialization: str
    qualification: Optional[str] = None
    hospital_name: Optional[str] = None
    match_score: float
    previously_visited: bool = False
    last_visit_date: Optional[datetime] = None


class DoctorRecommendationResponse(BaseModel):
    recommended_specialty: str
    doctors: List[DoctorRecommendationItem]


class DoctorResponse(BaseModel):
    id: uuid.UUID
    hospital_id: uuid.UUID
    name: str
    specialization: str
    qualification: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    previously_visited: bool = False
    last_visit_date: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SlotListingResponse(BaseModel):
    doctor_id: uuid.UUID
    available_slots: List[str]  # ISO format timestamps


class AppointmentCreate(BaseModel):
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    hospital_id: uuid.UUID
    appointment_time: datetime
    reason: Optional[str] = None
    notes: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    hospital_id: uuid.UUID
    appointment_time: datetime
    status: str
    reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
