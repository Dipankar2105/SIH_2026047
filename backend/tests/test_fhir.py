import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_fhir_bundle_export_and_abdm_compliance():
    # 1. Register patient
    p_res = client.post(
        "/identity/patient/register",
        json={
            "first_name": "FHIR",
            "last_name": "Patient",
            "phone": "9811223344",
            "abha_id": f"91-{uuid.uuid4().hex[:12]}",
            "gender": "male",
        },
    )
    assert p_res.status_code == 200
    patient_id = p_res.json()["id"]

    # 2. Authenticate as doctor
    doc_token_res = client.post("/identity/auth/token", json={"user_id": str(uuid.uuid4()), "role": "doctor"})
    doc_token = doc_token_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {doc_token}"}

    # 3. Create prescription
    client.post(
        "/prescriptions",
        json={
            "patient_id": patient_id,
            "notes": "FHIR export test prescription",
            "items": [
                {
                    "drug_name": "Paracetamol 650mg",
                    "dosage": "1 tablet",
                    "frequency": "TDS",
                    "duration": "5 days",
                    "quantity": 15,
                }
            ],
        },
        headers=headers,
    )

    # 4. Export FHIR R4 Bundle
    fhir_res = client.get(f"/fhir/Patient/{patient_id}/$export", headers=headers)
    assert fhir_res.status_code == 200
    bundle = fhir_res.json()

    assert bundle["resourceType"] == "Bundle"
    assert bundle["type"] == "document"
    assert len(bundle["entry"]) >= 2

    resource_types = [e["resource"]["resourceType"] for e in bundle["entry"]]
    assert "Patient" in resource_types
    assert "MedicationRequest" in resource_types

    # 5. Query saved bundles
    bundle_list_res = client.get(f"/fhir/patient/{patient_id}/bundles", headers=headers)
    assert bundle_list_res.status_code == 200
    assert len(bundle_list_res.json()) >= 1


def test_validate_bundle_valid():
    from app.services.fhir.fhir_service import fhir_service

    bundle = {
        "resourceType": "Bundle",
        "type": "document",
        "entry": [
            {"resource": {"resourceType": "Composition"}},
            {"resource": {"resourceType": "Patient"}},
            {"resource": {"resourceType": "Encounter"}},
        ],
    }
    errors = fhir_service.validate_bundle(bundle)
    assert errors == []


def test_validate_bundle_invalid():
    from app.services.fhir.fhir_service import fhir_service

    bundle = {"resourceType": "Patient"}
    errors = fhir_service.validate_bundle(bundle)
    assert len(errors) > 0
    assert "resourceType must be Bundle" in errors
