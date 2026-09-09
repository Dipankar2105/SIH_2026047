from app.services.safety_engine import calculate_priority, check_answer


def test_chest_breathing_red_flag():
    findings = check_answer(
        "chest_pain",
        "chest_associated",
        "I have difficulty breathing",
    )

    assert len(findings) > 0
    assert findings[0].severity == "high"
    assert calculate_priority(findings) == "high"


def test_normal_answer():
    findings = check_answer(
        "chest_pain",
        "chest_location",
        "center of chest",
    )

    assert findings == []
    assert calculate_priority(findings) == "normal"
