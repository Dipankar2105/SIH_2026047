from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoints():
    r0 = client.get("/")
    assert r0.status_code == 200
    assert r0.json() == {"status": "ok"}

    r1 = client.get("/health")
    assert r1.status_code == 200
    assert r1.json() == {"status": "ok"}

    r2 = client.get("/api/health")
    assert r2.status_code == 200
    assert r2.json() == {"status": "ok"}


def test_openapi_schema_loaded():
    r = client.get("/openapi.json")
    assert r.status_code == 200
    data = r.json()
    assert "paths" in data
    assert "/identity/patient/register" in data["paths"]
    assert "/prescriptions" in data["paths"]
    assert "/documents/upload" in data["paths"]
    assert "/fhir/Patient/{patient_id}/$export" in data["paths"]
    assert "/safety/check" in data["paths"]
    assert "/voice/transcribe" in data["paths"]
