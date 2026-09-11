from typing import Optional, List
from uuid import UUID
from datetime import date
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import Stringified


class WomenTimelineCreate(BaseModel):
    patient_id: UUID
    category: str
    event_date: date
    cycle_length_days: Optional[int] = None
    flow_intensity: Optional[str] = None
    pain_score: Optional[int] = None
    symptoms: Optional[List[str]] = Field(default_factory=list)
    pregnancy_trimester: Optional[str] = None
    privacy_level: Optional[str] = "gynae_only"
    notes: Optional[str] = None


class WomenTimelineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Stringified
    patient_id: Stringified
    category: str
    event_date: Stringified
    cycle_length_days: Optional[int] = None
    flow_intensity: Optional[str] = None
    pain_score: Optional[int] = None
    symptoms: List[str] = Field(default_factory=list)
    pregnancy_trimester: Optional[str] = None
    privacy_level: str
    notes: Optional[str] = None


class GynaeClinicalDigest(BaseModel):
    patient_id: Stringified
    average_cycle_length: Optional[float] = None
    cycle_variability_days: Optional[float] = None
    average_pain_score: Optional[float] = None
    heavy_bleeding_episodes_last_6mo: int = 0
    severe_pain_episodes_last_6mo: int = 0
    common_symptoms: List[str] = Field(default_factory=list)
    active_pregnancy: Optional[str] = None
    total_events_logged: int = 0
