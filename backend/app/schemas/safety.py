from uuid import UUID

from pydantic import BaseModel, Field


class SafetyFindingResponse(BaseModel):
    rule_id: str
    severity: str
    details: str


class SafetyCheckResponse(BaseModel):
    session_id: UUID
    priority: str
    red_flags: list[SafetyFindingResponse] = Field(default_factory=list)
    requires_urgent_review: bool
