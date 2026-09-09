from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import require_roles
from app.schemas.fhir import FHIRBundleRequest, FHIRBundleResponse
from app.services.fhir.fhir_service import fhir_service


router = APIRouter(prefix="/api/fhir", tags=["FHIR / ABDM"])


@router.post("/bundle/generate", response_model=FHIRBundleResponse)
def generate_bundle(
    payload: FHIRBundleRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    result = fhir_service.generate_bundle(
        db, patient_id=str(payload.patient_id), session_id=str(payload.session_id)
    )
    return FHIRBundleResponse(**result)


@router.get("/bundle/session/{session_id}", response_model=FHIRBundleResponse)
def generate_session_bundle(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    try:
        result = fhir_service.generate_bundle_for_session(db, session_id=session_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return FHIRBundleResponse(**result)


@router.post("/bundle/validate")
def validate_bundle(
    bundle: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    errors = fhir_service.validate_bundle(bundle)
    return {"abdm_compliant": len(errors) == 0, "errors": errors}
