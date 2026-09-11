import json
import uuid
from typing import Optional, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.drug import Drug
from app.core.audit import audit_service


class PrescriptionService:
    def search_drugs(self, db: Session, query: str = "", limit: int = 20, q: Optional[str] = None) -> List[Any]:
        query_term = (q or query or "").strip().lower()
        if not query_term:
            return []
        pattern = f"%{query_term}%"
        stmt = (
            select(Drug)
            .where(
                (Drug.name.ilike(f"{query_term}%")) | (Drug.name.ilike(pattern)) | (Drug.generic_name.ilike(pattern))
            )
            .where(Drug.is_active == True)
            .order_by(Drug.name.asc())
            .limit(limit)
        )
        return db.execute(stmt).scalars().all()

    def get_drug_by_id(self, db: Session, drug_id: Any) -> Drug:
        if isinstance(drug_id, str):
            try:
                drug_id = uuid.UUID(drug_id)
            except Exception:
                pass
        drug = db.get(Drug, drug_id)
        if not drug:
            raise ValueError("Drug not found")
        return drug

    def create_prescription(self, db: Session, payload, doctor_id: str = None) -> "Prescription":
        from app.models.prescription import Prescription
        from app.models.prescription_item import PrescriptionItem
        p_id = getattr(payload, "patient_id", None)
        if isinstance(p_id, str):
            try:
                p_id = uuid.UUID(p_id)
            except Exception:
                pass

        doc_id = getattr(payload, "doctor_id", None) or doctor_id
        if doc_id is not None:
            if isinstance(doc_id, str):
                try:
                    doc_id = uuid.UUID(doc_id)
                except Exception:
                    doc_id = None

        appt_id = getattr(payload, "appointment_id", None)
        if isinstance(appt_id, str):
            try:
                appt_id = uuid.UUID(appt_id)
            except Exception:
                pass

        sess_id = getattr(payload, "session_id", None)
        if isinstance(sess_id, str):
            try:
                sess_id = uuid.UUID(sess_id)
            except Exception:
                pass

        rx = Prescription(
            patient_id=p_id,
            doctor_id=doc_id,
            appointment_id=appt_id,
            session_id=sess_id,
            status="draft",
            notes=getattr(payload, "notes", None),
        )
        db.add(rx)
        db.flush()

        meds = getattr(payload, "medicines", None) or getattr(payload, "items", [])
        for med in meds:
            item = PrescriptionItem(
                prescription_id=rx.id,
                drug_name=med.drug_name,
                dosage=med.dosage,
                frequency=med.frequency,
                duration=med.duration,
                quantity=med.quantity,
                instructions=med.instructions,
            )
            db.add(item)
        db.commit()
        db.refresh(rx)
        audit_service.log(
            db, actor_id=str(doc_id) if doc_id else "system", actor_type="doctor",
            action="CREATE", resource_type="prescription", resource_id=str(rx.id)
        )
        return rx

    def sign_prescription(self, db: Session, prescription_id: str, doctor_id: str) -> "Prescription":
        from app.models.prescription import Prescription
        rx = db.get(Prescription, prescription_id)
        if not rx:
            raise ValueError("Prescription not found")
        rx.status = "signed"
        db.commit()
        db.refresh(rx)
        audit_service.log(
            db, actor_id=str(doctor_id), actor_type="doctor",
            action="SIGN", resource_type="prescription", resource_id=str(prescription_id)
        )
        return rx

    def get_prescription(self, db: Session, prescription_id: str):
        from app.models.prescription import Prescription
        if isinstance(prescription_id, str):
            try:
                prescription_id = uuid.UUID(prescription_id)
            except Exception:
                pass
        return db.get(Prescription, prescription_id)

    def list_prescriptions(self, db: Session, patient_id: Optional[uuid.UUID] = None, limit: int = 50) -> List["Prescription"]:
        from app.models.prescription import Prescription
        stmt = select(Prescription).order_by(Prescription.prescribed_at.desc()).limit(limit)
        if patient_id:
            if isinstance(patient_id, str):
                try:
                    patient_id = uuid.UUID(patient_id)
                except Exception:
                    pass
            stmt = stmt.where(Prescription.patient_id == patient_id)
        return db.execute(stmt).scalars().all()

    def get_patient_prescriptions(self, db: Session, patient_id: str):
        from app.models.prescription import Prescription
        if isinstance(patient_id, str):
            try:
                patient_id = uuid.UUID(patient_id)
            except Exception:
                pass
        stmt = select(Prescription).where(
            Prescription.patient_id == patient_id
        ).order_by(Prescription.prescribed_at.desc())
        return db.execute(stmt).scalars().all()

    def get_pharmacist_view(self, db: Session, prescription_id: str) -> dict:
        rx = self.get_prescription(db, prescription_id)
        if not rx:
            raise ValueError("Prescription not found")
        if rx.status != "signed":
            raise ValueError("Prescription not signed")
        freq_map = {
            "1-0-1": "Twice daily (morning & night)",
            "1-1-1": "Three times daily",
            "1-0-0": "Once daily (morning)",
            "0-1-0": "Once daily (afternoon)",
            "0-0-1": "Once daily (night)",
        }
        medicines = []
        for item in rx.items:
            medicines.append({
                "drug_name": item.drug_name,
                "dosage": item.dosage,
                "frequency_text": freq_map.get(item.frequency, item.frequency),
                "duration": item.duration,
                "quantity_to_dispense": item.quantity,
                "instructions": item.instructions,
            })
        return {
            "prescription_id": str(rx.id),
            "patient_id": str(rx.patient_id),
            "doctor_id": str(rx.doctor_id) if rx.doctor_id else None,
            "signed_at": str(rx.prescribed_at),
            "diagnosis": [],
            "medicines": medicines,
            "notes": rx.notes,
            "follow_up_info": "",
        }


prescription_service = PrescriptionService()
