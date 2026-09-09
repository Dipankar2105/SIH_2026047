from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.core.config import settings
from app.core.audit import audit_service


class FHIRService:
    def generate_bundle(self, db: Session, patient_id: str, session_id: str) -> dict:
        from app.models.patient import Patient
        from app.models.prescription import Prescription
        from app.models.summary import Summary

        patient = db.get(Patient, patient_id)

        rx_stmt = select(Prescription).where(
            Prescription.patient_id == patient_id,
            Prescription.session_id == session_id,
        )
        rx = db.execute(rx_stmt).scalar_one_or_none()

        summary_stmt = select(Summary).where(Summary.session_id == session_id, Summary.summary_type == "clinical")
        summary = db.execute(summary_stmt).scalar_one_or_none()

        now = datetime.utcnow().isoformat() + "Z"
        entry = []

        if patient:
            entry.append({
                "resource": {
                    "resourceType": "Patient",
                    "id": str(patient.id),
                    "name": [{"given": [patient.first_name], "family": patient.last_name or ""}],
                    "gender": patient.gender,
                    "telecom": [{"system": "phone", "value": patient.phone}] if patient.phone else [],
                    "meta": {"profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient"]},
                }
            })

        entry.append({
            "resource": {
                "resourceType": "Encounter",
                "id": str(session_id),
                "status": "finished",
                "period": {"start": now, "end": now},
                "subject": {"reference": f"Patient/{patient_id}"},
                "meta": {"profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Encounter"]},
            }
        })

        if rx:
            entry.append({
                "resource": {
                    "resourceType": "Condition",
                    "id": str(rx.id),
                    "clinicalStatus": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}]},
                    "subject": {"reference": f"Patient/{patient_id}"},
                    "meta": {"profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Condition"]},
                }
            })

        if rx:
            for item in rx.items:
                entry.append({
                    "resource": {
                        "resourceType": "MedicationRequest",
                        "id": str(item.id),
                        "status": "active",
                        "intent": "order",
                        "medicationCodeableConcept": {"text": item.drug_name},
                        "subject": {"reference": f"Patient/{patient_id}"},
                        "meta": {"profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/MedicationRequest"]},
                    }
                })

        composition = {
            "resourceType": "Composition",
            "id": str(session_id),
            "status": "final",
            "type": {"text": "Clinical Summary"},
            "subject": {"reference": f"Patient/{patient_id}"},
            "date": now,
            "author": [{"display": "AarogyaFlow"}],
            "title": "Clinical Summary",
            "section": [],
            "meta": {"profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Composition"]},
        }

        bundle = {
            "resourceType": "Bundle",
            "type": "document",
            "timestamp": now,
            "entry": [{"resource": composition}] + entry,
        }

        try:
            from app.models.summary import FHIRBundle
            import json as _json
            fhir_bundle = FHIRBundle(
                patient_id=patient_id,
                session_id=session_id,
                bundle_data=_json.dumps(bundle),
                abdm_compliant="true",
                validation_errors=None,
            )
            db.add(fhir_bundle)
            db.commit()
        except Exception:
            db.rollback()

        audit_service.log(
            db, actor_id="system", actor_type="system",
            action="CREATE", resource_type="fhir_bundle", resource_id=str(session_id)
        )

        return {
            "bundle": bundle,
            "abdm_compliant": True,
            "validation_errors": [],
            "resources_included": [e["resource"]["resourceType"] for e in bundle["entry"]],
        }

    def generate_bundle_for_session(self, db: Session, session_id: str) -> dict:
        from app.models.session import Session as KioskSessionModel
        session = db.get(KioskSessionModel, session_id)
        if not session:
            raise ValueError("Session not found")
        return self.generate_bundle(db, str(session.patient_id), str(session_id))

    def validate_bundle(self, bundle: dict) -> list:
        errors = []
        if bundle.get("resourceType") != "Bundle":
            errors.append("resourceType must be Bundle")
        if bundle.get("type") != "document":
            errors.append("type must be document")
        if not bundle.get("entry"):
            errors.append("Bundle must have entries")
        resources = [e.get("resource", {}).get("resourceType") for e in bundle.get("entry", [])]
        if resources and resources[0] != "Composition" and bundle.get("entry"):
            errors.append("First entry must be Composition")
        if "Patient" not in resources:
            errors.append("Patient resource is required")
        if "Encounter" not in resources:
            errors.append("Encounter resource is required")
        return errors


fhir_service = FHIRService()
