import uuid
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.document import Document
from app.models.patient import Patient
from app.models.visit_history import VisitHistory
from app.models.prescription import Prescription
from app.models.summary import Summary
from app.models.consent import Consent
from app.schemas.document import DocumentCreate, LongitudinalTimelineResponse, TimelineEvent, UnifiedPatientRecord, DocumentShareRequest, DocumentShareResponse
from app.services.identity.consent_service import enforce_valid_consent
from app.services.identity.patient_service import get_patient


def upload_document(db: Session, doc_in: DocumentCreate) -> Document:
    # Ensure patient exists
    get_patient(db, doc_in.patient_id)

    doc = Document(
        patient_id=doc_in.patient_id,
        document_type=doc_in.document_type,
        file_name=doc_in.file_name,
        storage_path=doc_in.storage_path,
        mime_type=doc_in.mime_type,
        ocr_text=doc_in.ocr_text,
        status="processed",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def get_patient_documents(db: Session, patient_id: uuid.UUID, check_consent: bool = True) -> List[Document]:
    if check_consent:
        enforce_valid_consent(db, patient_id)
    return db.query(Document).filter(Document.patient_id == patient_id).order_by(Document.created_at.desc()).all()


def get_longitudinal_timeline(db: Session, patient_id: uuid.UUID, check_consent: bool = True) -> LongitudinalTimelineResponse:
    if check_consent:
        enforce_valid_consent(db, patient_id)

    events: List[TimelineEvent] = []

    # 1. Visits
    visits = db.query(VisitHistory).filter(VisitHistory.patient_id == patient_id).all()
    for v in visits:
        events.append(
            TimelineEvent(
                id=str(v.id),
                event_type="visit",
                date=v.visit_date or v.created_at,
                title=f"Doctor Visit - Diagnosis: {v.diagnosis or 'Consultation'}",
                details={
                    "diagnosis": v.diagnosis,
                    "treatment": v.treatment,
                    "notes": v.notes,
                    "doctor_id": str(v.doctor_id) if v.doctor_id else None,
                    "hospital_id": str(v.hospital_id) if v.hospital_id else None,
                },
            )
        )

    # 2. Documents
    docs = db.query(Document).filter(Document.patient_id == patient_id).all()
    for d in docs:
        events.append(
            TimelineEvent(
                id=str(d.id),
                event_type="document",
                date=d.created_at,
                title=f"Document Uploaded ({d.document_type}): {d.file_name}",
                details={
                    "document_type": d.document_type,
                    "file_name": d.file_name,
                    "storage_path": d.storage_path,
                    "mime_type": d.mime_type,
                    "ocr_text": d.ocr_text,
                },
            )
        )

    # 3. Prescriptions
    prescriptions = db.query(Prescription).filter(Prescription.patient_id == patient_id).all()
    for p in prescriptions:
        events.append(
            TimelineEvent(
                id=str(p.id),
                event_type="prescription",
                date=p.prescribed_at or p.created_at,
                title=f"Prescription Issued (Status: {p.status})",
                details={
                    "status": p.status,
                    "notes": p.notes,
                    "doctor_id": str(p.doctor_id) if p.doctor_id else None,
                },
            )
        )

    # 4. Summaries
    summaries = db.query(Summary).filter(Summary.patient_id == patient_id).all()
    for s in summaries:
        events.append(
            TimelineEvent(
                id=str(s.id),
                event_type="summary",
                date=s.created_at,
                title="Clinical Summary",
                details={
                    "summary_text": s.summary_text,
                    "session_id": str(s.session_id) if s.session_id else None,
                },
            )
        )

    # Sort events in chronological order (most recent first)
    events.sort(key=lambda e: e.date, reverse=True)

    return LongitudinalTimelineResponse(
        patient_id=patient_id,
        total_events=len(events),
        events=events,
    )


def get_unified_patient_record(db: Session, patient_id: uuid.UUID, check_consent: bool = True) -> UnifiedPatientRecord:
    if check_consent:
        enforce_valid_consent(db, patient_id)

    patient = get_patient(db, patient_id)
    timeline = get_longitudinal_timeline(db, patient_id, check_consent=False)

    visits_data = [e.details for e in timeline.events if e.event_type == "visit"]
    docs_data = [e.details for e in timeline.events if e.event_type == "document"]
    prescriptions_data = [e.details for e in timeline.events if e.event_type == "prescription"]
    summaries_data = [e.details for e in timeline.events if e.event_type == "summary"]

    profile_dict = {
        "id": str(patient.id),
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "date_of_birth": str(patient.date_of_birth) if patient.date_of_birth else None,
        "gender": patient.gender,
        "phone": patient.phone,
        "email": patient.email,
        "address": patient.address,
        "preferred_language": patient.preferred_language or "en",
        "abha_id": patient.abha_id,
        "abha_address": patient.abha_address,
    }

    return UnifiedPatientRecord(
        patient_id=patient_id,
        profile=profile_dict,
        visits=visits_data,
        documents=docs_data,
        prescriptions=prescriptions_data,
        appointments=[],
        summaries=summaries_data,
    )


def share_document_via_consent(db: Session, share_req: DocumentShareRequest) -> DocumentShareResponse:
    from datetime import datetime, timezone, timedelta
    from app.core.security import create_access_token
    
    consent = db.query(Consent).filter(Consent.id == share_req.consent_id).first()
    if not consent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consent not found")
        
    if consent.patient_id != share_req.patient_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Consent does not belong to the patient")

    now = datetime.now(timezone.utc)
    if not consent.granted or consent.revoked_at is not None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied: Patient consent is revoked")
        
    if consent.expires_at is not None and consent.expires_at < now:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied: Patient consent is expired")

    # Time-boxed access grant (e.g. 1 hour)
    expires_delta = timedelta(hours=1)
    expires_at = now + expires_delta
    
    # Generate token
    token = create_access_token(
        data={"sub": str(share_req.recipient_id), "patient_id": str(share_req.patient_id), "consent_id": str(share_req.consent_id)},
        expires_in_seconds=int(expires_delta.total_seconds())
    )

    return DocumentShareResponse(
        access_token=token,
        expires_at=expires_at,
        message="Access granted via consent"
    )
