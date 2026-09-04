from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ResponseWrapper
from app.schemas.document import DocumentUploadResponse
from app.services.documents.document_service import document_service

router = APIRouter(prefix="/documents", tags=["Medical Documents & OCR"])

@router.post("/upload", response_model=ResponseWrapper[DocumentUploadResponse])
async def upload_document(
    patient_id: str = Form(...),
    title: str = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    saved_path = f"/tmp/{file.filename}"
    doc = document_service.upload_document(
        db=db,
        patient_id=patient_id,
        title=title,
        document_type=document_type,
        file_path=saved_path
    )
    return ResponseWrapper(data=doc, message="Document uploaded and OCR processed")
