import uuid
from datetime import datetime
from typing import Optional, Dict, Any

from pydantic import BaseModel, ConfigDict


class KioskSessionCreate(BaseModel):
    kiosk_id: str
    session_duration_minutes: Optional[int] = 30
    temp_state: Optional[Dict[str, Any]] = None


class KioskSessionResponse(BaseModel):
    id: uuid.UUID
    kiosk_id: str
    session_id: Optional[uuid.UUID] = None
    status: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)


class KioskSessionEndResponse(BaseModel):
    id: uuid.UUID
    status: str
    ended_at: datetime
    temp_state_cleared: bool = True
