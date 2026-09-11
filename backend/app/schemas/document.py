import uuid
from datetime import datetime
from typing import Optional, List, Any, Dict, Union
from pydantic import BaseModel, ConfigDict
from app.schemas.common import Stringified


class DocumentUploadRequest(BaseModel):
    patient_id: uuid.UUID
    document_type: str
    session_id: Optional[uuid.UUID] = None


class DocumentCreate(BaseModel):
    patient_id: uuid.UUID
    document_type: str = "lab_report"
    file_name: Optional[str] = None
    storage_path: Optional[str] = None
    mime_type: Optional[str] = "application/pdf"
    ocr_text: Optional[str] = None
    ocr_data: Optional[Dict[str, Any] | List[Any]] = None
    session_id: Optional[uuid.UUID] = None


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    document_type: str
    file_name: Optional[str] = None
    storage_path: Optional[str] = None
    mime_type: Optional[str] = None
    ocr_text: Optional[str] = None
    ocr_data: Optional[Dict[str, Any] | List[Any]] = None
    status: str = "uploaded"
    created_at: Stringified


class OCRResult(BaseModel):
    extracted_data: Dict[str, Any] = {}
    confidence: float = 0.0
    method: str = "unknown"
    needs_human_verification: bool = False
    source_refs: Dict[str, Any] = {}


class DocumentVerifyRequest(BaseModel):
    corrections: List[Dict[str, Any]] = []


class DocumentVerifyResponse(BaseModel):
    document_id: uuid.UUID
    status: str
    corrections_applied: int


class DocumentSourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    document_id: uuid.UUID
    file_name: Optional[str] = None
    extraction_method: str = "unknown"
    overall_confidence: float = 0.0
    source_refs: Dict[str, Any] = {}
    field_count: int = 0


class TimelineEvent(BaseModel):
    id: str
    event_type: str
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
    share_id: str
    status: str
    message: str
    access_token: Optional[str] = None
    expires_at: Optional[datetime] = None
