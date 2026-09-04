from typing import Dict, Any

class ASRService:
    def transcribe_audio(self, audio_bytes: bytes, language: str = "en") -> Dict[str, Any]:
        """Automatic Speech Recognition (ASR) service mockup."""
        return {
            "transcription": "I have been having a severe headache and high fever for 2 days.",
            "language_detected": language,
            "confidence": 0.96
        }

asr_service = ASRService()
