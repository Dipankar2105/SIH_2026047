import pytest
from app.services.fhir.fhir_service import fhir_service

def test_validate_bundle_valid():
    bundle = {
        "resourceType": "Bundle",
        "type": "document",
        "entry": [
            {"resource": {"resourceType": "Composition"}},
            {"resource": {"resourceType": "Patient"}},
            {"resource": {"resourceType": "Encounter"}},
        ]
    }
    errors = fhir_service.validate_bundle(bundle)
    assert errors == []

def test_validate_bundle_invalid():
    bundle = {"resourceType": "Patient"}
    errors = fhir_service.validate_bundle(bundle)
    assert len(errors) > 0
    assert "resourceType must be Bundle" in errors
