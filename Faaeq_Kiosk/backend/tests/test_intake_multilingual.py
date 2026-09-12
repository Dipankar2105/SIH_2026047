import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_intake_questions_all_7_languages():
    """Verify GET /intake/questions returns localized questions for all 7 languages."""
    languages = ["en", "hi", "mr", "ta", "te", "kn", "bn"]

    for lang in languages:
        resp = client.get(f"/intake/questions?language={lang}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["language"] == lang
        assert len(data["questions"]) >= 5

        # Verify questions have non-empty localized text
        for q in data["questions"]:
            assert q["text"], f"Question {q['id']} has empty text in language {lang}"
            assert len(q["text"]) > 5

    # Specific script assertions
    # Hindi question 1 has Hindi script
    hi_resp = client.get("/intake/questions?language=hi").json()
    assert "नमस्ते" in hi_resp["questions"][0]["text"]

    # Marathi question 1 has Marathi script
    mr_resp = client.get("/intake/questions?language=mr").json()
    assert "मेडीकियोस्क मध्ये आपले स्वागत आहे" in mr_resp["questions"][0]["text"]

    # Kannada question 1 has Kannada script
    kn_resp = client.get("/intake/questions?language=kn").json()
    assert "ನಮಸ್ಕಾರ" in kn_resp["questions"][0]["text"]

    # Bengali question 1 has Bengali script
    bn_resp = client.get("/intake/questions?language=bn").json()
    assert "নমস্কার" in bn_resp["questions"][0]["text"]


def test_intake_message_multilingual_chat():
    """Verify POST /intake/message conducts conversational intake in patient's language."""
    # Turn 1: Normal headache in Marathi
    resp = client.post(
        "/intake/message",
        json={"message": "माझे डोके दुखत आहे", "language": "mr", "step": 0}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_urgent"] is False
    assert data["triage_priority"] == "normal"
    assert data["next_step"] == 1
    # Next question is in Marathi (duration)
    assert "दिवसांपासून" in data["next_question"]


def test_intake_emergency_red_flag_in_hindi():
    """Verify emergency chest pain symptoms trigger immediate localized Red-Flag alert."""
    resp = client.post(
        "/intake/message",
        json={"message": "मुझे बहुत तेज सीने में दर्द और सांस फूल रही है", "language": "hi", "step": 0}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_urgent"] is True
    assert data["triage_priority"] == "emergency"
    assert data["recommended_specialty"] == "Cardiology"
    # Alert is in Hindi
    assert "आपातकालीन चेतावनी" in data["reply"]


def test_intake_emergency_red_flag_in_english():
    """Verify emergency chest pain in English activates critical triage."""
    resp = client.post(
        "/intake/message",
        json={"message": "I have severe chest pain and breathlessness", "language": "en", "step": 0}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_urgent"] is True
    assert data["triage_priority"] == "emergency"
    assert "CRITICAL TRIAGE ALERT" in data["reply"]
