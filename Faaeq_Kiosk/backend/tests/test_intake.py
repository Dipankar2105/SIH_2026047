import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_clinical_intake_workflow():
    # 1. Start kiosk session
    kiosk_res = client.post(
        "/identity/kiosk/session/start",
        json={"kiosk_id": "KIOSK-AUDIT-01", "session_duration_minutes": 30},
    )
    assert kiosk_res.status_code == 200
    kiosk_session_id = kiosk_res.json()["id"]

    # 2. Retrieve questions in Hindi
    q_res = client.get("/intake/questions?language=hi")
    assert q_res.status_code == 200
    questions_data = q_res.json()
    assert questions_data["language"] == "hi"
    assert len(questions_data["questions"]) == 5

    # 3. Process normal steps 0 and 1
    msg1_res = client.post(
        "/intake/message",
        json={
            "message": "Mild fever and sore throat",
            "language": "en",
            "step": 0,
            "session_id": kiosk_session_id,
        },
    )
    assert msg1_res.status_code == 200
    data1 = msg1_res.json()
    assert data1["is_urgent"] == False
    assert data1["next_step"] == 1
    assert data1["next_question"] is not None

    # 4. Emergency red flag triage
    em_res = client.post(
        "/intake/message",
        json={
            "message": "Sudden severe chest pain and breathlessness",
            "language": "en",
            "step": 1,
            "session_id": kiosk_session_id,
        },
    )
    assert em_res.status_code == 200
    em_data = em_res.json()
    assert em_data["is_urgent"] == True
    assert em_data["triage_priority"] == "emergency"
    assert em_data["recommended_specialty"] == "Cardiology"
