from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReminderCreate(BaseModel):
    patient_id: str
    title: str
    reminder_time: datetime
    channel: str = "APP"

class ReminderResponse(BaseModel):
    id: str
    patient_id: str
    title: str
    reminder_time: datetime
    channel: str
    is_sent: bool
    is_acknowledged: bool
    created_at: datetime

    class Config:
        from_attributes = True
