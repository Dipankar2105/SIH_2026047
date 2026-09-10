import uuid
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.rbac import require_roles
from app.core.security import create_access_token, decode_access_token
from app.models.patient import Patient
from app.models.prescription import Prescription
from app.models.red_flag import RedFlag

router = APIRouter(prefix="/emergency", tags=["Emergency Health Record"])


@router.get("/qr")
def generate_emergency_qr(
    current_user: Dict[str, Any] = Depends(require_roles("patient"))
):
    """
    Generates a secure, long-lived token representing the Golden Health Record QR.
    The client can encode the returned URL into a QR code.
    """
    patient_id = current_user.get("sub") or current_user.get("patient_id")
    
    # Create a long-lived JWT for emergency access (e.g. 5 years)
    payload = {
        "sub": str(patient_id),
        "role": "emergency_responder"
    }
    
    # 5 years expiration
    token = create_access_token(payload, expires_delta=timedelta(days=365 * 5))
    
    return {
        "emergency_token": token,
        "qr_url": f"/api/emergency/record/{token}"
    }


@router.get("/record/{token}")
def get_emergency_record(token: str, db: Session = Depends(get_db)):
    """
    Retrieves limited critical data for first responders using the QR code token.
    Requires no standard auth, only the signed emergency token.
    """
    try:
        payload = decode_access_token(token)
        if payload.get("role") != "emergency_responder":
            raise HTTPException(status_code=403, detail="Invalid token scope")
        
        patient_id = payload.get("sub")
        if not patient_id:
            raise HTTPException(status_code=401, detail="Invalid token format")
            
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate emergency token",
        )

    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Fetch critical info: recent red flags and active prescriptions
    # For emergency, we only show the last 3 months of prescriptions
    three_months_ago = datetime.now(timezone.utc) - timedelta(days=90)
    
    prescriptions = db.query(Prescription).filter(
        Prescription.patient_id == patient_id,
        Prescription.created_at >= three_months_ago
    ).all()
    
    active_meds = []
    for rx in prescriptions:
        for item in rx.items:
            active_meds.append(item.drug_name)
            
    # Red flags
    red_flags = db.query(RedFlag).filter(
        RedFlag.patient_id == patient_id
    ).order_by(RedFlag.created_at.desc()).limit(5).all()

    # Calculate age
    age = None
    if patient.date_of_birth:
        today = datetime.now().date()
        age = today.year - patient.date_of_birth.year - ((today.month, today.day) < (patient.date_of_birth.month, patient.date_of_birth.day))

    return {
        "patient": {
            "name": f"{patient.first_name} {patient.last_name or ''}".strip(),
            "gender": patient.gender,
            "age": age,
            "emergency_contact": {
                "name": patient.emergency_contact_name,
                "phone": patient.emergency_contact_phone
            }
        },
        "critical_health_data": {
            "recent_medications": list(set(active_meds)),
            "recent_red_flags": [rf.flag_text for rf in red_flags]
        }
    }
