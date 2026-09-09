from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, Response
from pydantic import BaseModel

from app.schemas.voice import (
    VoiceHealthResponse,
    VoiceTranscriptionResponse,
)
from app.services.indicconformer_asr import MODEL_NAME
from app.services.asr_engine import transcribe_speech
from app.services.tts_engine import synthesize_speech


class TTSSynthesizeRequest(BaseModel):
    text: str
    language: str = "hi"


router = APIRouter(
    prefix="/voice",
    tags=["Voice"],
)


@router.get(
    "/health",
    response_model=VoiceHealthResponse,
)
def voice_health():
    return VoiceHealthResponse(
        status="ok",
        model=MODEL_NAME,
        supported_languages=["hi", "mr", "en"],
    )


@router.post(
    "/transcribe",
    response_model=VoiceTranscriptionResponse,
)
async def transcribe_voice(
    audio: UploadFile = File(...),
    language: str = Query(
        default="hi",
        pattern="^(hi|mr|en)$",
    ),
):
    """
    Transcribe Hindi, Marathi, or English audio using local ASR engines.
    """
    if not audio.filename:
        raise HTTPException(
            status_code=400,
            detail="Audio filename is missing.",
        )

    extension = Path(audio.filename).suffix.lower()

    if extension != ".wav":
        raise HTTPException(
            status_code=400,
            detail="Please upload a WAV audio file.",
        )

    temp_path = None

    try:
        audio_bytes = await audio.read()

        if not audio_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded audio file is empty.",
            )

        with NamedTemporaryFile(
            suffix=".wav",
            delete=False,
        ) as temp_file:

            temp_file.write(audio_bytes)
            temp_path = Path(temp_file.name)

        result = transcribe_speech(
            temp_path,
            language=language,
        )

        return VoiceTranscriptionResponse(
            text=result["text"],
            language=result["language"],
            language_name=result.get("language_name", result["language"]),
            sample_rate=result.get("sample_rate", 16000),
            model=result.get("model", MODEL_NAME),
        )

    except HTTPException:
        raise

    except Exception as exc:
        print("ASR transcription error:")
        print(exc)

        raise HTTPException(
            status_code=500,
            detail=f"Audio transcription failed: {exc}",
        )

    finally:
        if temp_path is not None:
            try:
                temp_path.unlink(missing_ok=True)
            except Exception:
                pass


@router.post(
    "/synthesize",
)
def synthesize_voice_audio(
    request: TTSSynthesizeRequest,
):
    """
    Synthesize text prompt to audio (WAV) in Hindi, Marathi, or English.
    """
    try:
        audio_data = synthesize_speech(
            text=request.text,
            language=request.language,
        )

        return Response(
            content=audio_data,
            media_type="audio/wav",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"TTS Synthesis failed: {exc}",
        )

