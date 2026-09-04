import json
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.consent import Consent
from app.schemas.consent import ConsentCreate

class ConsentService:
    def request_consent(self, db: Session, consent_in: ConsentCreate) -> Consent:
        consent_artifact = Consent(
            patient_id=consent_in.patient_id,
            consent_id=f"CONS-{uuid.uuid4().hex[:8].upper()}",
            purpose=consent_in.purpose,
            status="GRANTED",
            granted_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc) + timedelta(days=30),
            hi_types=json.dumps(consent_in.hi_types)
        )
        db.add(consent_artifact)
        db.commit()
        db.refresh(consent_artifact)
        return consent_artifact

    def get_consent(self, db: Session, consent_id: str) -> Consent:
        return db.query(Consent).filter(Consent.consent_id == consent_id).first()

consent_service = ConsentService()
