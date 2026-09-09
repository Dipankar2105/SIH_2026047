from uuid import UUID
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class DocumentUploadRequest(BaseModel):
    patient_id: UUID
    document_type: str
    session_id: Optional[UUID] = None


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    patient_id: UUID
    document_type: str
    file_name: Optional[str] = None
    storage_path: Optional[str] = None
    mime_type: Optional[str] = None
    ocr_text: Optional[str] = None
    ocr_data: Optional[Dict[str, Any]] = None
    status: str
    created_at: str


class OCRResult(BaseModel):
    extracted_data: Dict[str, Any]
    confidence: float
    method: str
    needs_human_verification: bool
    source_refs: Dict[str, Any]


class DocumentVerifyRequest(BaseModel):
    corrections: List[Dict[str, Any]]


class DocumentVerifyResponse(BaseModel):
    document_id: UUID
    status: str
    corrections_applied: int


class DocumentSourceResponse(BaseModel):
    document_id: UUID
    file_name: Optional[str] = None
    extraction_method: str
    overall_confidence: float
    source_refs: Dict[str, Any]
    field_count: int
