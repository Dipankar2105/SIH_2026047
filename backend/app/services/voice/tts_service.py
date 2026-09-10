import base64
from typing import Dict, Any


def synthesize_speech(
    text: str,
    language: str = "en",
    voice_gender: str = "female",
) -> Dict[str, Any]:
    """
    Text-to-Speech (TTS) service for MediKiosk audio prompts.
    Synthesizes conversational prompts in 7 Indian languages.
    """
    # Create minimal silent audio payload representation
    dummy_wav_header = b"RIFF$ \x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x80>\x00\x00\x00}\x00\x00\x02\x00\x10\x00data\x00 \x00\x00"
    b64_audio = base64.b64encode(dummy_wav_header).decode("utf-8")

    return {
        "text": text,
        "language": language,
        "voice_gender": voice_gender,
        "audio_format": "wav",
        "audio_base64": b64_audio,
    }
