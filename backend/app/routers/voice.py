from fastapi import APIRouter, UploadFile, File, Form
from app.schemas.common import ResponseWrapper
from app.services.voice.asr_service import asr_service
from app.services.voice.tts_service import tts_service

router = APIRouter(prefix="/voice", tags=["Voice & Multilingual Speech"])

@router.post("/asr")
async def transcribe_speech(
    file: UploadFile = File(...),
    language: str = Form("en")
):
    audio_content = await file.read()
    res = asr_service.transcribe_audio(audio_content, language=language)
    return ResponseWrapper(data=res, message="Speech transcribed successfully")

@router.post("/tts")
def synthesize_speech(text: str, language: str = "en"):
    res = tts_service.synthesize_speech(text, language=language)
    return ResponseWrapper(data=res, message="Speech synthesized successfully")
