from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_document_upload_and_ocr():
    files = {'file': ('test_report.pdf', b'Dummy PDF content', 'application/pdf')}
    data = {
        'patient_id': 'patient-123',
        'title': 'Blood Test Report',
        'document_type': 'LAB_REPORT'
    }
    response = client.post("/api/v1/documents/upload", data=data, files=files)
    assert response.status_code == 200
    res = response.json()
    assert res["data"]["ocr_status"] == "COMPLETED"
