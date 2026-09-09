from app.config import settings


def evaluate_voice_confidence(confidence: float) -> bool:
    return confidence < settings.low_confidence_threshold


def prepare_synthesis_text(text: str) -> str:
    return " ".join(text.strip().split())


def get_voice_provider() -> str:
    return "provider_pending"


def get_voice_response(
    text: str,
    confidence: float,
) -> dict:
    fallback = evaluate_voice_confidence(confidence)

    return {
        "text": text.strip(),
        "confidence": confidence,
        "fallback_to_touch": fallback,
        "mode": "touch" if fallback else "voice",
    }
