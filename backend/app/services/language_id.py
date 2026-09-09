import re
from typing import Literal


MARATHI_MARKERS = [
    "आहे", "नाही", "मला", "होय", "दुखत", "त्रास", "माझे", "माझ्या", "होते", "होता",
    "होती", "काय", "कधी", "आलो", "आले", "खूप", "जास्त", "कमी", "उलट्या", "डोकं", "छातीत",
]

HINDI_MARKERS = [
    "है", "नहीं", "मुझे", "हाँ", "दर्द", "तकलीफ", "मेरा", "मेरी", "मेरे", "था",
    "थी", "थे", "क्या", "कब", "बहुत", "कम", "सीने", "सिर", "उल्टी", "दस्त",
]


def detect_language(text: str) -> Literal["hi", "mr", "en"]:
    """
    Language identification for English (en), Hindi (hi), and Marathi (mr).

    Distinguishes Hindi from Marathi beyond basic script matching
    by using specific Devanagari vocabulary markers.
    """
    if not text or not text.strip():
        return "en"

    cleaned = text.strip()

    # Check for Devanagari script range (\u0900-\u097F)
    devanagari_chars = len(re.findall(r"[\u0900-\u097F]", cleaned))
    latin_chars = len(re.findall(r"[a-zA-Z]", cleaned))

    if latin_chars > devanagari_chars:
        return "en"

    # Distinguish Hindi vs Marathi in Devanagari script
    text_words = set(re.findall(r"[\u0900-\u097F]+", cleaned))

    marathi_matches = sum(1 for word in MARATHI_MARKERS if word in text_words or any(word in w for w in text_words))
    hindi_matches = sum(1 for word in HINDI_MARKERS if word in text_words or any(word in w for w in text_words))

    if marathi_matches > hindi_matches:
        return "mr"

    if hindi_matches > marathi_matches:
        return "hi"

    # Specific Marathi character checks (e.g., ळ \u0934)
    if "ळ" in cleaned:
        return "mr"

    # Default Devanagari to Hindi if balanced/ambiguous
    return "hi"
