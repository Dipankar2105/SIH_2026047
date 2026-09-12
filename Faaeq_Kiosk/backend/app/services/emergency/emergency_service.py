import secrets
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.emergency_profile import EmergencyProfile
from app.models.patient import Patient
from app.core.audit import audit_service


class EmergencyService:
    def create_or_update_profile(self, db: Session, patient_id: str, data: dict) -> EmergencyProfile:
        existing = db.query(EmergencyProfile).filter(
            EmergencyProfile.patient_id == patient_id
        ).first()

        if existing:
            for key, value in data.items():
                setattr(existing, key, value)
            existing.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing)
            audit_service.log(
                db, actor_id=patient_id, actor_type="patient",
                action="UPDATE", resource_type="emergency_profile", resource_id=str(existing.id)
            )
            return existing

        qr_token = secrets.token_urlsafe(24)
        profile = EmergencyProfile(
            patient_id=patient_id,
            qr_token=qr_token,
            **data,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        audit_service.log(
            db, actor_id=patient_id, actor_type="patient",
            action="CREATE", resource_type="emergency_profile", resource_id=str(profile.id)
        )
        return profile

    def get_public_card_by_token(self, db: Session, qr_token: str) -> dict | None:
        profile = db.query(EmergencyProfile).filter(
            EmergencyProfile.qr_token == qr_token,
            EmergencyProfile.is_active == True,
        ).first()

        if not profile:
            return None

        patient = db.get(Patient, profile.patient_id)
        return {
            "patient_name": f"{patient.first_name} {patient.last_name or ''}" if patient else "",
            "abha_id": patient.abha_id if patient else None,
            "blood_group": profile.blood_group,
            "known_allergies": profile.known_allergies or [],
            "active_medications": profile.active_medications or [],
            "emergency_contact_name": profile.emergency_contact_name,
            "emergency_contact_phone": profile.emergency_contact_phone,
            "preferred_hospital": profile.preferred_hospital,
        }

    def break_glass_er_access(self, db: Session, patient_id: str, doctor_id: str) -> dict | None:
        profile = db.query(EmergencyProfile).filter(
            EmergencyProfile.patient_id == patient_id,
            EmergencyProfile.is_active == True,
        ).first()

        if not profile:
            return None

        patient = db.get(Patient, patient_id)

        audit_service.log(
            db,
            actor_id=doctor_id,
            actor_type="doctor",
            action="EMERGENCY_BREAK_GLASS",
            resource_type="emergency_profile",
            resource_id=patient_id,
            details={
                "reason": "ER break-glass access",
                "ts": datetime.utcnow().isoformat(),
            },
        )

        return {
            "patient_name": f"{patient.first_name} {patient.last_name or ''}" if patient else "",
            "abha_id": patient.abha_id if patient else None,
            "blood_group": profile.blood_group,
            "known_allergies": profile.known_allergies or [],
            "critical_conditions": profile.critical_conditions or [],
            "active_medications": profile.active_medications or [],
            "emergency_contact_name": profile.emergency_contact_name,
            "emergency_contact_phone": profile.emergency_contact_phone,
            "preferred_hospital": profile.preferred_hospital,
            "warning": "EMERGENCY BREAK-GLASS ACCESS - AUDITED",
        }


emergency_service = EmergencyService()
