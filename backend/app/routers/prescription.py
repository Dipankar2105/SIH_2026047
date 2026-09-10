import uuid
from typing import List, Optional, Union, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user, get_optional_user
from app.core.rbac import require_roles, verify_patient_access
from app.schemas.prescription import (
    DrugResponse,
    DrugSearchResponse,
    DrugSearchResult,
    PrescriptionCreate,
    PrescriptionCreateRequest,
    PrescriptionResponse,
    PharmacistViewResponse,
)
from app.schemas.reminder import (
    ReminderCreateRequest,
    ReminderResponse,
    ReminderListResponse,
)
from app.services.prescription.prescription_service import prescription_service
from app.services.prescription.reminder_service import reminder_service

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


@router.get("/drugs/search")
def search_drugs_endpoint(
    request: Request,
    q: str = Query(..., min_length=1, description="Search term for drug brand or generic name"),
    limit: int = Query(20, ge=1, le=100, description="Max results to return"),
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_optional_user),
) -> Any:
    """
    Autocomplete search for drugs across 222K+ Indian medications.
    Returns list of DrugSearchResult when invoked via /api/prescriptions/drugs/search (Track C),
    or DrugSearchResponse wrapper when invoked via /prescriptions/drugs/search (Track A).
    """
    drugs = prescription_service.search_drugs(db, q=q, limit=limit)
    drug_list = [
        {
            "id": d.id,
            "name": d.name,
            "generic_name": d.generic_name,
            "strength": d.strength,
            "dosage_form": d.dosage_form,
            "manufacturer": d.manufacturer,
            "description": d.description,
            "is_active": d.is_active,
            "match_score": 1.0 if d.name.lower().startswith(q.lower()) else 0.8,
        }
        for d in drugs
    ]

    # Return bare list for /api/prescriptions/drugs/search (Track C requirement)
    if request.url.path.startswith("/api/prescriptions/drugs/search"):
        return drug_list

    return DrugSearchResponse(
        query=q,
        count=len(drugs),
        data=[DrugResponse.model_validate(d) for d in drugs],
    )


@router.get("/drugs/{drug_id}", response_model=DrugResponse)
def get_drug_by_id_endpoint(drug_id: uuid.UUID, db: Session = Depends(get_db)):
    """Retrieves single drug details by UUID."""
    drug = prescription_service.get_drug_by_id(db, drug_id)
    return DrugResponse.model_validate(drug)


@router.get("", response_model=List[PrescriptionResponse])
def list_prescriptions_endpoint(
    patient_id: Optional[uuid.UUID] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Lists prescriptions, protected by JWT/RBAC."""
    user_role = str(current_user.get("role", "")).lower()
    if user_role == "patient" and not patient_id:
        try:
            patient_id = uuid.UUID(current_user.get("sub"))
        except (ValueError, TypeError):
            pass

    if patient_id:
        verify_patient_access(current_user, patient_id, db=db)

    prescriptions = prescription_service.list_prescriptions(db, patient_id=patient_id, limit=limit)
    return [PrescriptionResponse.model_validate(p) for p in prescriptions]


@router.post("", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
@router.post("/create", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
def create_prescription_endpoint(
    payload: Union[PrescriptionCreateRequest, PrescriptionCreate],
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor", "hospital_admin", "super_admin")),
):
    """Creates a new prescription record, restricted to doctors and hospital admins."""
    verify_patient_access(current_user, payload.patient_id, db=db)
    doctor_id = current_user.get("sub")
    prescription = prescription_service.create_prescription(db, payload, doctor_id=doctor_id)
    if not request.url.path.startswith("/api/"):
        response.status_code = status.HTTP_200_OK
    else:
        response.status_code = status.HTTP_201_CREATED
    return PrescriptionResponse.model_validate(prescription)


@router.post("/{prescription_id}/sign", response_model=PrescriptionResponse)
def sign_prescription_endpoint(
    prescription_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor", "hospital_admin", "super_admin")),
):
    doctor_id = current_user.get("sub")
    try:
        result = prescription_service.sign_prescription(db, prescription_id=prescription_id, doctor_id=doctor_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    return PrescriptionResponse.model_validate(result)


@router.get("/{prescription_id}/pharmacist", response_model=PharmacistViewResponse)
@router.get("/{prescription_id}/pharmacist-view", response_model=PharmacistViewResponse)
def get_pharmacist_view_endpoint(
    prescription_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("pharmacist", "doctor", "hospital_admin", "super_admin")),
):
    try:
        result = prescription_service.get_pharmacist_view(db, prescription_id=prescription_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    return PharmacistViewResponse(**result)


@router.get("/patient/{patient_id}", response_model=List[PrescriptionResponse])
def get_patient_prescriptions_endpoint(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, patient_id, db=db)
    results = prescription_service.get_patient_prescriptions(db, patient_id=patient_id)
    return [PrescriptionResponse.model_validate(r) for r in results]


@router.post("/{prescription_id}/reminders", status_code=status.HTTP_201_CREATED)
def create_reminders_endpoint(
    prescription_id: str,
    payload: Optional[ReminderCreateRequest] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("patient", "doctor", "hospital_admin", "super_admin")),
):
    try:
        results = reminder_service.create_reminders(db, prescription_id=prescription_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    reminder_resps = [ReminderResponse.model_validate(r) for r in results]
    return {
        "prescription_id": prescription_id,
        "count": len(reminder_resps),
        "reminders": reminder_resps,
    }


@router.get("/reminders/patient/{patient_id}", response_model=ReminderListResponse)
def get_patient_reminders_endpoint(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, patient_id, db=db)
    result = reminder_service.get_patient_reminders(db, patient_id=patient_id)
    return ReminderListResponse.model_validate(result)


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription_endpoint(
    prescription_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retrieves prescription by UUID, protected by JWT/RBAC."""
    prescription = prescription_service.get_prescription(db, prescription_id)
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    verify_patient_access(current_user, prescription.patient_id, db=db)
    return PrescriptionResponse.model_validate(prescription)
