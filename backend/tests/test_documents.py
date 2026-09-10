import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_documents_lifecycle_and_ocr():
    # 1. Register patient
    p_res = client.post(
        "/identity/patient/register",
        json={"first_name": "DocTest", "last_name": "User", "phone": "9887766554"},
    )
    assert p_res.status_code == 200
    patient_id = p_res.json()["id"]

    # 2. Generate patient token
    t_res = client.post("/identity/auth/token", json={"user_id": patient_id, "role": "patient"})
    token = t_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Grant consent
    client.post(
        "/identity/consent/grant",
        json={
            "patient_id": patient_id,
            "consent_type": "health_record_sharing",
            "purpose": "Digital Health Locker Storage",
            "expires_in_hours": 72,
        },
        headers=headers,
    )

    # 4. Upload document
    doc_res = client.post(
        "/documents/upload",
        json={
            "patient_id": patient_id,
            "document_type": "prescription_scan",
            "file_name": "prescription_report.pdf",
            "storage_path": "https://storage.medikiosk.in/prescriptions/prescription_report.pdf",
            "mime_type": "application/pdf",
            "ocr_text": "Rx: Tab Paracetamol 500mg, Cap Amoxicillin 250mg. Diagnosis: Fever and mild hypertension. BP 120/80 mmhg.",
        },
        headers=headers,
    )
    assert doc_res.status_code in [200, 201]
    doc_data = doc_res.json()
    assert doc_data["patient_id"] == patient_id
    assert "ocr_data" in doc_data
    assert doc_data["ocr_data"] is not None

    # 5. Get patient documents
    list_res = client.get(f"/documents/patient/{patient_id}", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 6. Longitudinal timeline
    timeline_res = client.get(f"/documents/timeline/{patient_id}", headers=headers)
    assert timeline_res.status_code == 200
    assert "events" in timeline_res.json()

    # 7. Unified patient record
    unified_res = client.get(f"/documents/unified/{patient_id}", headers=headers)
    assert unified_res.status_code == 200
    unified_data = unified_res.json()
    assert "profile" in unified_data
    assert "documents" in unified_data

    # 8. Test Horizontal Privilege Escalation prevention
    other_patient_id = str(uuid.uuid4())
    fake_token_res = client.post("/identity/auth/token", json={"user_id": other_patient_id, "role": "patient"})
    fake_token = fake_token_res.json()["access_token"]
    forbidden_res = client.get(f"/documents/patient/{patient_id}", headers={"Authorization": f"Bearer {fake_token}"})
    assert forbidden_res.status_code == 403


def test_upload_document_track_c():
    from unittest.mock import patch, MagicMock
    from uuid import UUID

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
            "/api/documents/upload",
            data={"patient_id": "123e4567-e89b-12d3-a456-426614174001", "document_type": "lab_report"},
            files={"file": ("test.pdf", b"test content", "application/pdf")},
            headers={"Authorization": f"Bearer {client.post('/identity/auth/token', json={'user_id': '00000000-0000-0000-0000-000000000000', 'role': 'doctor'}).json()['access_token']}"},
        )
        assert response.status_code == 201


def test_get_document_not_found_track_c():
    from unittest.mock import patch

    with patch("app.routers.documents.document_service") as mock_service:
        mock_service.get_document.return_value = None
        doctor_token = client.post("/identity/auth/token", json={"user_id": "00000000-0000-0000-0000-000000000000", "role": "doctor"}).json()["access_token"]
        response = client.get("/api/documents/123e4567-e89b-12d3-a456-426614174000", headers={"Authorization": f"Bearer {doctor_token}"})
        assert response.status_code == 404
