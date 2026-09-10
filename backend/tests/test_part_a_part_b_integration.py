import uuid
from datetime import datetime, timedelta
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.core.database import SessionLocal
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.hospital import Hospital
from app.models.appointment import Appointment
from app.models.session import Session as KioskDbSession
from app.models.document import Document
from app.models.prescription import Prescription
from app.models.summary import Summary
from app.models.fhir_bundle import FHIRBundle
from app.models.consent import Consent
from app.core.security import create_access_token

client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_complete_part_a_part_b_data_flow(db: Session):
    """
    Validates complete functional integration between Part A and Part B:
    1. Patient creation (Part A)
    2. Authentication / JWT token generation (Part A)
    3. Hospital / Doctor discovery & Appointment booking (Part A)
    4. Part B Processing:
       - Session start & clinical AI intake chat (Part B Intake)
       - Document upload with OCR data (Part B Locker)
       - Drug autocomplete search (Part B Drugs)
       - Prescription issuance (Part B Prescriptions)
       - Clinical summary generation (Part B Summarizer)
       - FHIR R4 Bundle export (Part B Interoperability)
    5. Unified Patient View validation:
       - Single aggregated endpoint returns profile, appointments, documents,
         prescriptions, and clinical summaries.
    """
    unique = uuid.uuid4().hex[:8]

    # --- Setup Reference Hospital and Doctor (Part A) ---
    hospital = Hospital(
        name=f"City General Hospital {unique}",
        address="123 Health St, Sector 4",
        city="Mumbai",
        state="Maharashtra",
        pincode="400001",
        phone="02212345678",
    )
    db.add(hospital)
    db.flush()

    doctor = Doctor(
        hospital_id=hospital.id,
        name=f"Dr. Rajesh Sharma {unique}",
        specialization="General Medicine",
        qualification="MBBS, MD",
        phone="9876543210",
    )
    db.add(doctor)
    db.commit()

    created_patient_id = None
    created_session_id = None

    try:
        # 1. Patient Creation (Part A)
        reg_payload = {
            "first_name": "Suresh",
            "last_name": f"Kumar_{unique}",
            "date_of_birth": "1988-04-15",
            "gender": "male",
            "phone": f"98{unique[:8]}",
            "preferred_language": "hi",
            "abha_id": f"{unique[:4]}-{unique[4:]}-9999",
            "abha_address": f"suresh_{unique}@sbx",
        }
        reg_res = client.post("/identity/patient/register", json=reg_payload)
        assert reg_res.status_code == 200, f"Register failed: {reg_res.text}"
        patient_data = reg_res.json()
        created_patient_id = patient_data["id"]
        assert patient_data["first_name"] == "Suresh"

        # 2. Authentication (Part A JWT/RBAC)
        # Create valid patient bearer token
        token = create_access_token(
            data={"sub": created_patient_id, "role": "patient", "patient_id": created_patient_id},
            expires_in_seconds=3600,
        )
        auth_headers = {"Authorization": f"Bearer {token}"}

        # Verify authenticated access to patient profile
        profile_res = client.get(f"/identity/patient/{created_patient_id}", headers=auth_headers)
        assert profile_res.status_code == 200
        assert profile_res.json()["phone"] == reg_payload["phone"]

        # Grant consent (Part A requirement for record sharing/viewing)
        consent_payload = {
            "patient_id": created_patient_id,
            "purpose": "treatment",
            "granted": True,
        }
        consent_res = client.post("/identity/consent/grant", json=consent_payload, headers=auth_headers)
        assert consent_res.status_code == 200

        # 3. Hospital/Doctor Selection & Appointment Booking (Part A)
        doctors_res = client.get("/discovery/doctors", params={"specialization": "General Medicine"})
        assert doctors_res.status_code == 200
        assert len(doctors_res.json()) >= 1

        appt_time = (datetime.now() + timedelta(days=1)).isoformat()
        book_payload = {
            "patient_id": created_patient_id,
            "doctor_id": str(doctor.id),
            "hospital_id": str(hospital.id),
            "appointment_time": appt_time,
            "reason": "Persistent fever and headache",
        }
        book_res = client.post("/discovery/book-appointment", json=book_payload, headers=auth_headers)
        assert book_res.status_code == 200, f"Booking failed: {book_res.text}"
        appt_data = book_res.json()
        assert appt_data["doctor_id"] == str(doctor.id)

        # 4. Part B Processing:

        # 4a. Kiosk Session & Clinical AI Intake (Part B Intake)
        session_res = client.post("/identity/kiosk/session/start", json={"kiosk_id": "KIOSK-NORTH-01"})
        assert session_res.status_code == 200
        created_session_id = session_res.json()["session_id"]

        # Link session to patient in database
        db_session = db.query(KioskDbSession).filter(KioskDbSession.id == created_session_id).first()
        db_session.patient_id = uuid.UUID(created_patient_id)
        db.commit()

        # Step 0: Patient responds in Hindi
        intake_res1 = client.post(
            "/intake/message",
            json={
                "message": "मुझे 3 दिन से तेज़ बुखार और सिरदर्द है",
                "language": "hi",
                "step": 0,
                "session_id": created_session_id,
            },
        )
        assert intake_res1.status_code == 200
        assert intake_res1.json()["next_step"] == 1

        # 4b. Document Upload with OCR Data (Part B Locker)
        doc_payload = {
            "patient_id": created_patient_id,
            "document_type": "prescription",
            "file_name": "past_prescription.jpg",
            "storage_path": "uploads/prescriptions/past_prescription.jpg",
            "mime_type": "image/jpeg",
            "ocr_text": "Tab Paracetamol 650mg TDS x 3 days",
            "ocr_data": {"medications": [{"name": "Paracetamol", "dosage": "650mg"}]},
        }
        doc_res = client.post("/documents/upload", json=doc_payload, headers=auth_headers)
        assert doc_res.status_code == 200
        assert doc_res.json()["ocr_data"] is not None

        # 4c. Drug Autocomplete Search (Part B Drugs)
        drug_search_res = client.get("/prescriptions/drugs/search", params={"q": "paracetamol"})
        assert drug_search_res.status_code == 200
        assert drug_search_res.json()["count"] > 0
        first_drug = drug_search_res.json()["data"][0]

        # 4d. Prescription Creation (Part B Prescriptions)
        doctor_token = create_access_token(
            data={"sub": str(doctor.id), "role": "doctor", "doctor_id": str(doctor.id)},
            expires_in_seconds=3600,
        )
        doc_headers = {"Authorization": f"Bearer {doctor_token}"}

        presc_payload = {
            "patient_id": created_patient_id,
            "doctor_id": str(doctor.id),
            "session_id": created_session_id,
            "diagnosis": "Viral Pyrexia",
            "notes": "Hydrate well and rest.",
            "items": [
                {
                    "drug_name": first_drug["name"],
                    "dosage": first_drug["strength"] or "650mg",
                    "frequency": "1-0-1",
                    "duration": "3 days",
                    "instructions": "After meals",
                }
            ],
        }
        presc_res = client.post("/prescriptions", json=presc_payload, headers=doc_headers)
        assert presc_res.status_code == 200, f"Prescription failed: {presc_res.text}"
        presc_data = presc_res.json()
        assert len(presc_data["items"]) == 1

        # 4e. Clinical Summary Generation (Part B Summarizer)
        summary_payload = {
            "patient_id": created_patient_id,
            "session_id": created_session_id,
            "doctor_id": str(doctor.id),
            "recommended_specialty": "General Medicine",
        }
        summary_res = client.post("/summary/generate", json=summary_payload, headers=doc_headers)
        assert summary_res.status_code == 200
        assert "Clinical" in summary_res.json()["summary_text"]

        # 4f. FHIR R4 Bundle Export (Part B Interoperability)
        fhir_res = client.get(f"/fhir/Patient/{created_patient_id}/$export", headers=doc_headers)
        assert fhir_res.status_code == 200
        bundle = fhir_res.json()
        assert bundle["resourceType"] == "Bundle"
        resource_types = [e["resource"]["resourceType"] for e in bundle["entry"]]
        assert "Patient" in resource_types
        assert "MedicationRequest" in resource_types

        # 5. Unified Patient View (Integrated Data Flow)
        unified_res = client.get(f"/documents/unified/{created_patient_id}", headers=auth_headers)
        assert unified_res.status_code == 200, f"Unified view failed: {unified_res.text}"
        unified_data = unified_res.json()

        # Assert all elements of Part A & Part B flow are present in the unified record
        assert unified_data["patient_id"] == created_patient_id
        assert unified_data["profile"]["first_name"] == "Suresh"
        assert len(unified_data["appointments"]) >= 1
        assert len(unified_data["documents"]) >= 1
        assert len(unified_data["prescriptions"]) >= 1
        assert len(unified_data["summaries"]) >= 1

    finally:
        # Cleanup
        if created_patient_id:
            pid = uuid.UUID(created_patient_id)
            db.query(FHIRBundle).filter(FHIRBundle.patient_id == pid).delete()
            db.query(Summary).filter(Summary.patient_id == pid).delete()
            db.query(Prescription).filter(Prescription.patient_id == pid).delete()
            db.query(Document).filter(Document.patient_id == pid).delete()
            db.query(Appointment).filter(Appointment.patient_id == pid).delete()
            db.query(Consent).filter(Consent.patient_id == pid).delete()
            if created_session_id:
                sid = uuid.UUID(created_session_id)
                db.query(KioskDbSession).filter(KioskDbSession.id == sid).delete()
            db.query(Patient).filter(Patient.id == pid).delete()
        db.delete(doctor)
        db.delete(hospital)
        db.commit()
