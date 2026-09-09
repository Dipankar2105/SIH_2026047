import json
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import select, insert, update
from app.core.config import settings
from app.models.document import Document
from app.services.documents.ocr_service import ocr_service
from app.core.audit import audit_service


class DocumentService:
    def upload_document(self, db: Session, patient_id: str, document_type: str,
                        file_bytes: bytes, filename: str, mime_type: str,
                        session_id=None) -> Document:
        doc = Document(
            patient_id=patient_id,
            document_type=document_type,
            file_name=filename,
            status="uploaded",
        )
        db.add(doc)
        db.flush()

        from supabase import create_client
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        storage_path = f"{patient_id}/{uuid.uuid4()}/{filename}"
        supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET).upload(storage_path, file_bytes)
        doc.storage_path = storage_path

        ocr_result = ocr_service.extract(file_bytes, filename, mime_type)
        plain_text = ocr_result.get("extracted_data", {}).get("text", "")
        doc.ocr_text = plain_text
        doc.ocr_data = ocr_result
        doc.status = "extracted" if ocr_result.get("confidence", 0) > 0.5 else "failed"
        doc.mime_type = mime_type

        db.commit()
        db.refresh(doc)
        audit_service.log(
            db, actor_id=str(patient_id), actor_type="patient",
            action="CREATE", resource_type="document", resource_id=str(doc.id)
        )
        return doc

    def verify_document(self, db: Session, document_id: str, corrections: list) -> Document:
        doc = db.get(Document, document_id)
        if not doc:
            raise ValueError("Document not found")
        ocr_data = doc.ocr_data or {}
        structured = ocr_data.get("structured", ocr_data)
        for corr in corrections:
            field = corr.get("field_name")
            original = corr.get("original_value")
            corrected = corr.get("corrected_value")
            if field in structured and structured[field] == original:
                structured[field] = corrected
        ocr_data["structured"] = structured
        doc.ocr_data = ocr_data
        doc.status = "verified"
        db.commit()
        db.refresh(doc)
        audit_service.log(
            db, actor_id="system", actor_type="system",
            action="VERIFY", resource_type="document", resource_id=str(doc.id)
        )
        return doc

    def get_document(self, db: Session, document_id: str) -> Document:
        return db.get(Document, document_id)

    def get_patient_documents(self, db: Session, patient_id: str):
        stmt = select(Document).where(Document.patient_id == patient_id).order_by(Document.created_at.desc())
        return db.execute(stmt).scalars().all()

    def get_sources(self, db: Session, document_id: str) -> dict:
        doc = db.get(Document, document_id)
        if not doc:
            return {}
        ocr_data = doc.ocr_data or {}
        return {
            "document_id": str(document_id),
            "file_name": doc.file_name,
            "extraction_method": ocr_data.get("method", "unknown"),
            "overall_confidence": ocr_data.get("confidence", 0.0),
            "source_refs": ocr_data.get("source_refs", {}),
            "field_count": len(ocr_data.get("structured", {})),
        }


document_service = DocumentService()
