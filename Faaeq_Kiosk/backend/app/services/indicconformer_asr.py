"""
IndicConformer / Multilingual ASR bridge for SIH-Day Kiosk audio transcription.
Thin wrapper reusing app.services.voice.asr_service to preserve native Devanagari output
without duplicate model loading or extraneous dependencies.
"""
from app.services.voice.asr_service import transcribe_audio, SR_LANG_MAP

__all__ = ["transcribe_audio", "SR_LANG_MAP"]
