from app.services.adaptive_engine import (
    get_adaptive_next_question,
    infer_complaint_from_question,
    should_ask_followup,
)


def test_infer_complaint():
    assert infer_complaint_from_question(
        "chest_location"
    ) == "chest_pain"


def test_adaptive_next_question():
    question = get_adaptive_next_question(
        "chest_pain",
        ["chest_location"],
    )

    assert question is not None
    assert question["id"] == "chest_onset"


def test_followup_detection():
    assert should_ask_followup(
        "chest_associated",
        "Yes, I have difficulty breathing",
    )


def test_no_followup_for_simple_answer():
    assert not should_ask_followup(
        "chest_location",
        "center of chest",
    )
