import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, ConfigDict


class HospitalResponse(BaseModel):
    id: str
    name: str
    city: Optional[str] = None
    state: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class QueueItemCreate(BaseModel):
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    hospital_id: uuid.UUID
    reason: Optional[str] = "Kiosk Check-in"


class QueueItemResponse(BaseModel):
    appointment_id: uuid.UUID
    patient_id: uuid.UUID
    patient_name: str
    doctor_id: uuid.UUID
    doctor_name: str
    hospital_id: uuid.UUID
    queue_position: int
    status: str
    created_at: datetime


class QueueStatusUpdate(BaseModel):
    status: str  # waiting, in_consultation, completed, cancelled


class HospitalDashboardResponse(BaseModel):
    hospital_id: uuid.UUID
    hospital_name: str
    fleet_status: Dict[str, Any]  # total_kiosks, active_kiosks, inactive_kiosks
    queue_stats: Dict[str, Any]   # waiting_patients, in_consultation, completed_today
    daily_analytics: Dict[str, Any]
