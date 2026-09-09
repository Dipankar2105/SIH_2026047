import io
import math
import struct
import wave
from typing import Literal

from app.config import settings


def generate_synthetic_audio_wav(duration_seconds: float = 1.0, sample_rate: int = 16000) -> bytes:
    """
    Generate a simple 16 kHz WAV audio stream for testing/offline playback.
    """
    num_samples = int(duration_seconds * sample_rate)
    buffer = io.BytesIO()

    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)

        # Generate a gentle 440 Hz sine wave tone
        for i in range(num_samples):
            value = int(16000 * math.sin(2 * math.pi * 440 * i / sample_rate))
            data = struct.pack("<h", value)
            wav_file.writeframesraw(data)

    return buffer.getvalue()


def synthesize_speech(
    text: str,
    language: Literal["hi", "mr", "en"] = "hi",
) -> bytes:
    """
    Synthesize spoken audio for question responses in Hindi, Marathi, or English.
    Returns WAV audio bytes.
    """
    if not text or not text.strip():
        return generate_synthetic_audio_wav(0.5)

    lang = (language or "hi").lower().strip()

    try:
        from gtts import gTTS
        gtts_lang = lang if lang in ["hi", "mr", "en"] else "en"
        tts = gTTS(text=text, lang=gtts_lang)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        return fp.read()
    except Exception as exc:
        print(f"[TTS] Fallback synthetic audio notice: {exc}")
        return generate_synthetic_audio_wav(1.5)
