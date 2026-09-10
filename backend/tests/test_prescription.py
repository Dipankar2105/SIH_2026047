from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from uuid import UUID
from app.main import app

client = TestClient(app)


def test_search_drugs():
    mock_drug = MagicMock()
    mock_drug.id = UUID("00000000-0000-0000-0000-000000000000")
    mock_drug.name = "Paracetamol"
    mock_drug.generic_name = "Acetaminophen"
    mock_drug.strength = "500mg"
    mock_drug.dosage_form = "tablet"
    mock_drug.manufacturer = "test"
    mock_drug.description = None
    mock_drug.is_active = True
    with patch("app.routers.prescription.prescription_service") as mock_service:
        mock_service.search_drugs.return_value = [mock_drug]
        response = client.get("/prescriptions/drugs/search?q=para", headers={"X-User-Role": "doctor"})
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 1


def test_create_prescription():
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
        response = client.post("/prescriptions/create", json=payload, headers={"X-User-Role": "doctor"})
        assert response.status_code in [200, 201]
