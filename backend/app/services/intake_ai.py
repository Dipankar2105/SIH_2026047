from app.services.llm_client import extract_structured_answer


def process_patient_answer(
    question: str,
    answer: str,
) -> dict:
    """
    Process a patient's natural-language answer.

    Gemini is responsible only for language understanding
    and structured extraction.

    It does NOT perform diagnosis or triage.
    """

    return extract_structured_answer(
        question=question,
        answer=answer,
    )
