from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.voice import asr_service, tts_service

router = APIRouter(prefix="/voice", tags=["Voice & Multilingual AI"])


class TranscribeRequest(BaseModel):
    audio_base64: Optional[str] = None
    language: Optional[str] = "en"


class TranscribeResponse(BaseModel):
    text: str
    language: str
    confidence: float
    duration_seconds: float


class SynthesizeRequest(BaseModel):
    text: str
    language: Optional[str] = "en"
    voice_gender: Optional[str] = "female"


class SynthesizeResponse(BaseModel):
    text: str
    language: str
    voice_gender: str
    audio_format: str
    audio_base64: str


@router.post("/transcribe", response_model=TranscribeResponse)
def transcribe_voice_endpoint(req: TranscribeRequest):
    """
    Transcribes audio into text for multilingual kiosk conversational intake.
    """
    res = asr_service.transcribe_audio(
        audio_base64=req.audio_base64,
        language=req.language or "en",
    )
    return TranscribeResponse(**res)


@router.post("/synthesize", response_model=SynthesizeResponse)
def synthesize_voice_endpoint(req: SynthesizeRequest):
    """
    Synthesizes voice audio from clinical text prompts in the chosen language.
    """
    res = tts_service.synthesize_speech(
        text=req.text,
        language=req.language or "en",
        voice_gender=req.voice_gender or "female",
    )
    return SynthesizeResponse(**res)
