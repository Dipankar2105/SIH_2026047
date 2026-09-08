import uuid
from datetime import datetime
from typing import Optional, List, Any, Dict

from pydantic import BaseModel, ConfigDict


class DocumentCreate(BaseModel):
    patient_id: uuid.UUID
    document_type: str = "lab_report"
    file_name: str
    storage_path: str
    mime_type: Optional[str] = "application/pdf"
    ocr_text: Optional[str] = None
    ocr_data: Optional[Dict[str, Any] | List[Any]] = None


class DocumentResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    document_type: str
    file_name: str
    storage_path: str
    mime_type: Optional[str] = None
    ocr_text: Optional[str] = None
    ocr_data: Optional[Dict[str, Any] | List[Any]] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TimelineEvent(BaseModel):
    id: str
    event_type: str  # visit, document, prescription, summary
    date: datetime
    title: str
    details: Dict[str, Any]


class LongitudinalTimelineResponse(BaseModel):
    patient_id: uuid.UUID
    total_events: int
    events: List[TimelineEvent]


class UnifiedPatientRecord(BaseModel):
    patient_id: uuid.UUID
    profile: Dict[str, Any]
    visits: List[Dict[str, Any]]
    documents: List[Dict[str, Any]]
    prescriptions: List[Dict[str, Any]]
    appointments: List[Dict[str, Any]]
    summaries: List[Dict[str, Any]]


class DocumentShareRequest(BaseModel):
    patient_id: uuid.UUID
    consent_id: uuid.UUID
    recipient_id: uuid.UUID


class DocumentShareResponse(BaseModel):
    access_token: str
    expires_at: datetime
    message: str
