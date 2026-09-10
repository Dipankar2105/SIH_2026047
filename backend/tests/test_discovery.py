import uuid
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_doctor_recommendations_and_discovery():
    # 1. Symptom-based recommendation
    res = client.post(
        "/discovery/recommend-doctor",
        json={"symptoms": "chest pain and shortness of breath"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "recommended_specialty" in data
    assert "doctors" in data
    assert len(data["doctors"]) >= 1

    # 2. Doctor listing
    doc_res = client.get("/discovery/doctors")
    assert doc_res.status_code == 200
    doctors = doc_res.json()
    assert len(doctors) >= 1
    selected_doctor = doctors[0]

    # 3. Available slots
    slots_res = client.get(f"/discovery/slots/{selected_doctor['id']}")
    assert slots_res.status_code == 200
    slots_data = slots_res.json()
    assert "available_slots" in slots_data

    # 4. Book appointment
    token_res = client.post("/identity/auth/token", json={"user_id": str(uuid.uuid4()), "role": "patient"})
    token = token_res.json()["access_token"]

    patient_res = client.post(
        "/identity/patient/register",
        json={
            "first_name": "DiscoveryTest",
            "last_name": "Patient",
            "phone": "9998887771",
            "preferred_language": "en",
        },
    )
    patient_id = patient_res.json()["id"]

    appt_time = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    book_res = client.post(
        "/discovery/book-appointment",
        json={
            "patient_id": patient_id,
            "doctor_id": selected_doctor["id"],
            "hospital_id": selected_doctor.get("hospital_id"),
            "appointment_time": appt_time,
            "reason": "Consultation for test symptoms",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert book_res.status_code in [200, 201]
    assert book_res.json()["patient_id"] == patient_id
