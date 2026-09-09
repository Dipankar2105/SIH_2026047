from app.services.intake_ai import process_patient_answer


def extract_patient_answer(
    question: str,
    answer: str,
) -> dict:
    """
    Thin integration layer between the intake router
    and the Gemini language-understanding service.
    """

    return process_patient_answer(
        question=question,
        answer=answer,
    )
