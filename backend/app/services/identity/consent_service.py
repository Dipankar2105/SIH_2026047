import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.consent import Consent
from app.schemas.consent import ConsentCreate, ConsentStatusResponse


def grant_consent(db: Session, consent_in: ConsentCreate) -> Consent:
    now = datetime.now(timezone.utc)
    expires_at = None
    if consent_in.expires_in_hours:
        expires_at = now + timedelta(hours=consent_in.expires_in_hours)

    consent = Consent(
        patient_id=consent_in.patient_id,
        consent_type=consent_in.consent_type,
        granted=True,
        purpose=consent_in.purpose,
        scope=consent_in.scope or "view_records",
        granted_at=now,
        expires_at=expires_at,
        revoked_at=None,
    )
    db.add(consent)
    db.commit()
    db.refresh(consent)
    return consent


def revoke_consent(db: Session, patient_id: uuid.UUID, consent_id: Optional[uuid.UUID] = None) -> Consent:
    query = db.query(Consent).filter(Consent.patient_id == patient_id, Consent.granted == True)
    if consent_id:
        query = query.filter(Consent.id == consent_id)

    consent = query.order_by(Consent.created_at.desc()).first()
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active consent found to revoke",
        )

    consent.granted = False
    consent.revoked_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(consent)
    return consent


def check_consent_status(db: Session, patient_id: uuid.UUID, consent_type: str = "health_record_sharing") -> ConsentStatusResponse:
    now = datetime.now(timezone.utc)
    consent = (
        db.query(Consent)
        .filter(
            Consent.patient_id == patient_id,
            Consent.consent_type == consent_type,
        )
        .order_by(Consent.created_at.desc())
        .first()
    )

    if not consent:
        return ConsentStatusResponse(
            patient_id=patient_id,
            is_valid=False,
            consent_type=consent_type,
            granted=False,
            expired=False,
            revoked=False,
            scope=None,
        )

    revoked = consent.revoked_at is not None or not consent.granted
    expired = consent.expires_at is not None and consent.expires_at < now
    is_valid = consent.granted and not revoked and not expired

    return ConsentStatusResponse(
        patient_id=patient_id,
        is_valid=is_valid,
        consent_type=consent_type,
        granted=consent.granted,
        expired=expired,
        revoked=revoked,
        scope=consent.scope,
    )


def enforce_valid_consent(db: Session, patient_id: uuid.UUID, consent_type: str = "health_record_sharing") -> None:
    """
    Prevents access to protected patient data when consent is invalid, revoked, or expired.
    """
    status_res = check_consent_status(db, patient_id, consent_type)
    if not status_res.is_valid:
        reason = "missing"
        if status_res.revoked:
            reason = "revoked"
        elif status_res.expired:
            reason = "expired"

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: Patient consent is {reason} for scope '{consent_type}'",
        )
