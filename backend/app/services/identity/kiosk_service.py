import json
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.kiosk_session import KioskSession
from app.schemas.session import KioskSessionCreate, KioskSessionResponse, KioskSessionEndResponse


def create_kiosk_session(db: Session, session_in: KioskSessionCreate) -> KioskSession:
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=session_in.session_duration_minutes or 30)

    temp_state_str = None
    if session_in.temp_state:
        temp_state_str = json.dumps(session_in.temp_state)

    session = KioskSession(
        kiosk_id=session_in.kiosk_id,
        status="active",
        started_at=now,
        expires_at=expires_at,
        temp_state=temp_state_str,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def validate_kiosk_session(db: Session, session_id: uuid.UUID) -> KioskSession:
    session = db.query(KioskSession).filter(KioskSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Kiosk session '{session_id}' not found",
        )

    now = datetime.now(timezone.utc)
    if session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Kiosk session '{session_id}' is no longer active (status: {session.status})",
        )

    if session.expires_at and session.expires_at < now:
        # Auto-expire session
        session.status = "expired"
        session.ended_at = now
        session.temp_state = None  # Wipe sensitive state
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Kiosk session '{session_id}' has expired",
        )

    return session


def end_kiosk_session(db: Session, session_id: uuid.UUID) -> KioskSessionEndResponse:
    session = db.query(KioskSession).filter(KioskSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Kiosk session '{session_id}' not found",
        )

    now = datetime.now(timezone.utc)
    session.status = "ended"
    session.ended_at = now
    session.temp_state = None  # Explicitly wipe sensitive temporary kiosk state
    db.commit()

    return KioskSessionEndResponse(
        id=session.id,
        status="ended",
        ended_at=now,
        temp_state_cleared=True,
    )


def cleanup_expired_sessions(db: Session) -> int:
    """
    Expired session cleanup strategy compatible with pg_cron / background tasks.
    """
    now = datetime.now(timezone.utc)
    expired_sessions = (
        db.query(KioskSession)
        .filter(
            KioskSession.status == "active",
            KioskSession.expires_at < now,
        )
        .all()
    )

    count = 0
    for sess in expired_sessions:
        sess.status = "expired"
        sess.ended_at = now
        sess.temp_state = None
        count += 1

    if count > 0:
        db.commit()
    return count
