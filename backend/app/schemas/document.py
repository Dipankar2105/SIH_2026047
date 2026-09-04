from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentUploadResponse(BaseModel):
    id: str
    patient_id: str
    title: str
    document_type: str
    file_path: str
    ocr_status: str

class OCRProcessingResult(BaseModel):
    document_id: str
    status: str
    extracted_text: str
    confidence_score: float = 0.95
