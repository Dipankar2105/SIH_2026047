from pydantic import BaseModel
from typing import List, Optional

class RedFlagTrigger(BaseModel):
    rule_id: str
    severity: str # CRITICAL, HIGH, MODERATE
    trigger_symptom: str
    recommendation: str

class TriageEvaluationResponse(BaseModel):
    kiosk_session_id: str
    is_emergency: bool
    triage_priority: str # RED, YELLOW, GREEN
    red_flags: List[RedFlagTrigger]
    action_required: str
