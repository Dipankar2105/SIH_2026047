import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_clinical_summary_lifecycle():
    # 1. Register patient
    p_res = client.post(
        "/identity/patient/register",
        json={"first_name": "SummaryTest", "last_name": "Patient", "phone": "9665544332"},
    )
    patient_id = p_res.json()["id"]

    # 2. Doctor token
    doc_token_res = client.post("/identity/auth/token", json={"user_id": str(uuid.uuid4()), "role": "doctor"})
    doc_token = doc_token_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {doc_token}"}

    # 3. Create manual summary
    create_res = client.post(
        "/summary",
        json={
            "patient_id": patient_id,
            "summary_text": "Initial physical examination shows stable vitals. Follow up in 3 days.",
            "summary_type": "clinical",
        },
        headers=headers,
    )
    assert create_res.status_code in [200, 201]
    summary_id = create_res.json()["id"]

    # 4. Generate summary from intake
    gen_res = client.post(
        "/summary/generate",
        json={
            "patient_id": patient_id,
            "recommended_specialty": "General Medicine",
        },
        headers=headers,
    )
    assert gen_res.status_code in [200, 201]
    assert gen_res.json()["patient_id"] == patient_id

    # 5. Update summary
    update_res = client.put(
        f"/summary/{summary_id}",
        json={
            "summary_text": "Updated after lab tests: mild viral infection. Rest advised.",
            "status": "finalized",
        },
        headers=headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "finalized"

    # 6. Retrieve patient summaries
    list_res = client.get(f"/summary/patient/{patient_id}", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 2


def test_generate_summary_api():
    from unittest.mock import patch, MagicMock
    from uuid import UUID

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
        doctor_token = client.post("/identity/auth/token", json={"user_id": "00000000-0000-0000-0000-000000000000", "role": "doctor"}).json()["access_token"]
        response = client.post("/api/summary/generate", json=payload, headers={"Authorization": f"Bearer {doctor_token}"})
        assert response.status_code == 201
        assert "summary_text" in response.json()


def test_review_summary_api():
    from unittest.mock import patch

    with patch("app.routers.summary.summary_service") as mock_service:
        mock_service.review_summary.return_value = {
            "summary_id": "00000000-0000-0000-0000-000000000000",
            "action": "accept",
            "status": "completed",
            "message": "Summary accepted successfully",
        }
        payload = {"action": "accept"}
        doctor_token = client.post("/identity/auth/token", json={"user_id": "00000000-0000-0000-0000-000000000000", "role": "doctor"}).json()["access_token"]
        response = client.post("/api/summary/00000000-0000-0000-0000-000000000000/review", json=payload, headers={"Authorization": f"Bearer {doctor_token}"})
        assert response.status_code == 200
