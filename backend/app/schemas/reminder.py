from uuid import UUID
from typing import Optional, List, Dict
from pydantic import BaseModel, ConfigDict
from app.schemas.common import Stringified


class ReminderCreateRequest(BaseModel):
    prescription_id: Optional[UUID] = None
    patient_phone: Optional[str] = None
    notification_channel: str = 'push'
    meal_times: Optional[Dict[str, str]] = None


class ReminderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    prescription_id: UUID
    reminder_time: Stringified
    message: Optional[str] = None
    status: str
    sent: bool


class ReminderListResponse(BaseModel):
    patient_id: UUID
    reminders: List[ReminderResponse] = []
    active_count: int = 0
