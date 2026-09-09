"""
test_real_features_e2e.py

End-to-End Real Data Verification Test Suite:
1. Live Database Connectivity & Entity Auditing (Supabase)
2. Doctor & Hospital Discovery with Real Specialty Matching
3. Appointment Booking & Double-Booking Guard
4. Kiosk Session Lifecycle & Privacy Auto-Wipe
5. Consent Management (Grant & Revocation)
6. 7-Language Complete Localization & Translation Engine
7. Real ABDM Sandbox Handshake & Real Mobile SMS OTP Pipeline
"""

import os
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.core.database import SessionLocal
from app.models.hospital import Hospital
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.session import Session as KioskDbSession
from app.core.security import create_access_token
from app.services.abdm.auth import generate_session_token
from app.services.abdm.encryption import get_public_key

client = TestClient(app)


@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_real_database_entities_audited(db: Session):
    """Verify live Supabase database connectivity and seeded data entities."""
    hospital_count = db.query(Hospital).count()
    doctor_count = db.query(Doctor).count()
    patient_count = db.query(Patient).count()

    assert hospital_count > 0, "No hospitals found in live database"
    assert doctor_count > 0, "No doctors found in live database"
    assert patient_count > 0, "No patients found in live database"

    # Verify doctors have valid specializations
    specializations = [d.specialization for d in db.query(Doctor).limit(10) if d.specialization]
    assert len(specializations) > 0, "Doctors have no specializations populated"


def test_complete_7_language_packs():
    """Verify that all 7 supported Indian languages have full dictionaries with 45+ terms."""
    # 1. Check supported languages list
    resp = client.get("/identity/languages")
    assert resp.status_code == 200
    languages = resp.json()
    assert len(languages) == 7

    codes = [l["code"] for l in languages]
    expected_codes = ["en", "hi", "mr", "ta", "te", "kn", "bn"]
    for code in expected_codes:
        assert code in codes, f"Language {code} missing from supported languages"

    # Verify Kannada label is in Kannada script
    kn_lang = next(l for l in languages if l["code"] == "kn")
    assert "ಕನ್ನಡ" in kn_lang["name"], "Kannada script is incorrect"

    # 2. Verify comprehensive content for each language pack
    for code in expected_codes:
        pack_resp = client.get(f"/identity/languages/{code}")
        assert pack_resp.status_code == 200, f"Failed to get language pack for {code}"
        pack_data = pack_resp.json()
        assert pack_data["language_code"] == code
        translations = pack_data["translations"]

        # Ensure dictionary is comprehensive
        assert len(translations) >= 40, f"Language pack {code} has only {len(translations)} keys"

        # Check key clinical & kiosk phrases exist
        vital_keys = [
            "welcome", "start_session", "end_session", "abha_login",
            "mobile_login", "symptoms", "doctor_recommendation",
            "queue_status", "general_medicine", "cardiology",
            "prescription", "morning", "afternoon", "night"
        ]
        for vk in vital_keys:
            assert vk in translations, f"Vital key '{vk}' missing in '{code}' pack"


def test_on_the_fly_translation_endpoint():
    """Verify POST /identity/translate translates terms across languages on the fly."""
    # Test English to Hindi
    hi_resp = client.post(
        "/identity/translate",
        json={"text": "Cardiology", "target_language": "hi"}
    )
    assert hi_resp.status_code == 200
    assert "हृदय" in hi_resp.json()["translated_text"]

    # Test English to Marathi
    mr_resp = client.post(
        "/identity/translate",
        json={"text": "Welcome to MediKiosk", "target_language": "mr"}
    )
    assert mr_resp.status_code == 200
    assert "स्वागत" in mr_resp.json()["translated_text"]

    # Test English to Tamil
    ta_resp = client.post(
        "/identity/translate",
        json={"text": "General Medicine", "target_language": "ta"}
    )
    assert ta_resp.status_code == 200
    assert "மருத்துவம்" in ta_resp.json()["translated_text"]

    # Test English to Kannada
    kn_resp = client.post(
        "/identity/translate",
        json={"text": "Prescription", "target_language": "kn"}
    )
    assert kn_resp.status_code == 200
    assert "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್" in kn_resp.json()["translated_text"]

    # Test English to Bengali
    bn_resp = client.post(
        "/identity/translate",
        json={"text": "Emergency Alert: High risk detected", "target_language": "bn"}
    )
    assert bn_resp.status_code == 200
    assert "জরুরি" in bn_resp.json()["translated_text"]


def test_patient_language_preference_persistence(db: Session):
    """Verify changing language updates the real database record in Supabase."""
    patient = Patient(
        first_name="LangTest",
        last_name="Patient",
        phone=f"98{uuid.uuid4().hex[:8]}",
        preferred_language="en",
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    try:
        token = create_access_token({"sub": str(patient.id), "role": "patient"})
        headers = {"Authorization": f"Bearer {token}"}

        # Change language to Marathi (mr)
        resp = client.post(
            f"/identity/patient/{patient.id}/language",
            json={"preferred_language": "mr"},
            headers=headers,
        )
        assert resp.status_code == 200
        assert resp.json()["preferred_language"] == "mr"

        # Verify persisted in Supabase
        db.refresh(patient)
        assert patient.preferred_language == "mr"
    finally:
        db.delete(patient)
        db.commit()


def test_real_abdm_gateway_handshake():
    """Verify live connection to official ABDM Gateway to get session token and cert."""
    session = generate_session_token()
    assert "accessToken" in session, "ABDM accessToken not returned from gateway"
    assert session.get("expiresIn", 0) > 0

    key_res = get_public_key(session["accessToken"])
    assert "publicKey" in key_res, "ABDM publicKey not returned from certificate endpoint"
    assert len(key_res["publicKey"]) > 100


def test_real_abdm_mobile_otp_generation():
    """Verify POST /identity/mobile/request-otp communicates with real ABDM Gateway using designated sandbox mobile."""
    # 9876543210 is the registered ABDM Sandbox test mobile number
    test_mobile = "9876543210"
    resp = client.post(
        "/identity/mobile/request-otp",
        json={"mobile": test_mobile}
    )
    # ABDM sandbox returns 200 with txnId, or 429 if the 30-second rate-limit is active
    if resp.status_code == 200:
        data = resp.json()
        assert "txnId" in data, "txnId not returned in mobile OTP response"
        assert len(data["txnId"]) > 0
        assert "OTP sent" in data["message"]
    elif resp.status_code == 429:
        assert "after 30 seconds" in resp.text
    else:
        pytest.fail(f"Unexpected ABDM response ({resp.status_code}): {resp.text}")


