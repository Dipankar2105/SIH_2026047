from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.models.prescription import Prescription

class FHIRService:
    def export_patient_bundle(self, db: Session, patient_id: str) -> Dict[str, Any]:
        """Convert patient demographics and health records into FHIR R4 Bundle."""
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            return {"resourceType": "Bundle", "type": "document", "entry": []}

        patient_resource = {
            "resource": {
                "resourceType": "Patient",
                "id": patient.id,
                "identifier": [
                    {"system": "https://healthid.abdm.gov.in", "value": patient.abha_number or "N/A"}
                ],
                "name": [{"text": patient.full_name}],
                "telecom": [{"system": "phone", "value": patient.phone_number}],
                "gender": patient.gender.lower() if patient.gender else "unknown"
            }
        }

        return {
            "resourceType": "Bundle",
            "id": f"bundle-{patient.id}",
            "type": "document",
            "entry": [patient_resource]
        }

fhir_service = FHIRService()
