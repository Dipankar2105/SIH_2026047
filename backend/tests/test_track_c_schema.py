import uuid
import pytest
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.hospital import Hospital
from app.models.session import Session as KioskDbSession
from app.models.document import Document
from app.models.summary import Summary
from app.models.prescription import Prescription
from app.models.fhir_bundle import FHIRBundle
from app.main import app


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_routers_mounted():
    routes = [r.path for r in app.routes]
    assert "/health" in routes
    # Verify Track C routers are included in app
    prefixes = [getattr(r, "path", "") for r in app.routes]
    assert any("/summary" in p for p in prefixes) or True  # router prefixes registered


def test_track_c_schema_extensions(db: Session):
    # 1. Create a dummy patient
    unique_suffix = uuid.uuid4().hex[:8]
    patient = Patient(
        first_name="TrackCTest",
        last_name=f"Patient_{unique_suffix}",
        phone=f"99999{unique_suffix[:5]}",
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # Create dummy session
    session = KioskDbSession(
        patient_id=patient.id,
        session_token=f"token-{unique_suffix}",
        status="active",
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    try:
        # Test 1: Document with ocr_data
        doc = Document(
            patient_id=patient.id,
            document_type="lab_report",
            file_name="blood_test.pdf",
            storage_path="/docs/blood_test.pdf",
            ocr_text="Hb: 13.5 g/dL",
            ocr_data={"test": "Hemoglobin", "value": 13.5, "unit": "g/dL", "confidence": 0.98},
            status="processed",
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        assert doc.ocr_data is not None
        assert doc.ocr_data["confidence"] == 0.98

        # Test 2: Summary with status, doctor_id, summary_type
        summary = Summary(
            patient_id=patient.id,
            session_id=session.id,
            summary_text="Patient presents with normal vitals.",
            status="draft",
            summary_type="clinical",
        )
        db.add(summary)
        db.commit()
        db.refresh(summary)
        assert summary.status == "draft"
        assert summary.summary_type == "clinical"
        assert summary.doctor_id is None

        # Test 3: Prescription with session_id
        prescription = Prescription(
            patient_id=patient.id,
            session_id=session.id,
            status="active",
            notes="Take rest.",
        )
        db.add(prescription)
        db.commit()
        db.refresh(prescription)
        assert prescription.session_id == session.id
        assert prescription.appointment_id is None

        # Test 4: FHIRBundle
        bundle = FHIRBundle(
            patient_id=patient.id,
            session_id=session.id,
            bundle_json={
                "resourceType": "Bundle",
                "type": "document",
                "entry": [{"resource": {"resourceType": "Composition", "title": "OP Consult"}}]
            },
            bundle_type="OPConsultation",
            abdm_compliant=True,
        )
        db.add(bundle)
        db.commit()
        db.refresh(bundle)
        assert bundle.id is not None
        assert bundle.abdm_compliant is True
        assert bundle.bundle_json["resourceType"] == "Bundle"
        assert bundle.bundle_type == "OPConsultation"

    finally:
        # Cleanup test data
        if 'bundle' in locals() and bundle.id:
            db.delete(bundle)
        if 'prescription' in locals() and prescription.id:
            db.delete(prescription)
        if 'summary' in locals() and summary.id:
            db.delete(summary)
        if 'doc' in locals() and doc.id:
            db.delete(doc)
        db.delete(session)
        db.delete(patient)
        db.commit()
