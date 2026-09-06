import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.rbac import verify_patient_access
from app.services.documents.document_service import (
    upload_document,
    get_patient_documents,
    get_longitudinal_timeline,
    get_unified_patient_record,
    share_document_via_consent,
)
from app.schemas.document import (
    DocumentCreate,
    DocumentResponse,
    LongitudinalTimelineResponse,
    UnifiedPatientRecord,
    DocumentShareRequest,
    DocumentShareResponse,
)

router = APIRouter(prefix="/documents", tags=["Digital Health Locker"])


@router.post("/upload", response_model=DocumentResponse)
def upload_document_endpoint(
    doc_in: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, doc_in.patient_id)
    return upload_document(db, doc_in)


@router.get("/patient/{patient_id}", response_model=List[DocumentResponse])
def get_patient_documents_endpoint(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, patient_id)
    return get_patient_documents(db, patient_id, check_consent=True)


@router.get("/timeline/{patient_id}", response_model=LongitudinalTimelineResponse)
def get_timeline_endpoint(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, patient_id)
    return get_longitudinal_timeline(db, patient_id, check_consent=True)


@router.get("/unified/{patient_id}", response_model=UnifiedPatientRecord)
def get_unified_record_endpoint(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, patient_id)
    return get_unified_patient_record(db, patient_id, check_consent=True)


@router.post("/share", response_model=DocumentShareResponse)
def share_document_endpoint(
    share_req: DocumentShareRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, share_req.patient_id)
    return share_document_via_consent(db, share_req)
