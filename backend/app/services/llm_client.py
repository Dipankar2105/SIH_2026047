from __future__ import annotations

from typing import List

from pydantic import BaseModel, Field

from app.config import settings


class ExtractedSlot(BaseModel):
    key: str = Field(
        description="Short name of a clinical fact explicitly stated by the patient."
    )

    value: str = Field(
        description="The value of the clinical fact explicitly stated by the patient."
    )


class GeminiExtraction(BaseModel):
    normalized_answer: str = Field(
        description="Concise normalized version of the patient's answer."
    )

    slots: List[ExtractedSlot] = Field(
        default_factory=list,
        description="Clinical facts explicitly contained in the answer."
    )

    symptoms: List[str] = Field(
        default_factory=list,
        description="Symptoms explicitly reported by the patient."
    )

    negated_symptoms: List[str] = Field(
        default_factory=list,
        description="Symptoms explicitly denied by the patient."
    )

    confidence: float = Field(
        description="Confidence from 0.0 to 1.0 that the answer was understood."
    )


def _fallback_extraction(question: str, answer: str) -> dict:
    """
    Safe fallback used when Gemini is unavailable.

    The raw answer is preserved.
    No diagnosis or triage decision is made here.
    """

    cleaned = (answer or "").strip()

    return {
        "question": question,
        "answer": answer,
        "normalized_answer": cleaned,
        "slots": {
            "answer": cleaned
        },
        "symptoms": [],
        "negated_symptoms": [],
        "confidence": 0.0,
        "provider": "fallback",
    }


def extract_structured_answer(question: str, answer: str) -> dict:
    """
    Convert a patient's natural-language answer into structured data.

    Gemini is used ONLY for language understanding and slot extraction.

    Gemini must NOT:
    - diagnose
    - determine emergency status
    - assign triage priority
    - recommend treatment
    - invent symptoms
    """

    if not answer or not answer.strip():
        return _fallback_extraction(question, answer)

    if not settings.gemini_api_key:
        return _fallback_extraction(question, answer)

    try:

        from google import genai
        from google.genai import types

        client = genai.Client(
            api_key=settings.gemini_api_key
        )

        system_instruction = """
You are the language-understanding component of AarogyaFlow.

Your ONLY responsibility is to understand and structure what a patient says.

Extract only information explicitly present in the patient's answer.

Do NOT:
- diagnose
- predict a disease
- assign emergency status
- assign triage priority
- recommend medicine
- recommend treatment
- invent symptoms
- invent duration
- invent severity
- infer facts not supported by the answer

Preserve negation carefully.

For example:
"I do not have fever"
must NOT become:
"fever"

The safety engine outside Gemini is responsible for red-flag detection and triage.
"""

        prompt = f"""
Question asked to patient:

{question}

Patient's answer:

{answer}

Return structured information based ONLY on the patient's answer.
"""

        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=GeminiExtraction,
            ),
        )

        if not response.text:
            return _fallback_extraction(question, answer)

        parsed = GeminiExtraction.model_validate_json(
            response.text
        )

        slots = {
            item.key: item.value
            for item in parsed.slots
        }

        return {
            "question": question,
            "answer": answer,
            "normalized_answer": parsed.normalized_answer,
            "slots": slots,
            "symptoms": parsed.symptoms,
            "negated_symptoms": parsed.negated_symptoms,
            "confidence": max(
                0.0,
                min(1.0, float(parsed.confidence))
            ),
            "provider": "gemini",
        }

    except Exception as exc:

        # Do not expose API credentials.
        # Preserve intake even if Gemini fails.
        print(
            f"[Gemini] Extraction failed: "
            f"{type(exc).__name__}: {exc}"
        )

        return _fallback_extraction(
            question,
            answer
        )


def validate_llm_output(data: dict) -> bool:

    if not isinstance(data, dict):
        return False

    required = {
        "question",
        "answer",
        "normalized_answer",
        "slots",
        "symptoms",
        "negated_symptoms",
        "confidence",
        "provider",
    }

    if not required.issubset(data.keys()):
        return False

    if not isinstance(data["slots"], dict):
        return False

    if not isinstance(data["symptoms"], list):
        return False

    if not isinstance(data["negated_symptoms"], list):
        return False

    if not isinstance(data["confidence"], (int, float)):
        return False

    if not 0.0 <= float(data["confidence"]) <= 1.0:
        return False

    return True
