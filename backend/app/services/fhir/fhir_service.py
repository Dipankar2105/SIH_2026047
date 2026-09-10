import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.patient import Patient
from app.models.prescription import Prescription
from app.models.document import Document
from app.models.appointment import Appointment
from app.models.summary import Summary
from app.models.session import Session as KioskSessionModel
from app.models.fhir_bundle import FHIRBundle
from app.schemas.fhir import FHIRBundleCreate
from app.core.audit import audit_service


class FHIRService:
    def validate_bundle(self, bundle: dict) -> list:
        errors = []
        if not isinstance(bundle, dict):
            return ["Invalid bundle format: must be JSON object"]
        if bundle.get("resourceType") != "Bundle":
            errors.append("resourceType must be Bundle")
        if bundle.get("type") != "document":
            errors.append("type must be document")
        if not bundle.get("entry"):
            errors.append("Bundle must have entries")
        resources = [e.get("resource", {}).get("resourceType") for e in bundle.get("entry", []) if isinstance(e, dict)]
        if resources and resources[0] != "Composition" and bundle.get("entry"):
            errors.append("First entry must be Composition")
        if "Patient" not in resources:
            errors.append("Patient resource is required")
        if "Encounter" not in resources:
            errors.append("Encounter resource is required")
        return errors

    def generate_bundle(self, db: Session, patient_id: Any, session_id: Any) -> dict:
        if isinstance(patient_id, str):
            try:
                patient_id = uuid.UUID(patient_id)
            except Exception:
                pass

        if isinstance(session_id, str):
            try:
                session_id = uuid.UUID(session_id)
            except Exception:
                pass

        patient = db.get(Patient, patient_id) if patient_id else None

        if session_id:
            rx_list = db.query(Prescription).filter(
                Prescription.patient_id == patient_id,
                Prescription.session_id == session_id,
            ).all()
        else:
            rx_list = db.query(Prescription).filter(
                Prescription.patient_id == patient_id,
            ).all()

        from app.models.doctor import Doctor
        doctor_ids = {rx.doctor_id for rx in rx_list if rx.doctor_id}
        doctors = db.query(Doctor).filter(Doctor.id.in_(doctor_ids)).all() if doctor_ids else []

        now = datetime.now(timezone.utc).isoformat()
        entry = []

        if patient:
            entry.append({
                "resource": {
                    "resourceType": "Patient",
                    "id": str(patient.id),
                    "name": [{"given": [patient.first_name], "family": patient.last_name or ""}],
                    "gender": (patient.gender or "unknown").lower(),
                    "telecom": [{"system": "phone", "value": patient.phone}] if patient.phone else [],
                    "meta": {"profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient"]},
                }
            })

        entry.append({
            "resource": {
                "resourceType": "Encounter",
                "id": str(session_id) if session_id else str(uuid.uuid4()),
                "status": "finished",
                "period": {"start": now, "end": now},
                "subject": {"reference": f"Patient/{patient_id}"},
                "meta": {"profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Encounter"]},
            }
        })

        for doctor in doctors:
            identifiers = []
            if doctor.registration_number:
                identifiers.append({"system": "https://doctor.ndhm.gov.in", "value": doctor.registration_number})
            if doctor.hpr_id:
                identifiers.append({"system": "https://hpr.abdm.gov.in", "value": doctor.hpr_id})
            
            entry.append({
                "resource": {
                    "resourceType": "Practitioner",
                    "id": str(doctor.id),
                    "identifier": identifiers,
                    "name": [{"text": doctor.name}],
                    "telecom": [{"system": "phone", "value": doctor.phone}] if doctor.phone else [],
                    "meta": {"profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Practitioner"]},
                }
            })

        for rx in rx_list:
            entry.append({
                "resource": {
                    "resourceType": "Condition",
                    "id": str(rx.id),
                    "clinicalStatus": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}]},
                    "subject": {"reference": f"Patient/{patient_id}"},
                    "meta": {"profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Condition"]},
                }
            })

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
            "id": str(session_id) if session_id else str(uuid.uuid4()),
            "status": "final",
            "type": {"text": "Clinical Summary"},
            "subject": {"reference": f"Patient/{patient_id}"},
            "date": now,
            "author": [{"display": "MediKiosk / AarogyaFlow"}],
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

        validation_errs = self.validate_bundle(bundle)

        try:
            fhir_bundle = FHIRBundle(
                patient_id=patient_id,
                session_id=session_id,
                bundle_json=bundle,
                bundle_type="document",
                abdm_compliant=len(validation_errs) == 0,
                validation_errors="; ".join(validation_errs) if validation_errs else None,
            )
            db.add(fhir_bundle)
            db.commit()
        except Exception:
            db.rollback()

        audit_service.log(
            db,
            actor_id="system",
            actor_type="system",
            action="CREATE",
            resource_type="fhir_bundle",
            resource_id=str(session_id or patient_id or "bundle"),
        )

        return {
            "bundle": bundle,
            "abdm_compliant": len(validation_errs) == 0,
            "validation_errors": validation_errs,
            "resources_included": [e["resource"]["resourceType"] for e in bundle["entry"]],
        }

    def generate_bundle_for_session(self, db: Session, session_id: Any) -> dict:
        if isinstance(session_id, str):
            try:
                session_id = uuid.UUID(session_id)
            except Exception:
                pass

        session = db.get(KioskSessionModel, session_id)
        if not session:
            raise ValueError("Session not found")
        return self.generate_bundle(db, str(session.patient_id), str(session_id))

    def export_patient_bundle(self, db: Session, patient_id: Any, session_id: Optional[Any] = None) -> Dict[str, Any]:
        res = self.generate_bundle(db, patient_id, session_id)
        return res["bundle"]

    def save_fhir_bundle(self, db: Session, bundle_in: FHIRBundleCreate) -> FHIRBundle:
        fb = FHIRBundle(
            patient_id=bundle_in.patient_id,
            session_id=bundle_in.session_id,
            bundle_type=bundle_in.bundle_type,
            bundle_json=bundle_in.bundle_json,
            abdm_compliant=bundle_in.abdm_compliant,
        )
        db.add(fb)
        db.commit()
        db.refresh(fb)
        return fb

    def get_patient_fhir_bundles(self, db: Session, patient_id: Any) -> List[FHIRBundle]:
        if isinstance(patient_id, str):
            try:
                patient_id = uuid.UUID(patient_id)
            except Exception:
                pass
        return db.query(FHIRBundle).filter(FHIRBundle.patient_id == patient_id).order_by(FHIRBundle.created_at.desc()).all()


fhir_service = FHIRService()

# Standalone functions for Track A backwards compatibility
def export_patient_bundle(db: Session, patient_id: uuid.UUID, session_id: Optional[uuid.UUID] = None) -> Dict[str, Any]:
    return fhir_service.export_patient_bundle(db, patient_id, session_id)

def save_fhir_bundle(db: Session, bundle_in: FHIRBundleCreate) -> FHIRBundle:
    return fhir_service.save_fhir_bundle(db, bundle_in)

def get_patient_fhir_bundles(db: Session, patient_id: uuid.UUID) -> List[FHIRBundle]:
    return fhir_service.get_patient_fhir_bundles(db, patient_id)
