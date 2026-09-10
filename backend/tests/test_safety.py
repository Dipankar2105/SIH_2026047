import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_safety_triage_and_red_flags():
    # 1. Check normal non-urgent message
    norm_res = client.post("/safety/check", json={"message": "mild headache after working on laptop"})
    assert norm_res.status_code == 200
    assert norm_res.json()["is_emergency"] == False

    # 2. Check emergency cardiac message
    cardiac_res = client.post("/safety/check", json={"message": "severe heart attack and chest pressure"})
    assert cardiac_res.status_code == 200
    cardiac_data = cardiac_res.json()
    assert cardiac_data["is_emergency"] == True
    assert cardiac_data["severity"] == "emergency"
    assert cardiac_data["recommended_specialty"] == "Cardiology"

    # 3. Check emergency respiratory message in Hindi
    hindi_res = client.post("/safety/check", json={"message": "मरीज को सांस फूलना और दम घुटना हो रहा है", "language": "hi"})
    assert hindi_res.status_code == 200
    assert hindi_res.json()["is_emergency"] == True

    # 4. List active red flags with doctor token
    doc_token_res = client.post("/identity/auth/token", json={"user_id": str(uuid.uuid4()), "role": "doctor"})
    doc_token = doc_token_res.json()["access_token"]
    flags_res = client.get("/safety/red-flags", headers={"Authorization": f"Bearer {doc_token}"})
    assert flags_res.status_code == 200
    assert isinstance(flags_res.json(), list)
