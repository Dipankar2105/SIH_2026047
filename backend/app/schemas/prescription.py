import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.common import Stringified


class MedicineEntry(BaseModel):
    drug_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    duration_days: Optional[int] = None
    quantity: Optional[int] = None
    instructions: Optional[str] = None


class PrescriptionItemBase(MedicineEntry):
    pass


class PrescriptionCreateRequest(BaseModel):
    patient_id: uuid.UUID
    doctor_id: Optional[uuid.UUID] = None
    appointment_id: Optional[uuid.UUID] = None
    session_id: Optional[uuid.UUID] = None
    diagnosis: Union[List[str], str, None] = []
    medicines: List[MedicineEntry] = []
    notes: Optional[str] = None


class PrescriptionCreate(BaseModel):
    patient_id: uuid.UUID
    doctor_id: Optional[uuid.UUID] = None
    appointment_id: Optional[uuid.UUID] = None
    session_id: Optional[uuid.UUID] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    items: List[PrescriptionItemBase] = []
    medicines: List[MedicineEntry] = []


class PrescriptionItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    prescription_id: Optional[uuid.UUID] = None
    drug_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    quantity: Optional[int] = None
    instructions: Optional[str] = None


class PrescriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    doctor_id: Optional[uuid.UUID] = None
    appointment_id: Optional[uuid.UUID] = None
    session_id: Optional[uuid.UUID] = None
    status: str = "active"
    notes: Optional[str] = None
    items: List[PrescriptionItemResponse] = []
    prescribed_at: Optional[Stringified] = None
    created_at: Optional[Stringified] = None


class DrugSearchResult(BaseModel):
    id: uuid.UUID
    name: str
    generic_name: Optional[str] = None
    strength: Optional[str] = None
    dosage_form: Optional[str] = None
    manufacturer: Optional[str] = None
    match_score: float = 1.0


class DrugResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    generic_name: Optional[str] = None
    strength: Optional[str] = None
    dosage_form: Optional[str] = None
    manufacturer: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True


class DrugSearchResponse(BaseModel):
    query: str
    count: int
    data: List[DrugResponse]


class PharmacistViewResponse(BaseModel):
    prescription_id: uuid.UUID
    patient_id: uuid.UUID
    doctor_id: Optional[uuid.UUID] = None
    signed_at: Optional[Stringified] = None
    diagnosis: List[str] = []
    medicines: List[Dict[str, Any]] = []
    notes: Optional[str] = None
    follow_up_info: str = ""
