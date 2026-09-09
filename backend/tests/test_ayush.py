from app.services.ayush_question_banks import (
    build_ayush_mapping,
    get_ayush_pariksha_category,
    get_ayush_question_by_id,
    get_ayush_questions,
    get_ayush_question_by_id,
    get_first_ayush_question,
    get_next_ayush_question,
)


def test_ayush_questions_exist():
    questions = get_ayush_questions()

    assert questions
    assert len(questions) >= 10


def test_ayush_first_question():
    question = get_first_ayush_question()

    assert question is not None
    assert question["id"] == "ayush_prakriti"
    assert question["category"] == "prakriti"


def test_ayush_next_question():
    question = get_next_ayush_question(
        "ayush_prakriti",
        ["ayush_prakriti"],
    )

    assert question is not None

    # New AYUSH flow starts with Prakriti followed
    # by the patient's current condition (Vikriti).
    assert question["id"] == "ayush_vikriti"


def test_ayush_skips_answered_questions():
    question = get_next_ayush_question(
        "ayush_prakriti",
        [
            "ayush_prakriti",
            "ayush_vikriti",
            "ayush_symptoms",
        ],
    )

    assert question is not None
    assert question["id"] == "ayush_sara"


def test_ayush_question_lookup():
    question = get_ayush_question_by_id(
        "ayush_prakriti"
    )

    assert question is not None
    assert question["id"] == "ayush_prakriti"


def test_ayush_pariksha_category():
    assert (
        get_ayush_pariksha_category(
            "ayush_prakriti"
        )
        == "Prakriti"
    )

    assert (
        get_ayush_pariksha_category(
            "ayush_vikriti"
        )
        == "Vikriti"
    )

    assert (
        get_ayush_pariksha_category(
            "ayush_sara"
        )
        == "Sara"
    )


def test_ayush_dashavidha_categories():
    questions = get_ayush_questions()

    categories = {
        question.get("pariksha")
        for question in questions
    }

    required = {
        "Prakriti",
        "Vikriti",
        "Sara",
        "Samhanana",
        "Pramana",
        "Satmya",
        "Satva",
        "Ahara Shakti",
        "Vyayama Shakti",
        "Vaya",
    }

    assert required.issubset(categories)


def test_ayush_mapping():
    answers = [
        {
            "question_id": "ayush_prakriti",
            "answer": "Medium body build",
        },
        {
            "question_id": "ayush_vikriti",
            "answer": "Reduced appetite",
        },
        {
            "question_id": "ayush_appetite",
            "answer": "Low",
        },
        {
            "question_id": "ayush_activity",
            "answer": "Moderate",
        },
        {
            "question_id": "ayush_vaya",
            "answer": "Young adult",
        },
    ]

    mapping = build_ayush_mapping(answers)

    assert mapping["prakriti"] == "Medium body build"
    assert mapping["vikriti"] == "Reduced appetite"

    assert mapping["ahara_shakti"] == "Low"
    assert mapping["vyayama_shakti"] == "Moderate"
    assert mapping["vaya"] == "Young adult"


def test_ayush_all_questions_have_required_fields():
    questions = get_ayush_questions()

    for question in questions:
        assert "id" in question
        assert "question" in question
        assert "category" in question
        assert "pariksha" in question

        assert question["id"]
        assert question["question"]
        assert question["category"]
        assert question["pariksha"]
