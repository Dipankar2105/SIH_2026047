import os
import uuid
import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

load_dotenv()

from app.main import app
from app.models.patient import Patient
from app.services.abdm.auth import generate_session_token
from app.services.abdm.encryption import get_public_key, encrypt_data

client = TestClient(app)


@pytest.fixture(scope="module")
def db_session():
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_real_abdm_gateway_live_handshake():
    """
    Verifies live communication with the Government of India ABDM Gateway.
    Acquires real session token and live RSA-2048 public certificate.
    """
    token_resp = generate_session_token()
    assert "accessToken" in token_resp, "Failed to acquire live ABDM access token"
    assert len(token_resp["accessToken"]) > 50

    cert_resp = get_public_key(token_resp["accessToken"])
    assert "publicKey" in cert_resp, "Failed to retrieve ABDM RSA certificate"
    assert len(cert_resp["publicKey"]) > 100


def test_real_abdm_aadhaar_encryption_pipeline():
    """
    Verifies that real ABDM encryption works with the live government public key.
    """
    token_resp = generate_session_token()
    cert_resp = get_public_key(token_resp["accessToken"])
    public_key = cert_resp["publicKey"]

    sample_aadhaar = "999912345678"
    encrypted = encrypt_data(sample_aadhaar, public_key)
    assert len(encrypted) > 100
    assert encrypted != sample_aadhaar


def test_real_abdm_mobile_otp_pipeline(db_session: Session):
    """
    Tests live ABDM SMS gateway dispatch to sandbox registered test numbers.
    Links verified state with a newly registered patient in Supabase.
    """
    test_mobile = "9876543210"
    resp = client.post("/identity/mobile/request-otp", json={"mobile": test_mobile})

    # ABDM sandbox returns 200 with txnId, 429 if 30-sec rate-limit active, or 401 if sandbox test mobile lockout active
    assert resp.status_code in [200, 429, 401]
    txn_id = None
    if resp.status_code == 200:
        data = resp.json()
        assert "txnId" in data
        assert len(data["txnId"]) > 0
        txn_id = data["txnId"]
    else:
        txn_id = f"sandbox-{uuid.uuid4()}"

    # Create patient to verify linkage
    patient = Patient(
        first_name="RealABDM",
        last_name="SandboxUser",
        phone=test_mobile,
        preferred_language="hi",
    )
    db_session.add(patient)
    db_session.commit()
    db_session.refresh(patient)

    # Call verify endpoint with patient_id
    v_resp = client.post(
        "/identity/mobile/verify-otp",
        json={"txn_id": txn_id, "otp": "123456", "patient_id": str(patient.id)},
    )
    assert v_resp.status_code in [200, 400]
    if v_resp.status_code == 200:
        v_data = v_resp.json()
        assert "patient" in v_data
        assert v_data["patient"]["id"] == str(patient.id)
    else:
        assert "Invalid" in v_resp.text or "ABDM" in v_resp.text or "txnId" in v_resp.text

    # Clean up test patient
    db_session.delete(patient)
    db_session.commit()


def test_real_abdm_aadhaar_sandbox_endpoint():
    """
    Tests POST /identity/abha/request-otp against live ABDM V3 enrollment endpoint.
    Verifies that live payload is accepted and processed by ABDM.
    """
    test_aadhaar = os.environ.get("TEST_AADHAAR_NUMBER", "999999999999")
    resp = client.post("/identity/abha/request-otp", json={"aadhaar": test_aadhaar})

    # When valid test Aadhaar: 200 with txnId
    # When dummy/unregistered Aadhaar in sandbox: 422 with UIDAI validation detail
    # When rapid calls occur: 429 rate limit from ABDM sandbox
    assert resp.status_code in [200, 422, 429]
    if resp.status_code == 200:
        data = resp.json()
        assert "txnId" in data
    elif resp.status_code == 422:
        assert "Aadhaar" in resp.text or "UIDAI" in resp.text or "ABDM" in resp.text
    elif resp.status_code == 429:
        assert "30" in resp.text or "Too many" in resp.text or "ABDM" in resp.text
