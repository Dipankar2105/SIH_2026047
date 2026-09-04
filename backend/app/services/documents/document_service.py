from sqlalchemy.orm import Session
from app.models.document import Document
from app.services.documents.ocr_service import ocr_service

class DocumentService:
    def upload_document(self, db: Session, patient_id: str, title: str, document_type: str, file_path: str) -> Document:
        doc = Document(
            patient_id=patient_id,
            title=title,
            document_type=document_type,
            file_path=file_path,
            ocr_status="PENDING"
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        # Trigger background OCR
        ocr_res = ocr_service.extract_text_from_file(file_path)
        doc.ocr_status = ocr_res["status"]
        doc.extracted_text = ocr_res["extracted_text"]
        db.commit()
        db.refresh(doc)
        return doc

document_service = DocumentService()
