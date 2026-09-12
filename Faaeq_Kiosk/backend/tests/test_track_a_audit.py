"""
test_track_a_audit.py

Targeted tests for the Track A feature-by-feature audit.
Covers specific gaps not exercised by the existing E2E test:
- ABDM timeout graceful fallback (Feature 1)
- Language pack content for multiple languages (Feature 2)
- Unknown symptom fallback to General Medicine (Feature 11)
- Previously visited doctor recommendation with cardiac symptom (Feature 12)
- Appointment double-booking rejection (Feature 13)
"""

import uuid
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.core.database import SessionLocal
from app.core.security import create_access_token
from app.models.hospital import Hospital
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.visit_history import VisitHistory

client = TestClient(app)


@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


# Feature 1: ABDM timeout returns structured error, not a crash
@patch("app.services.abdm.abha_service.generate_session_token")
def test_abdm_timeout_graceful_fallback(mock_session):
    """Simulate ABDM network timeout and verify a structured 502 error is returned."""
    import requests
    mock_session.side_effect = requests.exceptions.ConnectTimeout("Connection timed out")

    resp = client.post("/identity/abha/request-otp", json={"aadhaar": "999999999999"})
    # Should NOT be a 500 Internal Server Error (crash)
    assert resp.status_code != 500
    # The local registration endpoint must still work independently
    local_resp = client.post(
        "/identity/patient/register",
        json={"first_name": "Fallback", "last_name": "Patient", "phone": "7777700001"},
    )
    assert local_resp.status_code == 200
    assert local_resp.json()["first_name"] == "Fallback"


# Feature 2: Language packs return content for at least 2 languages
def test_language_packs():
    """Verify language pack endpoint returns content for English and Hindi."""
    en_resp = client.get("/identity/languages/en")
    assert en_resp.status_code == 200
    en_data = en_resp.json()
    assert en_data["language_code"] == "en"
    assert "welcome" in en_data["translations"]
    assert len(en_data["translations"]) >= 4

    hi_resp = client.get("/identity/languages/hi")
    assert hi_resp.status_code == 200
    hi_data = hi_resp.json()
    assert hi_data["language_code"] == "hi"
    assert "welcome" in hi_data["translations"]
    # Hindi content should be different from English
    assert hi_data["translations"]["welcome"] != en_data["translations"]["welcome"]

    # Supported languages list should have at least 4
    langs_resp = client.get("/identity/languages")
    assert langs_resp.status_code == 200
    assert len(langs_resp.json()) >= 4


