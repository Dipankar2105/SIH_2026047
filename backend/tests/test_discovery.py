from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_search_doctors_and_hospitals():
    # Test hospital creation
    hosp_payload = {
        "name": "Medikiosk Central Hospital",
        "address": "123 Health Ave",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "contact_number": "9876543210"
    }
    hosp_resp = client.post("/api/v1/hospital", json=hosp_payload)
    assert hosp_resp.status_code == 200

    # Test doctor search
    import uuid
    uid = uuid.uuid4().hex[:6]
    doc_payload = {
        "full_name": "Dr. Ananya Sharma",
        "registration_number": f"MCI-{uid}",
        "specialization": "Cardiology",
        "experience_years": 10,
        "phone_number": "9876543211",
        "email": f"ananya.{uid}@medikiosk.org"
    }
    doc_resp = client.post("/api/v1/discovery/doctors", json=doc_payload)
    assert doc_resp.status_code == 200

    search_resp = client.get("/api/v1/discovery/doctors?specialization=Cardiology")
    assert search_resp.status_code == 200
    assert len(search_resp.json()["data"]) >= 1
