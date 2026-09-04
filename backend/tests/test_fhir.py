from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_fhir_patient_bundle_export():
    # Register patient first
    import uuid
    uid = uuid.uuid4().hex[:6]
    reg_payload = {
        "full_name": "FHIR Patient",
        "phone_number": f"9123{uid[:6]}",
        "gender": "FEMALE",
        "abha_number": f"91-0000-{uid[:4]}-2222"
    }
    reg_resp = client.post("/api/v1/identity/register", json=reg_payload)
    patient_id = reg_resp.json()["data"]["id"]

    # Export FHIR bundle
    fhir_resp = client.get(f"/api/v1/fhir/Patient/{patient_id}/$export")
    assert fhir_resp.status_code == 200
    bundle = fhir_resp.json()["data"]
    assert bundle["resourceType"] == "Bundle"
    assert len(bundle["entry"]) >= 1
    assert bundle["entry"][0]["resource"]["resourceType"] == "Patient"
