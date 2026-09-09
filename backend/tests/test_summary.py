from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from uuid import UUID
from app.main import app

client = TestClient(app)


def test_generate_summary():
    mock_summary = MagicMock()
    mock_summary.id = UUID("00000000-0000-0000-0000-000000000000")
    mock_summary.patient_id = UUID("00000000-0000-0000-0000-000000000001")
    mock_summary.session_id = UUID("00000000-0000-0000-0000-000000000002")
    mock_summary.summary_text = "[AI_DRAFT]\nTest SOAP note"
    mock_summary.status = "draft"
    mock_summary.doctor_id = None
    mock_summary.summary_type = "clinical"
    mock_summary.created_at = "2024-01-01T00:00:00"

    with patch("app.routers.summary.summary_service") as mock_service:
        mock_service.generate_clinical_summary.return_value = mock_summary
        payload = {"patient_id": "00000000-0000-0000-0000-000000000001", "session_id": "00000000-0000-0000-0000-000000000002"}
        response = client.post("/api/summary/generate", json=payload, headers={"X-User-Role": "doctor"})
        assert response.status_code == 201
        assert "summary_text" in response.json()


def test_review_summary():
    with patch("app.routers.summary.summary_service") as mock_service:
        mock_service.review_summary.return_value = {"summary_id": "00000000-0000-0000-0000-000000000000", "action": "accept", "status": "completed", "message": "Summary accepted successfully"}
        payload = {"action": "accept"}
        response = client.post("/api/summary/00000000-0000-0000-0000-000000000000/review", json=payload, headers={"X-User-Role": "doctor"})
        assert response.status_code == 200
