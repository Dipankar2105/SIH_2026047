import uuid
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.rbac import require_roles, verify_patient_access
from app.services.fhir.fhir_service import fhir_service
from app.schemas.fhir import (
    FHIRBundleRequest,
    FHIRBundleCreate,
    FHIRBundleResponse,
)

router = APIRouter(prefix="/fhir", tags=["FHIR / ABDM"])


@router.post("/bundle/generate", response_model=FHIRBundleResponse)
def generate_bundle_endpoint(
    payload: FHIRBundleRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor", "hospital_admin", "super_admin")),
):
    verify_patient_access(current_user, payload.patient_id, db=db)
    result = fhir_service.generate_bundle(
        db, patient_id=str(payload.patient_id), session_id=str(payload.session_id)
    )
    return FHIRBundleResponse(**result)


@router.get("/bundle/session/{session_id}", response_model=FHIRBundleResponse)
def generate_session_bundle_endpoint(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor", "hospital_admin", "super_admin")),
):
    try:
        result = fhir_service.generate_bundle_for_session(db, session_id=session_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return FHIRBundleResponse(**result)


@router.post("/bundle/validate")
def validate_bundle_endpoint(
    bundle: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor", "hospital_admin", "super_admin")),
):
    target = bundle.get("bundle") if isinstance(bundle, dict) and "bundle" in bundle and isinstance(bundle["bundle"], dict) else bundle
    errors = fhir_service.validate_bundle(target)
    return {"abdm_compliant": len(errors) == 0, "is_valid": len(errors) == 0, "errors": errors}


@router.get("/Patient/{patient_id}/$export")
@router.get("/patient/{patient_id}")
def export_patient_bundle_endpoint(
    patient_id: uuid.UUID,
    session_id: uuid.UUID = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> Dict[str, Any]:
    verify_patient_access(current_user, patient_id, db=db)
    return fhir_service.export_patient_bundle(db, patient_id, session_id)


@router.post("/save", response_model=FHIRBundleResponse)
def save_bundle_endpoint(
    bundle_in: FHIRBundleCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor", "hospital_admin", "super_admin")),
):
    verify_patient_access(current_user, bundle_in.patient_id, db=db)
    fb = fhir_service.save_fhir_bundle(db, bundle_in)
    return FHIRBundleResponse.model_validate(fb)


@router.get("/patient/{patient_id}/bundles", response_model=List[FHIRBundleResponse])
@router.get("/records/{patient_id}", response_model=List[FHIRBundleResponse])
def get_patient_fhir_bundles_endpoint(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, patient_id, db=db)
    bundles = fhir_service.get_patient_fhir_bundles(db, patient_id)
    return [FHIRBundleResponse.model_validate(b) for b in bundles]
