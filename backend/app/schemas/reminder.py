from uuid import UUID
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class ReminderCreateRequest(BaseModel):
    prescription_id: UUID
    patient_phone: Optional[str] = None
    notification_channel: str = 'push'

class ReminderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    prescription_id: UUID
    reminder_time: str
    message: Optional[str] = None
    status: str
    sent: bool

class ReminderListResponse(BaseModel):
    patient_id: UUID
    reminders: List[ReminderResponse] = []
    active_count: int = 0
