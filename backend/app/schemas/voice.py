from typing import Literal

from pydantic import BaseModel, Field


class VoiceTranscriptionResponse(BaseModel):
    text: str
    language: Literal["hi", "mr"]
    language_name: str
    sample_rate: int
    model: str


class VoiceHealthResponse(BaseModel):
    status: str
    model: str
    supported_languages: list[str]
