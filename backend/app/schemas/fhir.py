from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class FHIRResource(BaseModel):
    resourceType: str
    id: str

class FHIRBundle(BaseModel):
    resourceType: str = "Bundle"
    type: str = "document"
    entry: List[Dict[str, Any]]
