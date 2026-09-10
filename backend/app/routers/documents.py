import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.rbac import require_roles, verify_patient_access
from app.services.documents.document_service import (
    document_service,
    upload_document,
    get_patient_documents,
    get_longitudinal_timeline,
    get_unified_patient_record,
    share_document_via_consent,
)
from app.schemas.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentVerifyRequest,
    DocumentVerifyResponse,
    DocumentSourceResponse,
    LongitudinalTimelineResponse,
    UnifiedPatientRecord,
    DocumentShareRequest,
    DocumentShareResponse,
)

router = APIRouter(prefix="/documents", tags=["Digital Health Locker"])


@router.post("/upload", response_model=DocumentResponse)
async def upload_document_endpoint(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Accepts both multipart/form-data file uploads (Track C, status 201) and JSON metadata uploads (Track A, status 200).
    """
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        response.status_code = status.HTTP_201_CREATED
        form = await request.form()
        file = form.get("file")
        patient_id = form.get("patient_id")
        document_type = form.get("document_type") or "lab_report"
        session_id = form.get("session_id")
        file_bytes = await file.read() if file else b""
        filename = getattr(file, "filename", "document.pdf")
        mime_type = getattr(file, "content_type", "application/pdf")

        if patient_id:
            verify_patient_access(current_user, patient_id, db=db)

        doc = document_service.upload_document(
            db,
            patient_id=patient_id,
            document_type=document_type,
            file_bytes=file_bytes,
            filename=filename,
            mime_type=mime_type,
            session_id=session_id,
        )
        return DocumentResponse.model_validate(doc)
    else:
        body = await request.json()
        doc_in = DocumentCreate(**body)
        verify_patient_access(current_user, doc_in.patient_id, db=db)
        doc = document_service.upload_document(db, doc_in=doc_in)
        return DocumentResponse.model_validate(doc)


@router.post("/{document_id}/verify", response_model=DocumentVerifyResponse)
def verify_document_endpoint(
    document_id: str,
    payload: DocumentVerifyRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor", "hospital_admin", "super_admin")),
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


@router.get("/{document_id}/sources", response_model=DocumentSourceResponse)
def get_sources_endpoint(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = document_service.get_sources(db, document_id=document_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return DocumentSourceResponse.model_validate(result)


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document_endpoint(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = document_service.get_document(db, document_id=document_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    verify_patient_access(current_user, result.patient_id, db=db)
    return DocumentResponse.model_validate(result)


@router.get("/patient/{patient_id}", response_model=List[DocumentResponse])
def get_patient_documents_endpoint(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, patient_id, db=db)
    results = document_service.get_patient_documents(db, patient_id=patient_id, check_consent=False)
    return [DocumentResponse.model_validate(r) for r in results]


@router.get("/timeline/{patient_id}", response_model=LongitudinalTimelineResponse)
def get_timeline_endpoint(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, patient_id, db=db)
    return get_longitudinal_timeline(db, patient_id, check_consent=True)


@router.get("/unified/{patient_id}", response_model=UnifiedPatientRecord)
def get_unified_record_endpoint(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, patient_id, db=db)
    return get_unified_patient_record(db, patient_id, check_consent=True)


@router.post("/share", response_model=DocumentShareResponse)
def share_document_endpoint(
    payload: DocumentShareRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, payload.patient_id, db=db)
    return share_document_via_consent(db, payload)
