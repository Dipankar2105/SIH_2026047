from app.services.question_engine import (
    get_first_question,
    get_next_question,
    get_progress,
)


def test_first_question():
    question = get_first_question("chest pain")

    assert question is not None
    assert question["id"] == "chest_location"


def test_next_question():
    question = get_next_question(
        "chest pain",
        "chest_location",
    )

    assert question is not None
    assert question["id"] == "chest_onset"


def test_progress():
    assert get_progress("chest pain", 1) > 0
    assert get_progress("chest pain", 100) == 1.0
