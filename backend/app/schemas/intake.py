from pydantic import BaseModel
from typing import List, Optional

class QuestionOption(BaseModel):
    label: str
    value: str

class IntakeQuestion(BaseModel):
    question_id: str
    question_text: str
    input_type: str = "text" # text, select, multi_select, voice
    options: Optional[List[QuestionOption]] = None
    step_number: int

class IntakeAnswerCreate(BaseModel):
    kiosk_session_id: str
    question_id: str
    question_text: str
    answer_text: str
    input_type: str = "text"

class IntakeAnswerResponse(IntakeAnswerCreate):
    id: str

    class Config:
        from_attributes = True

class DialogueTurnRequest(BaseModel):
    kiosk_session_id: str
    patient_input: str
    language: str = "en"
