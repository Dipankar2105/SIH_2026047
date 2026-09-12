import base64
import io
import subprocess
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

DUMMY_WAV_HEADER = b"RIFF$ \x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x80>\x00\x00\x00}\x00\x00\x02\x00\x10\x00data\x00 \x00\x00"

LANG_MAP = {
    "mr": "mr",
    "mr-in": "mr",
    "hi": "hi",
    "hi-in": "hi",
    "en": "en",
    "en-in": "en",
    "ta": "ta",
    "te": "te",
    "kn": "kn",
    "bn": "bn",
}


def synthesize_speech(
    text: str,
    language: str = "en",
    voice_gender: str = "female",
) -> Dict[str, Any]:
    """
    Text-to-Speech (TTS) service for MediKiosk audio prompts.
    Synthesizes conversational prompts in Marathi, Hindi, English and other Indian languages.
    """
    clean_text = (text or "").strip()
    if not clean_text:
        return {
            "text": text,
            "language": language,
            "voice_gender": voice_gender,
            "audio_format": "wav",
            "audio_base64": base64.b64encode(DUMMY_WAV_HEADER).decode("utf-8"),
        }

    lang_code = LANG_MAP.get(language.lower().strip(), "en")

    try:
        from gtts import gTTS
        fp = io.BytesIO()
        tts = gTTS(text=clean_text, lang=lang_code)
        tts.write_to_fp(fp)
        mp3_bytes = fp.getvalue()

        # Convert MP3 to WAV using ffmpeg
        proc = subprocess.Popen(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", "pipe:0", "-f", "wav", "pipe:1"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        wav_bytes, err = proc.communicate(input=mp3_bytes, timeout=10)
        if proc.returncode == 0 and wav_bytes:
            b64_audio = base64.b64encode(wav_bytes).decode("utf-8")
        else:
            b64_audio = base64.b64encode(mp3_bytes).decode("utf-8")
    except Exception as e:
        logger.warning("TTS generation fallback: %s", e)
        b64_audio = base64.b64encode(DUMMY_WAV_HEADER).decode("utf-8")

    return {
        "text": text,
        "language": language,
        "voice_gender": voice_gender,
        "audio_format": "wav",
        "audio_base64": b64_audio,
    }

