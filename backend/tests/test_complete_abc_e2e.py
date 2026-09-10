import uuid
import io
from datetime import datetime, timezone, timedelta
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.core.database import SessionLocal
from app.core.security import create_access_token
from app.models.hospital import Hospital
from app.models.doctor import Doctor
from app.models.session import Session as KioskDbSession
from app.models.prescription import Prescription

client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_complete_track_a_b_c_end_to_end_pipeline(db: Session):
    """
    Complete end-to-end integration test of Track A + Track B + Track C:
    1.  [Track A] Patient Registration with ABHA ID and preferences
    2.  [Track A] JWT Bearer Token generation & RBAC verification
    3.  [Track A] Patient Consent Granting for treatment & record sharing
    4.  [Track A] Doctor Discovery & Appointment Booking
    5.  [Track B] Kiosk Session Initialization
    6.  [Track B] Multilingual AI Clinical Intake (Hindi/English)
    7.  [Track B] Safety Red Flag Triage
    8.  [Track C] Document Multipart Upload & OCR Processing
    9.  [Track C] OCR Source Verification & Verification Workflow
    10. [Track C] 222,855 Indian Drug Database Autocomplete Search
    11. [Track C] Doctor Prescription Creation
    12. [Track C] Digital Signing of Prescription
    13. [Track C] Medication Reminder Schedule Computation (Breakfast/Lunch/Dinner)
    14. [Track C] Clinical AI SOAP Summary Generation
    15. [Track C] Doctor Summary Review & Approval Workflow
    16. [Track C] Patient Plain-Language Summary Retrieval
    17. [Track C] FHIR R4 NDHM Bundle Generation & Validation
    18. [Track A] Longitudinal Health Locker Timeline & Unified Patient Record
    """
    unique_suffix = uuid.uuid4().hex[:8]

    # Pre-requisite: Fetch or create hospital & doctor
    hospital = db.query(Hospital).first()
    if not hospital:
        hospital = Hospital(
            name=f"Apex Healthcare {unique_suffix}",
            code=f"APEX_{unique_suffix}",
            city="New Delhi",
            state="Delhi",
        )
        db.add(hospital)
        db.commit()
        db.refresh(hospital)

    doctor = db.query(Doctor).filter(Doctor.hospital_id == hospital.id).first()
    if not doctor:
        doctor = Doctor(
            hospital_id=hospital.id,
            name=f"Dr. Rajesh Sharma {unique_suffix}",
            specialization="General Medicine",
            qualification="MBBS, MD",
            phone=f"91{unique_suffix}",
            email=f"dr.rajesh.{unique_suffix}@example.com",
        )
        db.add(doctor)
        db.commit()
        db.refresh(doctor)

    # -------------------------------------------------------------
    # 1. Track A: Patient Registration
    # -------------------------------------------------------------
    reg_payload = {
        "first_name": "Aarav",
        "last_name": f"Patel_{unique_suffix}",
        "date_of_birth": "1992-06-12",
        "gender": "male",
        "phone": f"97{unique_suffix}",
        "preferred_language": "hi",
        "abha_id": f"{unique_suffix[:4]}-{unique_suffix[4:]}-1111",
        "abha_address": f"aarav_{unique_suffix}@sbx",
    }
    reg_res = client.post("/identity/patient/register", json=reg_payload)
    assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"
    patient_data = reg_res.json()
    patient_id = patient_data["id"]
    assert patient_data["first_name"] == "Aarav"

    # -------------------------------------------------------------
    # 2. Track A: Authentication (JWT & RBAC tokens)
    # -------------------------------------------------------------
    patient_token_res = client.post("/identity/auth/token", json={"user_id": patient_id, "role": "patient"})
    assert patient_token_res.status_code == 200
    patient_token = patient_token_res.json()["access_token"]
    patient_headers = {"Authorization": f"Bearer {patient_token}"}

    doctor_token_res = client.post("/identity/auth/token", json={"user_id": str(doctor.id), "role": "doctor"})
    assert doctor_token_res.status_code == 200
    doctor_token = doctor_token_res.json()["access_token"]
    doctor_headers = {"Authorization": f"Bearer {doctor_token}"}

    # -------------------------------------------------------------
    # 3. Track A: Consent Grant
    # -------------------------------------------------------------
    consent_res = client.post(
        "/identity/consent/grant",
        json={"patient_id": patient_id, "purpose": "treatment", "granted": True},
        headers=patient_headers,
    )
    assert consent_res.status_code == 200

    # -------------------------------------------------------------
    # 4. Track A: Doctor Discovery & Appointment Booking
    # -------------------------------------------------------------
    doctors_list = client.get("/discovery/doctors", params={"specialty": "General Medicine"})
    assert doctors_list.status_code == 200
    assert len(doctors_list.json()) >= 1

    appt_time = (datetime.now(timezone.utc) + timedelta(days=14)).isoformat()
    book_res = client.post(
        "/discovery/book-appointment",
        json={
            "patient_id": patient_id,
            "doctor_id": str(doctor.id),
            "hospital_id": str(hospital.id),
            "appointment_time": appt_time,
            "reason": "Persistent seasonal cough & fever",
        },
        headers=patient_headers,
    )
    assert book_res.status_code == 200, f"Booking failed: {book_res.text}"
    appointment_id = book_res.json()["id"]

    # -------------------------------------------------------------
    # 5. Track B: Kiosk Session Initialization
    # -------------------------------------------------------------
    session_res = client.post("/identity/kiosk/session/start", json={"kiosk_id": "KIOSK-EAST-04"})
    assert session_res.status_code == 200
    session_id = session_res.json()["session_id"]

    # Associate session with patient in DB
    kiosk_db = db.query(KioskDbSession).filter(KioskDbSession.id == session_id).first()
    kiosk_db.patient_id = uuid.UUID(patient_id)
    db.commit()

    # -------------------------------------------------------------
    # 6. Track B: Multilingual AI Clinical Intake
    # -------------------------------------------------------------
    intake_msg = client.post(
        "/intake/message",
        json={
            "message": "मुझे तीन दिन से तेज बुखार और खांसी है",
            "language": "hi",
            "step": 0,
            "session_id": session_id,
        },
    )
    assert intake_msg.status_code == 200
    assert intake_msg.json()["next_step"] >= 1

    # -------------------------------------------------------------
    # 7. Track B: Safety Triage Check
    # -------------------------------------------------------------
    safety_res = client.post(
        "/safety/check",
        json={
            "message": "I have severe crushing chest pain radiating to my left arm",
            "language": "en",
        },
    )
    assert safety_res.status_code == 200
    safety_data = safety_res.json()
    assert safety_data["is_emergency"] is True
    assert safety_data["severity"] == "emergency"

    # -------------------------------------------------------------
    # 8. Track C: Multipart Document Upload & OCR
    # -------------------------------------------------------------
    fake_file = io.BytesIO(b"Medical Lab Report: Blood Glucose Fasting 110 mg/dL Normal")
    upload_res = client.post(
        "/api/documents/upload",
        files={"file": ("report.pdf", fake_file, "application/pdf")},
        data={"patient_id": patient_id, "document_type": "lab_report"},
        headers=patient_headers,
    )
    assert upload_res.status_code == 201, f"Doc upload failed: {upload_res.text}"
    doc_data = upload_res.json()
    doc_id = doc_data["id"]
    assert doc_data["file_name"] == "report.pdf"

    # -------------------------------------------------------------
    # 9. Track C: Document Verification & Source Extraction
    # -------------------------------------------------------------
    verify_res = client.post(
        f"/api/documents/{doc_id}/verify",
        json={"corrections": [{"field": "test_name", "value": "Fasting Blood Sugar"}]},
        headers=doctor_headers,
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "verified"

    sources_res = client.get(f"/api/documents/{doc_id}/sources", headers=doctor_headers)
    assert sources_res.status_code == 200
    assert sources_res.json()["document_id"] == doc_id

    # -------------------------------------------------------------
    # 10. Track C: Drug Autocomplete Search (222,855 rows)
    # -------------------------------------------------------------
    drug_search = client.get("/api/prescriptions/drugs/search", params={"q": "azithromycin"})
    assert drug_search.status_code == 200
    drugs = drug_search.json()
    assert isinstance(drugs, list)
    assert len(drugs) > 0
    selected_drug = drugs[0]["name"]

    # -------------------------------------------------------------
    # 11. Track C: Prescription Creation
    # -------------------------------------------------------------
    presc_payload = {
        "patient_id": patient_id,
        "doctor_id": str(doctor.id),
        "session_id": session_id,
        "appointment_id": appointment_id,
        "diagnosis": "Upper Respiratory Tract Infection (URTI)",
        "notes": "Drink warm fluids, complete full 5-day antibiotic course.",
        "items": [
            {
                "drug_name": selected_drug,
                "dosage": "500mg",
                "frequency": "1-0-0",
                "duration": "5 days",
                "instructions": "After breakfast",
            },
            {
                "drug_name": "Paracetamol",
                "dosage": "650mg",
                "frequency": "1-0-1",
                "duration": "3 days",
                "instructions": "After lunch and dinner if temperature > 100 F",
            },
        ],
    }
    presc_res = client.post("/api/prescriptions", json=presc_payload, headers=doctor_headers)
    assert presc_res.status_code == 201, f"Prescription creation failed: {presc_res.text}"
    presc_data = presc_res.json()
    presc_id = presc_data["id"]
    assert len(presc_data["items"]) == 2

    # -------------------------------------------------------------
    # 12. Track C: Digital Prescription Signing
    # -------------------------------------------------------------
    sign_res = client.post(f"/api/prescriptions/{presc_id}/sign", headers=doctor_headers)
    assert sign_res.status_code == 200
    signed_presc = sign_res.json()
    assert signed_presc["status"] == "signed"

    # Pharmacist view check
    pharm_token_res = client.post("/identity/auth/token", json={"user_id": str(uuid.uuid4()), "role": "pharmacist"})
    assert pharm_token_res.status_code == 200
    pharm_token = pharm_token_res.json()["access_token"]
    pharm_res = client.get(
        f"/api/prescriptions/{presc_id}/pharmacist-view",
        headers={"Authorization": f"Bearer {pharm_token}"},
    )
    assert pharm_res.status_code == 200
    assert pharm_res.json()["prescription_id"] == presc_id

    # -------------------------------------------------------------
    # 13. Track C: Medication Reminders Generation
    # -------------------------------------------------------------
    reminder_res = client.post(
        f"/api/prescriptions/{presc_id}/reminders",
        json={"meal_times": {"breakfast": "08:30", "lunch": "13:30", "dinner": "20:30"}},
        headers=patient_headers,
    )
    assert reminder_res.status_code in [200, 201]
    reminder_data = reminder_res.json()
    assert "reminders" in reminder_data
    assert len(reminder_data["reminders"]) >= 2

    # -------------------------------------------------------------
    # 14. Track C: Clinical AI SOAP Summary Generation
    # -------------------------------------------------------------
    summary_gen_res = client.post(
        "/api/summary/generate",
        json={
            "patient_id": patient_id,
            "session_id": session_id,
            "doctor_id": str(doctor.id),
        },
        headers=doctor_headers,
    )
    assert summary_gen_res.status_code == 201, f"Summary generation failed: {summary_gen_res.text}"
    summary_data = summary_gen_res.json()
    summary_id = summary_data["id"]
    assert "SOAP" in summary_data["summary_text"] or "Clinical" in summary_data["summary_text"]

    # -------------------------------------------------------------
    # 15. Track C: Doctor Summary Review
    # -------------------------------------------------------------
    review_res = client.post(
        f"/api/summary/{summary_id}/review",
        json={"status": "approved", "doctor_notes": "Reviewed and agreed with clinical diagnosis."},
        headers=doctor_headers,
    )
    assert review_res.status_code == 200
    assert review_res.json()["status"] in ["completed", "approved"]

    # -------------------------------------------------------------
    # 16. Track C: Plain-Language Patient Summary
    # -------------------------------------------------------------
    pt_summary_res = client.get(f"/api/summary/patient-summary/{summary_id}", headers=patient_headers)
    assert pt_summary_res.status_code == 200
    pt_summary = pt_summary_res.json()
    assert "plain_text" in pt_summary
    assert pt_summary["plain_text"] is not None

    # -------------------------------------------------------------
    # 17. Track C: FHIR R4 Bundle Export & ABDM Validation
    # -------------------------------------------------------------
    fhir_bundle_res = client.post(
        "/api/fhir/bundle/generate",
        json={"patient_id": patient_id, "session_id": session_id},
        headers=doctor_headers,
    )
    assert fhir_bundle_res.status_code == 200
    bundle_data = fhir_bundle_res.json()
    assert bundle_data["bundle"]["resourceType"] == "Bundle"

    # Validate bundle
    val_res = client.post("/api/fhir/bundle/validate", json={"bundle": bundle_data["bundle"]}, headers=doctor_headers)
    assert val_res.status_code == 200
    assert val_res.json()["is_valid"] is True

    # -------------------------------------------------------------
    # 18. Track A: Longitudinal Timeline & Unified Record
    # -------------------------------------------------------------
    timeline_res = client.get(f"/documents/timeline/{patient_id}", headers=patient_headers)
    assert timeline_res.status_code == 200
    timeline = timeline_res.json()
    assert timeline["total_events"] >= 1

    unified_res = client.get(f"/documents/unified/{patient_id}", headers=patient_headers)
    assert unified_res.status_code == 200
    unified = unified_res.json()
    assert unified["patient_id"] == patient_id
    assert len(unified["prescriptions"]) >= 1
    assert len(unified["documents"]) >= 1
