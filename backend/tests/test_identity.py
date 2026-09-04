from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_patient_registration():
    payload = {
        "full_name": "Test Patient",
        "phone_number": "9876543210",
        "gender": "MALE",
        "age": 30
    }
    response = client.post("/api/v1/identity/register", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["data"]["full_name"] == "Test Patient"
