from uuid import UUID

from pydantic import BaseModel, Field


class IntakeStartRequest(BaseModel):
    complaint: str = Field(min_length=1)
    system: str = "allopathic"


class IntakeStartResponse(BaseModel):
    session_id: UUID
    complaint: str
    system: str
    question_id: str
    question: str


class IntakeAnswerRequest(BaseModel):
    question_id: str
    answer_text: str = Field(min_length=1)
    input_mode: str = "touch"
    confidence: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
    )


class IntakeAnswerResponse(BaseModel):
    session_id: UUID
    answered_question_id: str
    next_question_id: str | None
    next_question: str | None
    progress: float
    fallback_to_touch: bool
    status: str
    priority: str
    adaptive: bool = True
    safety_alert: bool = False
    ai_extraction: dict | None = None

