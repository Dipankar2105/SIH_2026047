from pydantic import BaseModel
from typing import Optional

class ASRResponse(BaseModel):
    transcription: str
    language_detected: str
    confidence: float

class TTSRequest(BaseModel):
    text: str
    language: Optional[str] = "en"

class TTSResponse(BaseModel):
    audio_url: str
    format: str
    language: str
    text: str
