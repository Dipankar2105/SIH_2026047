from sqlalchemy.orm import Session
from app.models.prescription import Prescription
from app.models.prescription_item import PrescriptionItem
from app.schemas.prescription import PrescriptionCreate

class PrescriptionService:
    def create_prescription(self, db: Session, prescription_in: PrescriptionCreate) -> Prescription:
        prescription = Prescription(
            patient_id=prescription_in.patient_id,
            doctor_id=prescription_in.doctor_id,
            diagnosis=prescription_in.diagnosis,
            notes=prescription_in.notes
        )
        db.add(prescription)
        db.commit()
        db.refresh(prescription)

        for item in prescription_in.items:
            p_item = PrescriptionItem(
                prescription_id=prescription.id,
                **item.model_dump()
            )
            db.add(p_item)

        db.commit()
        db.refresh(prescription)
        return prescription

prescription_service = PrescriptionService()
