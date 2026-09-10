import uuid
from typing import List, Optional, Any, Dict
from fastapi import HTTPException, status
from sqlalchemy import or_, case, select
from sqlalchemy.orm import Session

from app.models.drug import Drug
from app.models.prescription import Prescription
from app.models.prescription_item import PrescriptionItem
from app.models.appointment import Appointment
from app.schemas.prescription import PrescriptionCreate, PrescriptionCreateRequest
from app.core.audit import audit_service
from app.services.prescription.reminder_service import reminder_service, create_reminders_for_prescription


class PrescriptionService:
    def search_drugs(self, db: Session, query: str = "", limit: int = 20, q: Optional[str] = None) -> List[Any]:
        term = (q or query or "").strip().lower()
        if not term:
            return []

        pattern = f"%{term}%"
        stmt = (
            select(Drug)
            .where(
                (Drug.name.ilike(f"{term}%")) | (Drug.name.ilike(pattern)) | (Drug.generic_name.ilike(pattern))
            )
            .where(Drug.is_active == True)
            .order_by(
                case(
                    (Drug.name.ilike(f"{term}%"), 1),
                    (Drug.generic_name.ilike(f"{term}%"), 2),
                    else_=3,
                ),
                Drug.name.asc(),
            )
            .limit(limit)
        )
        drugs = db.execute(stmt).scalars().all()
        return drugs

    def get_drug_by_id(self, db: Session, drug_id: Any) -> Drug:
        if isinstance(drug_id, str):
            try:
                drug_id = uuid.UUID(drug_id)
            except Exception:
                pass
        drug = db.get(Drug, drug_id)
        if not drug:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drug not found")
        return drug

    def create_prescription(self, db: Session, payload: Any, doctor_id: Optional[Any] = None) -> Prescription:
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
            if doc_id is not None:
                from app.models.doctor import Doctor
                if not db.get(Doctor, doc_id):
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

        notes = getattr(payload, "notes", None)

        rx = Prescription(
            patient_id=p_id,
            doctor_id=doc_id,
            appointment_id=appt_id,
            session_id=sess_id,
            status="draft",
            notes=notes,
        )
        db.add(rx)
        db.flush()

        # Handle items from either payload.items or payload.medicines
        meds = getattr(payload, "medicines", None) or getattr(payload, "items", [])
        for med in meds:
            drug_name = getattr(med, "drug_name", None) or (med.get("drug_name") if isinstance(med, dict) else "")
            dosage = getattr(med, "dosage", None) or (med.get("dosage") if isinstance(med, dict) else None)
            frequency = getattr(med, "frequency", None) or (med.get("frequency") if isinstance(med, dict) else None)
            duration = getattr(med, "duration", None) or (med.get("duration") if isinstance(med, dict) else None)
            quantity = getattr(med, "quantity", None) or (med.get("quantity") if isinstance(med, dict) else None)
            instructions = getattr(med, "instructions", None) or (med.get("instructions") if isinstance(med, dict) else None)

            item = PrescriptionItem(
                prescription_id=rx.id,
                drug_name=drug_name,
                dosage=dosage,
                frequency=frequency,
                duration=str(duration) if duration else None,
                quantity=quantity,
                instructions=instructions,
            )
            db.add(item)

        db.commit()
        db.refresh(rx)

        audit_service.log(
            db,
            actor_id=str(doc_id) if doc_id else "system",
            actor_type="doctor" if doc_id else "system",
            action="CREATE",
            resource_type="prescription",
            resource_id=str(rx.id),
        )

        # Trigger automatic reminder creation
        try:
            reminder_service.create_reminders(db, rx.id)
        except Exception:
            pass

        return rx

    def sign_prescription(self, db: Session, prescription_id: Any, doctor_id: Any) -> Prescription:
        if isinstance(prescription_id, str):
            try:
                prescription_id = uuid.UUID(prescription_id)
            except Exception:
                pass

        rx = db.get(Prescription, prescription_id)
        if not rx:
            raise ValueError("Prescription not found")

        rx.status = "signed"
        db.commit()
        db.refresh(rx)

        audit_service.log(
            db,
            actor_id=str(doctor_id),
            actor_type="doctor",
            action="SIGN",
            resource_type="prescription",
            resource_id=str(prescription_id),
        )
        return rx

    def get_prescription(self, db: Session, prescription_id: Any) -> Optional[Prescription]:
        if isinstance(prescription_id, str):
            try:
                prescription_id = uuid.UUID(prescription_id)
            except Exception:
                pass
        return db.get(Prescription, prescription_id)

    def list_prescriptions(
        self,
        db: Session,
        patient_id: Optional[Any] = None,
        limit: int = 50,
    ) -> List[Prescription]:
        if isinstance(patient_id, str):
            try:
                patient_id = uuid.UUID(patient_id)
            except Exception:
                pass
        query = db.query(Prescription)
        if patient_id:
            query = query.filter(Prescription.patient_id == patient_id)
        return query.order_by(Prescription.prescribed_at.desc()).limit(limit).all()

    def get_patient_prescriptions(self, db: Session, patient_id: Any) -> List[Prescription]:
        return self.list_prescriptions(db, patient_id=patient_id)

    def get_pharmacist_view(self, db: Session, prescription_id: Any) -> dict:
        rx = self.get_prescription(db, prescription_id)
        if not rx:
            raise ValueError("Prescription not found")
        if rx.status != "signed":
            # If not explicitly signed, draft prescriptions can also be reviewed by doctor/pharmacist
            pass

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
                "quantity_to_dispense": item.quantity or 10,
                "instructions": item.instructions or "As prescribed",
            })

        return {
            "prescription_id": rx.id,
            "patient_id": rx.patient_id,
            "doctor_id": rx.doctor_id,
            "signed_at": str(rx.prescribed_at) if rx.prescribed_at else None,
            "diagnosis": [rx.notes] if rx.notes else [],
            "medicines": medicines,
            "notes": rx.notes,
            "follow_up_info": "Follow up after completing course",
        }


prescription_service = PrescriptionService()

# Standalone function exports for backwards compatibility
def search_drugs(db: Session, q: str, limit: int = 20) -> List[Drug]:
    return prescription_service.search_drugs(db, q=q, limit=limit)

def get_drug_by_id(db: Session, drug_id: uuid.UUID) -> Drug:
    return prescription_service.get_drug_by_id(db, drug_id)

def list_prescriptions(db: Session, patient_id: Optional[uuid.UUID] = None, limit: int = 50) -> List[Prescription]:
    return prescription_service.list_prescriptions(db, patient_id=patient_id, limit=limit)

def create_prescription(db: Session, payload: PrescriptionCreate) -> Prescription:
    return prescription_service.create_prescription(db, payload)

def get_prescription(db: Session, prescription_id: uuid.UUID) -> Prescription:
    rx = prescription_service.get_prescription(db, prescription_id)
    if not rx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    return rx
