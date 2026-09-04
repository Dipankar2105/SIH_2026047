from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_kiosk_intake_flow():
    # Start intake session
    start_resp = client.post("/api/v1/intake/session/start", json={"kiosk_device_id": "KIOSK-001"})
    assert start_resp.status_code == 200
    session_id = start_resp.json()["data"]["id"]

    # Process dialogue turn
    turn_resp = client.post("/api/v1/intake/dialogue/turn", json={
        "kiosk_session_id": session_id,
        "patient_input": "I have severe fever and coughing"
    })
    assert turn_resp.status_code == 200
    assert "next_question" in turn_resp.json()["data"]
