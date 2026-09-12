from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from uuid import UUID
from app.main import app

client = TestClient(app)


def test_upload_document():
    mock_doc = MagicMock()
    mock_doc.id = UUID("123e4567-e89b-12d3-a456-426614174000")
    mock_doc.patient_id = UUID("123e4567-e89b-12d3-a456-426614174001")
    mock_doc.document_type = "lab_report"
    mock_doc.file_name = "test.pdf"
    mock_doc.storage_path = "path/to/file"
    mock_doc.mime_type = "application/pdf"
    mock_doc.ocr_text = "test"
    mock_doc.ocr_data = {"text": "test"}
    mock_doc.status = "extracted"
    mock_doc.created_at = "2024-01-01T00:00:00"

    with patch("app.routers.documents.document_service") as mock_service:
        mock_service.upload_document.return_value = mock_doc
        response = client.post(
            "/documents/upload",
            data={"patient_id": "123e4567-e89b-12d3-a456-426614174001", "document_type": "lab_report"},
            files={"file": ("test.pdf", b"test content", "application/pdf")},
            headers={"X-User-Role": "doctor"},
        )
        assert response.status_code == 201


def test_get_document_not_found():
    with patch("app.routers.documents.document_service") as mock_service:
        mock_service.get_document.return_value = None
        response = client.get("/documents/123e4567-e89b-12d3-a456-426614174000", headers={"X-User-Role": "doctor"})
        assert response.status_code == 404
