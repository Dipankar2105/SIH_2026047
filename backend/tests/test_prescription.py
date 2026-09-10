import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_drug_search_and_prescription_rbac():
    # 1. Drug search autocomplete across 222K database
    search_res = client.get("/prescriptions/drugs/search?q=paracetamol&limit=5")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["count"] >= 1
    sample_drug = search_data["data"][0]
    assert "name" in sample_drug
    assert "paracetamol" in sample_drug["name"].lower() or "paracetamol" in (sample_drug.get("generic_name") or "").lower()

    # 2. Get drug by ID
    drug_res = client.get(f"/prescriptions/drugs/{sample_drug['id']}")
    assert drug_res.status_code == 200
    assert drug_res.json()["id"] == sample_drug["id"]

    # 3. Patient registration
    p_res = client.post(
        "/identity/patient/register",
        json={"first_name": "RxTest", "last_name": "Patient", "phone": "9776655443"},
    )
    patient_id = p_res.json()["id"]

    # 4. Try creating prescription as a patient -> 403 Forbidden
    patient_token_res = client.post("/identity/auth/token", json={"user_id": patient_id, "role": "patient"})
    patient_token = patient_token_res.json()["access_token"]
    forbidden_res = client.post(
        "/prescriptions",
        json={
            "patient_id": patient_id,
            "items": [{"drug_name": sample_drug["name"], "dosage": "500mg"}],
        },
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert forbidden_res.status_code == 403

    # 5. Create prescription as doctor -> 200 OK
    doctor_token_res = client.post("/identity/auth/token", json={"user_id": str(uuid.uuid4()), "role": "doctor"})
    doctor_token = doctor_token_res.json()["access_token"]
    create_res = client.post(
        "/prescriptions",
        json={
            "patient_id": patient_id,
            "notes": "Take with warm water",
            "items": [
                {
                    "drug_name": sample_drug["name"],
                    "dosage": "500mg",
                    "frequency": "Twice daily",
                    "duration": "3 days",
                    "quantity": 6,
                    "instructions": "After food",
                }
            ],
        },
        headers={"Authorization": f"Bearer {doctor_token}"},
    )
    assert create_res.status_code in [200, 201]
    rx_data = create_res.json()
    assert rx_data["patient_id"] == patient_id
    assert len(rx_data["items"]) == 1

    # 6. Patient can view their own prescriptions
    list_res = client.get(f"/prescriptions?patient_id={patient_id}", headers={"Authorization": f"Bearer {patient_token}"})
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1


def test_search_drugs_track_c():
    from unittest.mock import patch
    from uuid import UUID

    class MockDrug:
        id = UUID("00000000-0000-0000-0000-000000000000")
        name = "Paracetamol"
        generic_name = "Acetaminophen"
        strength = "500mg"
        dosage_form = "tablet"
        manufacturer = "Cipla"
        description = None
        is_active = True

    with patch("app.routers.prescription.prescription_service") as mock_service:
        mock_service.search_drugs.return_value = [MockDrug()]
        doctor_token = client.post("/identity/auth/token", json={"user_id": "00000000-0000-0000-0000-000000000000", "role": "doctor"}).json()["access_token"]
        response = client.get("/api/prescriptions/drugs/search?q=para", headers={"Authorization": f"Bearer {doctor_token}"})
        assert response.status_code == 200
        assert len(response.json()) == 1


def test_create_prescription_track_c():
    from unittest.mock import patch, MagicMock
    from uuid import UUID

    mock_rx = MagicMock()
    mock_rx.id = UUID("00000000-0000-0000-0000-000000000000")
    mock_rx.patient_id = UUID("00000000-0000-0000-0000-000000000001")
    mock_rx.doctor_id = UUID("00000000-0000-0000-0000-000000000002")
    mock_rx.session_id = None
    mock_rx.appointment_id = None
    mock_rx.status = "draft"
    mock_rx.notes = None
    mock_rx.prescribed_at = "2024-01-01T00:00:00"
    mock_rx.created_at = "2024-01-01T00:00:00"
    mock_rx.items = []

    with patch("app.routers.prescription.prescription_service") as mock_service:
        mock_service.create_prescription.return_value = mock_rx
        payload = {
            "patient_id": "00000000-0000-0000-0000-000000000001",
            "diagnosis": ["Fever"],
            "medicines": [{"drug_name": "Paracetamol", "dosage": "500mg", "frequency": "1-0-1", "duration": "5 days"}],
        }
        doctor_token = client.post("/identity/auth/token", json={"user_id": "00000000-0000-0000-0000-000000000000", "role": "doctor"}).json()["access_token"]
        response = client.post("/api/prescriptions/create", json=payload, headers={"Authorization": f"Bearer {doctor_token}"})
        assert response.status_code == 201
