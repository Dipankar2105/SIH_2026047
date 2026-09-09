from uuid import UUID
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class FHIRBundleRequest(BaseModel):
    patient_id: UUID
    session_id: UUID
    include_resources: List[str] = ["Patient", "Encounter", "Condition", "MedicationRequest"]

class FHIRBundleResponse(BaseModel):
    bundle: Dict[str, Any]
    abdm_compliant: bool
    validation_errors: List[str] = []
    resources_included: List[str] = []
