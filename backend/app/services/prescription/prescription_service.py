import json
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.drug import Drug
from app.core.audit import audit_service


class PrescriptionService:
    def search_drugs(self, db: Session, query: str, limit: int = 20) -> list:
        q = f"%{query}%"
        stmt = select(Drug).where(
            (Drug.name.ilike(f"{query}%")) | (Drug.name.ilike(q)) | (Drug.generic_name.ilike(q))
        ).where(Drug.is_active == True).limit(limit * 2)
        drugs = db.execute(stmt).scalars().all()
        seen = set()
        out = []
        for d in drugs:
            score = 1.0 if d.name.lower().startswith(query.lower()) else 0.8
            if d.id not in seen:
                seen.add(d.id)
                out.append({
                    "id": d.id,
                    "name": d.name,
                    "generic_name": d.generic_name,
                    "strength": d.strength,
                    "dosage_form": d.dosage_form,
                    "manufacturer": d.manufacturer,
                    "match_score": score,
                })
        return out[:limit]

    def create_prescription(self, db: Session, payload, doctor_id: str = None) -> "Prescription":
        from app.models.prescription import Prescription
        from app.models.prescription_item import PrescriptionItem
        rx = Prescription(
            patient_id=payload.patient_id,
            doctor_id=doctor_id or str(payload.doctor_id) if payload.doctor_id else doctor_id,
            appointment_id=payload.appointment_id,
            session_id=payload.session_id,
            status="draft",
            notes=payload.notes,
        )
        db.add(rx)
        db.flush()
        for med in payload.medicines:
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
            db, actor_id=str(payload.doctor_id), actor_type="doctor",
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
        return db.get(Prescription, prescription_id)

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

    def get_patient_prescriptions(self, db: Session, patient_id: str):
        from app.models.prescription import Prescription
        stmt = select(Prescription).where(
            Prescription.patient_id == patient_id
        ).order_by(Prescription.prescribed_at.desc())
        return db.execute(stmt).scalars().all()


prescription_service = PrescriptionService()