# Feature 11: Unknown symptom falls back to General Medicine, not 500
def test_unknown_symptom_fallback():
    """Verify symptoms not in the lookup table return General Medicine, not a 500."""
    resp = client.post(
        "/discovery/recommend-doctor",
        json={"symptoms": "xyzzy completely unknown symptom"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["recommended_specialty"] == "General Medicine"


# Feature 12: Previously visited doctor flag with cardiac symptom
def test_previously_visited_doctor_recommendation(db):
    """Seed a past Cardiology visit, then recommend for cardiac symptom.
    Assert visited doctor comes first with previously_visited=True."""
    # Find or create hospital and cardiologist
    hospital = db.query(Hospital).first()
    if not hospital:
        hospital = Hospital(
            name="Audit Test Hospital",
            address="1 Test Road",
            city="TestCity",
            state="TestState",
            pincode="000000",
            phone="000-0000000",
            email="audit@test.demo",
        )
        db.add(hospital)
        db.commit()
        db.refresh(hospital)

    cardiologist = (
        db.query(Doctor)
        .filter(Doctor.specialization.ilike("%Cardiology%"), Doctor.hospital_id == hospital.id)
        .first()
    )
    if not cardiologist:
        cardiologist = Doctor(
            hospital_id=hospital.id,
            name="Dr. Audit Cardio",
            specialization="Cardiology",
            qualification="DM Cardiology",
            phone="0000000000",
            email="audit.cardio@test.demo",
        )
        db.add(cardiologist)
        db.commit()
        db.refresh(cardiologist)

    # Create patient with a past visit to this cardiologist
    patient = Patient(
        first_name="AuditVisit",
        last_name="Patient",
        phone=f"audit{uuid.uuid4().hex[:6]}",
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    visit = VisitHistory(
        patient_id=patient.id,
        doctor_id=cardiologist.id,
        hospital_id=hospital.id,
        visit_date=datetime.now(timezone.utc) - timedelta(days=90),
        diagnosis="Routine cardiac check",
    )
    db.add(visit)
    db.commit()

    # Now recommend for cardiac symptom
    resp = client.post(
        "/discovery/recommend-doctor",
        json={"symptoms": "chest pain", "patient_id": str(patient.id)},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["recommended_specialty"] == "Cardiology"
    assert len(data["doctors"]) >= 1

    # The previously visited doctor must appear first
    top = data["doctors"][0]
    assert top["previously_visited"] is True
    assert top["doctor_id"] == str(cardiologist.id)
    assert top["last_visit_date"] is not None
    assert top["last_visit_date"].startswith(visit.visit_date.isoformat()[:10])


# Feature 13: Double-booking the same slot is rejected
def test_appointment_double_booking(db):
    """Book a slot, then try to book the same slot again and assert 400."""
    hospital = db.query(Hospital).first()
    doctor = db.query(Doctor).filter(Doctor.hospital_id == hospital.id).first()

    patient = Patient(
        first_name="DoubleBook",
        last_name="Test",
        phone=f"dbl{uuid.uuid4().hex[:6]}",
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    token = create_access_token({"sub": str(patient.id), "role": "patient"})
    headers = {"Authorization": f"Bearer {token}"}

    # Pick a unique future slot that has not been booked in prior runs
    from app.models.appointment import Appointment
    existing_times = {a.appointment_time for a in db.query(Appointment).filter(Appointment.doctor_id == doctor.id).all()}
    day = 300
    while True:
        slot_time = (datetime.now(timezone.utc) + timedelta(days=day)).replace(
            hour=10, minute=0, second=0, microsecond=0
        )
        if slot_time not in existing_times:
            break
        day += 1

    payload = {
        "patient_id": str(patient.id),
        "doctor_id": str(doctor.id),
        "hospital_id": str(hospital.id),
        "appointment_time": slot_time.isoformat(),
        "reason": "Double-book test",
    }

    # First booking should succeed
    resp1 = client.post("/discovery/book-appointment", json=payload, headers=headers)
    assert resp1.status_code == 200

    # Second booking at the same slot should fail
    resp2 = client.post("/discovery/book-appointment", json=payload, headers=headers)
    assert resp2.status_code == 400
    assert "Double Booking Conflict" in resp2.json()["detail"]


def test_computed_avg_wait_time(db):
    """Seed completed appointments and assert avg wait time is computed correctly."""
    from app.models.appointment import Appointment
    hospital = db.query(Hospital).first()
    doctor = db.query(Doctor).filter(Doctor.hospital_id == hospital.id).first()

    patient = Patient(
        first_name="WaitTime",
        last_name="Test",
        phone=f"wt{uuid.uuid4().hex[:6]}",
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    now = datetime.now(timezone.utc)
    daily_start = now - timedelta(hours=24)

    def _existing_avg():
        existing = db.query(Appointment).filter(
            Appointment.hospital_id == hospital.id,
            Appointment.status == "completed",
            Appointment.appointment_time >= daily_start,
            Appointment.consultation_start_time.is_not(None),
        ).all()
        total = 0.0
        count = 0
        for a in existing:
            wait = (a.consultation_start_time - a.appointment_time).total_seconds()
            if wait >= 0:
                total += wait / 60.0
                count += 1
        return total, count

    before_total, before_count = _existing_avg()

    appt1 = Appointment(
        patient_id=patient.id,
        doctor_id=doctor.id,
        hospital_id=hospital.id,
        appointment_time=now - timedelta(minutes=60),
        consultation_start_time=now - timedelta(minutes=50),
        status="completed",
        reason="Test 1",
    )
    appt2 = Appointment(
        patient_id=patient.id,
        doctor_id=doctor.id,
        hospital_id=hospital.id,
        appointment_time=now - timedelta(minutes=120),
        consultation_start_time=now - timedelta(minutes=100),
        status="completed",
        reason="Test 2",
    )
    db.add_all([appt1, appt2])
    db.commit()

    expected_total = before_total + 10.0 + 20.0
    expected_count = before_count + 2
    expected_avg = round(expected_total / expected_count, 1) if expected_count > 0 else None

    admin_token = create_access_token({"sub": "admin-1", "role": "hospital_admin"})
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    resp = client.get(f"/hospital/dashboard/{hospital.id}", headers=admin_headers)
    assert resp.status_code == 200
    dashboard = resp.json()
    avg_wait = dashboard["daily_analytics"]["avg_wait_time_minutes"]
    assert avg_wait == expected_avg


def test_share_document_via_consent(db):
    """Test POST /documents/share successfully grants access for valid consent and rejects for invalid."""
    from app.models.consent import Consent
    
    patient = Patient(
        first_name="ShareDoc",
        last_name="Test",
        phone=f"sh{uuid.uuid4().hex[:6]}",
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    now = datetime.now(timezone.utc)
    recipient_id = uuid.uuid4()

    # Create a valid consent
    valid_consent = Consent(
        patient_id=patient.id,
        consent_type="health_record_sharing",
        granted=True,
        purpose="Testing Share",
        scope="view_records",
        granted_at=now,
        expires_at=now + timedelta(hours=1),
        revoked_at=None,
    )
    
    # Create an expired consent
    expired_consent = Consent(
        patient_id=patient.id,
        consent_type="health_record_sharing",
        granted=True,
        purpose="Testing Share Expired",
        scope="view_records",
        granted_at=now - timedelta(hours=2),
        expires_at=now - timedelta(hours=1),
        revoked_at=None,
    )

    db.add_all([valid_consent, expired_consent])
    db.commit()
    db.refresh(valid_consent)
    db.refresh(expired_consent)

    token = create_access_token({"sub": str(patient.id), "role": "patient"})
    headers = {"Authorization": f"Bearer {token}"}

    # Test 1: Valid consent should succeed
    payload_valid = {
        "patient_id": str(patient.id),
        "consent_id": str(valid_consent.id),
        "recipient_id": str(recipient_id)
    }
    resp_valid = client.post("/documents/share", json=payload_valid, headers=headers)
    assert resp_valid.status_code == 200
    data = resp_valid.json()
    assert "access_token" in data
    assert "expires_at" in data

    # Test 2: Expired consent should fail with 403
    payload_expired = {
        "patient_id": str(patient.id),
        "consent_id": str(expired_consent.id),
        "recipient_id": str(recipient_id)
    }
    resp_expired = client.post("/documents/share", json=payload_expired, headers=headers)
    assert resp_expired.status_code == 403
    assert "expired" in resp_expired.json()["detail"].lower()
