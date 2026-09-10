import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.common import Stringified


class FHIRBundleRequest(BaseModel):
    patient_id: uuid.UUID
    session_id: uuid.UUID
    include_resources: List[str] = ["Patient", "Encounter", "Condition", "MedicationRequest"]


class FHIRBundleCreate(BaseModel):
    patient_id: uuid.UUID
    session_id: Optional[uuid.UUID] = None
    bundle_type: str = "OPConsultation"
    bundle_json: Dict[str, Any]
    abdm_compliant: bool = True


class FHIRBundleResponse(BaseModel):
    id: Optional[uuid.UUID] = None
    patient_id: Optional[uuid.UUID] = None
    session_id: Optional[uuid.UUID] = None
    bundle_type: Optional[str] = None
    bundle_json: Optional[Dict[str, Any]] = None
    bundle: Optional[Dict[str, Any]] = None
    abdm_compliant: bool = True
    validation_errors: Optional[Union[List[str], str]] = []
    resources_included: List[str] = []
    created_at: Optional[Stringified] = None

    model_config = ConfigDict(from_attributes=True)
