from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_summary_generation():
    payload = {
        "patient_id": "p-100",
        "kiosk_session_id": "ks-200"
    }
    response = client.post("/api/v1/summary/generate", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["data"]["summary_type"] == "INTAKE_TRIAGE"
