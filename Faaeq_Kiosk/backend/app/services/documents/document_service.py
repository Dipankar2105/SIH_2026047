import copy
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.audit import audit_service
from app.models.document import Document
from app.models.patient import Patient
from app.models.visit_history import VisitHistory
from app.models.prescription import Prescription
from app.models.summary import Summary
from app.models.consent import Consent
from app.models.appointment import Appointment
from app.schemas.document import (
    DocumentCreate,
    LongitudinalTimelineResponse,
    TimelineEvent,
    UnifiedPatientRecord,
    DocumentShareRequest,
    DocumentShareResponse,
)
from app.services.identity.consent_service import enforce_valid_consent
from app.services.identity.patient_service import get_patient
from app.services.documents.ocr_service import extract_document_entities, ocr_service


class DocumentService:
    def upload_document(
        self,
        db: Session,
        patient_id: Any = None,
        document_type: str = "lab_report",
        file_bytes: Optional[bytes] = None,
        filename: Optional[str] = None,
        mime_type: Optional[str] = "application/pdf",
        session_id: Optional[Any] = None,
        doc_in: Optional[DocumentCreate] = None,
    ) -> Document:
        if doc_in is not None:
            patient_id = doc_in.patient_id
            document_type = doc_in.document_type
            filename = doc_in.file_name
            mime_type = doc_in.mime_type or "application/pdf"
            session_id = doc_in.session_id
            storage_path = doc_in.storage_path
            ocr_text = doc_in.ocr_text
            ocr_data = doc_in.ocr_data
        else:
            storage_path = None
            ocr_text = None
            ocr_data = None

        if isinstance(patient_id, str):
            try:
                patient_id = uuid.UUID(patient_id)
            except Exception:
                pass

        if isinstance(session_id, str):
            try:
                session_id = uuid.UUID(session_id)
            except Exception:
                pass

        if file_bytes is not None:
            storage_path = f"{patient_id}/{uuid.uuid4()}/{filename or 'document.pdf'}"
            try:
                from supabase import create_client
                supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
                supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET).upload(storage_path, file_bytes)
            except Exception:
                pass

            ocr_res = ocr_service.extract(file_bytes, filename or "document.pdf", mime_type or "application/pdf")
            extracted_text = ocr_res.get("extracted_data", {}).get("text", "")
            ocr_text = ocr_text or extracted_text
            ocr_data = ocr_data or ocr_res
            doc_status = "extracted" if ocr_res.get("confidence", 0) >= 0.5 else "uploaded"
        else:
            if not ocr_text or not ocr_data:
                extracted = extract_document_entities(
                    text=ocr_text,
                    file_name=filename,
                    mime_type=mime_type,
                )
                ocr_text = ocr_text or extracted["ocr_text"]
                ocr_data = ocr_data or extracted["ocr_data"]
            doc_status = "processed"

        doc = Document(
            patient_id=patient_id,
            document_type=document_type,
            file_name=filename,
            storage_path=storage_path or f"documents/{patient_id}/{filename or 'file.pdf'}",
            mime_type=mime_type,
            ocr_text=ocr_text,
            ocr_data=ocr_data,
            status=doc_status,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        audit_service.log(
            db,
            actor_id=str(patient_id),
            actor_type="patient",
            action="CREATE",
            resource_type="document",
            resource_id=str(doc.id),
        )
        return doc

    def verify_document(self, db: Session, document_id: Any, corrections: list) -> Document:
        if isinstance(document_id, str):
            try:
                document_id = uuid.UUID(document_id)
            except Exception:
                pass

        doc = db.get(Document, document_id)
        if not doc:
            raise ValueError("Document not found")

        ocr_data = copy.deepcopy(doc.ocr_data) if isinstance(doc.ocr_data, dict) else {}
        if "structured" in ocr_data and isinstance(ocr_data["structured"], dict):
            structured = copy.deepcopy(ocr_data["structured"])
        else:
            structured = copy.deepcopy(ocr_data)

        for corr in corrections:
            field = corr.get("field") or corr.get("field_name")
            corrected = corr.get("value") if "value" in corr else corr.get("corrected_value")
            if field:
                structured[field] = corrected
        ocr_data["structured"] = structured
        doc.ocr_data = ocr_data

        doc.status = "verified"
        db.commit()
        db.refresh(doc)

        audit_service.log(
            db,
            actor_id="system",
            actor_type="system",
            action="VERIFY",
            resource_type="document",
            resource_id=str(doc.id),
        )
        return doc

    def get_document(self, db: Session, document_id: Any) -> Optional[Document]:
        if isinstance(document_id, str):
            try:
                document_id = uuid.UUID(document_id)
            except Exception:
                pass
        return db.get(Document, document_id)

    def get_sources(self, db: Session, document_id: Any) -> dict:
        doc = self.get_document(db, document_id)
        if not doc:
            return {}
        ocr_data = doc.ocr_data if isinstance(doc.ocr_data, dict) else {}
        structured = ocr_data.get("structured", {})
        field_count = len(structured) if isinstance(structured, dict) else 0

        return {
            "document_id": doc.id,
            "file_name": doc.file_name,
            "extraction_method": ocr_data.get("method", "hybrid_local"),
            "overall_confidence": float(ocr_data.get("confidence", 0.9)),
            "source_refs": ocr_data.get("source_refs", {}),
            "field_count": field_count,
        }

    def get_patient_documents(self, db: Session, patient_id: Any, check_consent: bool = False) -> List[Document]:
        if isinstance(patient_id, str):
            try:
                patient_id = uuid.UUID(patient_id)
            except Exception:
                pass
        if check_consent:
            enforce_valid_consent(db, patient_id)
        return db.query(Document).filter(Document.patient_id == patient_id).order_by(Document.created_at.desc()).all()

    def get_longitudinal_timeline(self, db: Session, patient_id: Any, check_consent: bool = True) -> LongitudinalTimelineResponse:
        if isinstance(patient_id, str):
            try:
                patient_id = uuid.UUID(patient_id)
            except Exception:
                pass
        if check_consent:
            enforce_valid_consent(db, patient_id)

        events: List[TimelineEvent] = []

        visits = db.query(VisitHistory).filter(VisitHistory.patient_id == patient_id).all()
        for v in visits:
            chief_complaint = getattr(v, "chief_complaint", None) or getattr(v, "diagnosis", None) or "Consultation"
            events.append(
                TimelineEvent(
                    id=str(v.id),
                    event_type="visit",
                    date=v.visit_date,
                    title=f"Clinical Visit: {chief_complaint}",
                    details={
                        "chief_complaint": chief_complaint,
                        "diagnosis": getattr(v, "diagnosis", None),
                        "treatment": getattr(v, "treatment", None),
                        "doctor_id": str(v.doctor_id) if v.doctor_id else None,
                        "hospital_id": str(v.hospital_id) if v.hospital_id else None,
                    },
                )
            )

        documents = db.query(Document).filter(Document.patient_id == patient_id).all()
        for d in documents:
            events.append(
                TimelineEvent(
                    id=str(d.id),
                    event_type="document",
                    date=d.created_at,
                    title=f"Document Upload: {d.document_type.replace('_', ' ').title()}",
                    details={
                        "file_name": d.file_name,
                        "storage_path": d.storage_path,
                        "document_type": d.document_type,
                        "status": d.status,
                        "ocr_data": d.ocr_data,
                    },
                )
            )

        prescriptions = db.query(Prescription).filter(Prescription.patient_id == patient_id).all()
        for p in prescriptions:
            events.append(
                TimelineEvent(
                    id=str(p.id),
                    event_type="prescription",
                    date=p.prescribed_at or p.created_at,
                    title=f"Prescription ({len(p.items)} items)",
                    details={
                        "status": p.status,
                        "doctor_id": str(p.doctor_id) if p.doctor_id else None,
                        "notes": p.notes,
                        "items": [
                            {
                                "drug_name": i.drug_name,
                                "dosage": i.dosage,
                                "frequency": i.frequency,
                                "duration": i.duration,
                                "instructions": i.instructions,
                            }
                            for i in p.items
                        ],
                    },
                )
            )

        summaries = db.query(Summary).filter(Summary.patient_id == patient_id).all()
        for s in summaries:
            events.append(
                TimelineEvent(
                    id=str(s.id),
                    event_type="summary",
                    date=s.created_at,
                    title=f"Clinical Summary ({s.summary_type})",
                    details={
                        "summary_type": s.summary_type,
                        "status": s.status,
                        "doctor_id": str(s.doctor_id) if s.doctor_id else None,
                        "summary_text": s.summary_text,
                    },
                )
            )

        events.sort(key=lambda e: e.date, reverse=True)
        return LongitudinalTimelineResponse(
            patient_id=patient_id,
            total_events=len(events),
            events=events,
        )

    def get_unified_patient_record(self, db: Session, patient_id: Any, check_consent: bool = True) -> UnifiedPatientRecord:
        if isinstance(patient_id, str):
            try:
                patient_id = uuid.UUID(patient_id)
            except Exception:
                pass
        if check_consent:
            enforce_valid_consent(db, patient_id)

        patient = get_patient(db, patient_id)
        timeline = self.get_longitudinal_timeline(db, patient_id, check_consent=False)

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

        appts = db.query(Appointment).filter(Appointment.patient_id == patient_id).order_by(Appointment.appointment_time.desc()).all()
        appointments_data = [
            {
                "id": str(a.id),
                "doctor_id": str(a.doctor_id) if a.doctor_id else None,
                "hospital_id": str(a.hospital_id) if a.hospital_id else None,
                "appointment_time": a.appointment_time.isoformat() if a.appointment_time else None,
                "status": a.status,
                "reason": a.reason,
                "notes": a.notes,
            }
            for a in appts
        ]

        return UnifiedPatientRecord(
            patient_id=patient_id,
            profile=profile_dict,
            visits=visits_data,
            documents=docs_data,
            prescriptions=prescriptions_data,
            appointments=appointments_data,
            summaries=summaries_data,
        )

    def share_document_via_consent(self, db: Session, share_req: DocumentShareRequest) -> DocumentShareResponse:
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

        expires_delta = timedelta(hours=1)
        expires_at = now + expires_delta

        token = create_access_token(
            data={"sub": str(share_req.recipient_id), "patient_id": str(share_req.patient_id), "consent_id": str(share_req.consent_id)},
            expires_in_seconds=int(expires_delta.total_seconds()),
        )

        return DocumentShareResponse(
            share_id=str(uuid.uuid4()),
            status="approved",
            message="Access granted via consent",
            access_token=token,
            expires_at=expires_at,
        )


document_service = DocumentService()


def upload_document(db: Session, doc_in: DocumentCreate) -> Document:
    return document_service.upload_document(db, doc_in=doc_in)

def get_patient_documents(db: Session, patient_id: uuid.UUID, check_consent: bool = True) -> List[Document]:
    return document_service.get_patient_documents(db, patient_id=patient_id, check_consent=check_consent)

def get_longitudinal_timeline(db: Session, patient_id: uuid.UUID, check_consent: bool = True) -> LongitudinalTimelineResponse:
    return document_service.get_longitudinal_timeline(db, patient_id=patient_id, check_consent=check_consent)

def get_unified_patient_record(db: Session, patient_id: uuid.UUID, check_consent: bool = True) -> UnifiedPatientRecord:
    return document_service.get_unified_patient_record(db, patient_id=patient_id, check_consent=check_consent)

def share_document_via_consent(db: Session, share_req: DocumentShareRequest) -> DocumentShareResponse:
    return document_service.share_document_via_consent(db, share_req=share_req)
