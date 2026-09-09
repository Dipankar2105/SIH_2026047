from uuid import UUID
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class MedicineEntry(BaseModel):
    drug_name: str
    dosage: str
    frequency: str
    duration: str
    quantity: Optional[int] = None
    instructions: Optional[str] = None


class PrescriptionCreateRequest(BaseModel):
    patient_id: UUID
    doctor_id: Optional[UUID] = None
    appointment_id: Optional[UUID] = None
    session_id: Optional[UUID] = None
    diagnosis: List[str] = []
    medicines: List[MedicineEntry]
    notes: Optional[str] = None


class PrescriptionItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    drug_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    quantity: Optional[int] = None
    instructions: Optional[str] = None


class PrescriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    patient_id: UUID
    doctor_id: Optional[UUID] = None
    session_id: Optional[UUID] = None
    status: str
    notes: Optional[str] = None
    prescribed_at: str
    items: List[PrescriptionItemResponse] = []


class DrugSearchResult(BaseModel):
    id: UUID
    name: str
    generic_name: Optional[str] = None
    strength: Optional[str] = None
    dosage_form: Optional[str] = None
    manufacturer: Optional[str] = None
    match_score: float


class PharmacistViewResponse(BaseModel):
    prescription_id: UUID
    patient_id: UUID
    doctor_id: Optional[UUID] = None
    signed_at: Optional[str] = None
    diagnosis: List[str] = []
    medicines: List[Dict[str, Any]] = []
    notes: Optional[str] = None
    follow_up_info: str = ""
