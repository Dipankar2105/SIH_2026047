from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_red_flag_emergency_evaluation():
    start_resp = client.post("/api/v1/intake/session/start", json={"kiosk_device_id": "KIOSK-002"})
    session_id = start_resp.json()["data"]["id"]

    eval_resp = client.post(f"/api/v1/safety/evaluate/{session_id}?symptom_text=crushing chest pain radiating to arm")
    assert eval_resp.status_code == 200
    data = eval_resp.json()["data"]
    assert data["is_emergency"] is True
    assert data["triage_priority"] == "RED"
