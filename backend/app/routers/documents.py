from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import require_roles
from app.schemas.document import (
    DocumentResponse,
    DocumentVerifyRequest,
    DocumentVerifyResponse,
    DocumentSourceResponse,
)
from app.services.documents.document_service import document_service


router = APIRouter(prefix="/api/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_document(
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    document_type: str = Form(...),
    session_id: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    contents = file.file.read()
    result = document_service.upload_document(
        db,
        patient_id=patient_id,
        document_type=document_type,
        file_bytes=contents,
        filename=file.filename,
        mime_type=file.content_type or "application/octet-stream",
        session_id=session_id,
    )
    return DocumentResponse.model_validate(result)


@router.post("/{document_id}/verify", response_model=DocumentVerifyResponse)
def verify_document(
    document_id: str,
    payload: DocumentVerifyRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    try:
        result = document_service.verify_document(db, document_id=document_id, corrections=payload.corrections)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return DocumentVerifyResponse(
        document_id=result.id,
        status=result.status,
        corrections_applied=len(payload.corrections),
    )


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    result = document_service.get_document(db, document_id=document_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return DocumentResponse.model_validate(result)


@router.get("/{document_id}/sources", response_model=DocumentSourceResponse)
def get_sources(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    result = document_service.get_sources(db, document_id=document_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return DocumentSourceResponse.model_validate(result)


@router.get("/patient/{patient_id}", response_model=list[DocumentResponse])
def get_patient_documents(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    results = document_service.get_patient_documents(db, patient_id=patient_id)
    return [DocumentResponse.model_validate(r) for r in results]
