from app.services.llm_client import (
    extract_structured_answer,
    validate_llm_output,
)


def test_fallback_extraction():

    result = extract_structured_answer(
        "Where is the chest pain?",
        "The pain is on the left side of my chest.",
    )

    assert result["answer"] == (
        "The pain is on the left side of my chest."
    )

    assert "normalized_answer" in result
    assert "slots" in result
    assert "symptoms" in result
    assert "negated_symptoms" in result
    assert "confidence" in result
    assert "provider" in result


def test_validate_llm_output():

    result = {
        "question": "Where is the chest pain?",
        "answer": "Left side",
        "normalized_answer": (
            "Pain on the left side of the chest."
        ),
        "slots": {
            "location": "left side of chest"
        },
        "symptoms": [
            "chest pain"
        ],
        "negated_symptoms": [],
        "confidence": 0.95,
        "provider": "gemini",
    }

    assert validate_llm_output(result) is True


def test_invalid_llm_output():

    assert validate_llm_output({}) is False


def test_confidence_validation():

    result = {
        "question": "Question",
        "answer": "Answer",
        "normalized_answer": "Answer",
        "slots": {},
        "symptoms": [],
        "negated_symptoms": [],
        "confidence": 0.5,
        "provider": "gemini",
    }

    assert validate_llm_output(result) is True
