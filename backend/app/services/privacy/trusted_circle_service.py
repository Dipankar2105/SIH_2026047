from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.trusted_circle import TrustedCircle
from app.core.audit import audit_service


class TrustedCircleService:
    def add_trusted_relative(self, db: Session, data: dict) -> TrustedCircle:
        perm = TrustedCircle(**data)
        db.add(perm)
        db.commit()
        db.refresh(perm)
        audit_service.log(
            db,
            actor_id=data.get("patient_id", "unknown"),
            actor_type="patient",
            action="CREATE",
            resource_type="trusted_circle",
            resource_id=str(perm.id),
        )
        return perm

    def get_relative_view(self, db: Session, relative_phone: str, patient_id: str) -> dict:
        perm = db.query(TrustedCircle).filter(
            TrustedCircle.relative_phone == relative_phone,
            TrustedCircle.patient_id == patient_id,
        ).first()

        if not perm:
            return {"error": "No permissions granted for this relative"}

        return {
            "patient_id": str(patient_id),
            "relationship": perm.relationship,
            "permissions": {
                "can_see_pregnancy": perm.can_see_pregnancy,
                "can_see_appointments": perm.can_see_appointments,
                "can_see_emergency_status": perm.can_see_emergency_status,
                "can_see_period_history": perm.can_see_period_history,
                "can_see_fertility": perm.can_see_fertility,
                "can_see_medications": perm.can_see_medications,
            },
        }

    def get_permissions_by_patient(self, db: Session, patient_id: str) -> list[TrustedCircle]:
        stmt = select(TrustedCircle).where(TrustedCircle.patient_id == patient_id)
        result = db.execute(stmt)
        return result.scalars().all()


trusted_circle_service = TrustedCircleService()
