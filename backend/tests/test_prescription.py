from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_prescription_creation():
    payload = {
        "patient_id": "p-100",
        "doctor_id": "doc-50",
        "diagnosis": "Viral Fever",
        "notes": "Rest and hydration",
        "items": [
            {
                "drug_name": "Paracetamol",
                "dosage": "500mg",
                "frequency": "1-0-1",
                "duration_days": 3,
                "instructions": "After food"
            }
        ]
    }
    response = client.post("/api/v1/prescription", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert len(res["data"]["items"]) == 1
    assert res["data"]["items"][0]["drug_name"] == "Paracetamol"
