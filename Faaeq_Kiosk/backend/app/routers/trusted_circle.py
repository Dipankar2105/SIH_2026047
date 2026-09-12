from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import require_roles
from app.schemas.trusted_circle import (
    TrustedCircleCreate,
    TrustedCircleResponse,
)
from app.services.privacy.trusted_circle_service import trusted_circle_service


router = APIRouter(prefix="/api/trusted-circle", tags=["Trusted Circle & Family"])


@router.post("/permissions", response_model=TrustedCircleResponse, status_code=status.HTTP_201_CREATED)
def add_trusted_relative(
    payload: TrustedCircleCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("patient")),
):
    data = payload.model_dump(exclude={"patient_id"})
    data["patient_id"] = str(current_user["sub"])
    result = trusted_circle_service.add_trusted_relative(db, data=data)
    return TrustedCircleResponse.model_validate(result)


@router.get("/permissions/patient/{patient_id}", response_model=list[TrustedCircleResponse])
def get_patient_permissions(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("patient", "doctor")),
):
    results = trusted_circle_service.get_permissions_by_patient(db, patient_id=patient_id)
    return [TrustedCircleResponse.model_validate(r) for r in results]


@router.get("/view/{patient_id}")
def get_relative_view(
    patient_id: str,
    relative_phone: str = Query(..., min_length=5),
    db: Session = Depends(get_db),
):
    result = trusted_circle_service.get_relative_view(
        db,
        relative_phone=relative_phone,
        patient_id=patient_id,
    )
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["error"],
        )
    return result
