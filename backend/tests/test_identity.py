import pytest
import uuid
from unittest.mock import patch, MagicMock
from fastapi import HTTPException

from app.services.abdm.auth import generate_session_token
from app.services.abdm.encryption import get_public_key, encrypt_data
from app.services.abdm.abha_service import request_aadhaar_otp, enroll_abha


def test_abdm_encryption_and_key_handling():
    # Test RSA OAEP encryption with dummy RSA public key (PEM format)
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.primitives import serialization

    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    public_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode("utf-8")

    dummy_aadhaar = "999988887777"
    encrypted = encrypt_data(dummy_aadhaar, public_pem)
    assert len(encrypted) > 0
    assert encrypted != dummy_aadhaar


@patch("requests.post")
def test_abdm_session_token_mock(mock_post):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "accessToken": "mock_access_token",
        "expiresIn": 86400,
        "tokenType": "Bearer",
    }
    mock_post.return_value = mock_resp

    res = generate_session_token()
    assert res["accessToken"] == "mock_access_token"
    assert mock_post.called
    headers = mock_post.call_args[1]["headers"]
    assert "REQUEST-ID" in headers
    assert "TIMESTAMP" in headers
    assert headers["TIMESTAMP"].endswith("Z")


@patch("app.services.abdm.abha_service.settings.ABDM_MOCK_MODE", False)
@patch("app.services.abdm.abha_service.generate_session_token")
@patch("app.services.abdm.abha_service.get_public_key")
@patch("requests.post")
def test_request_aadhaar_otp_payload_structure(mock_post, mock_get_pk, mock_gen_token):
    mock_gen_token.return_value = {"accessToken": "mock_access_token"}
    mock_get_pk.return_value = {"publicKey": "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ..."}

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"txnId": "test-txn-123", "message": "OTP sent successfully"}
    mock_post.return_value = mock_resp

    with patch("app.services.abdm.abha_service.encrypt_data", return_value="encrypted_aadhaar_bytes"):
        res = request_aadhaar_otp("999988887777")
        assert res["txnId"] == "test-txn-123"

        payload = mock_post.call_args[1]["json"]
        assert payload["loginHint"] == "aadhaar"
        assert payload["loginId"] == "encrypted_aadhaar_bytes"
        assert payload["otpSystem"] == "aadhaar"
        assert payload["scope"] == ["abha-enrol"]


@patch("app.services.abdm.abha_service.settings.ABDM_MOCK_MODE", False)
@patch("app.services.abdm.abha_service.generate_session_token")
@patch("app.services.abdm.abha_service.get_public_key")
@patch("requests.post")
def test_enroll_abha_payload_structure_and_token_stripping(mock_post, mock_get_pk, mock_gen_token):
    mock_gen_token.return_value = {"accessToken": "mock_access_token"}
    mock_get_pk.return_value = {"publicKey": "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ..."}

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    # Simulate a raw ABDM response containing tokens and ABHAProfile
    mock_resp.json.return_value = {
        "message": "Account created successfully",
        "txnId": "test-txn-123",
        "tokens": {
            "token": "secret_jwt_token",
            "refreshToken": "secret_refresh_token"
        },
        "ABHAProfile": {
            "ABHANumber": "91-1234-5678-9012",
            "phrAddress": ["91123456789012@sbx"],
            "firstName": "John",
            "lastName": "Doe"
        },
        "isNew": True
    }
    mock_post.return_value = mock_resp

    with patch("app.services.abdm.abha_service.encrypt_data", return_value="encrypted_otp_bytes"):
        res = enroll_abha(txn_id="test-txn-123", otp="123456", mobile="9876543210")
        
        # Verify tokens are stripped
        assert "tokens" not in res
        assert "token" not in res
        assert "refreshToken" not in res
        
        # Verify safe structured response
        assert res["message"] == "Account created successfully"
        assert res["ABHANumber"] == "91-1234-5678-9012"
        assert res["abha_address"] == "91123456789012@sbx"
        assert res["profile"]["firstName"] == "John"
        assert res["isNew"] is True

        payload = mock_post.call_args[1]["json"]
        assert payload["authData"]["authMethods"] == ["otp"]
        assert payload["authData"]["otp"]["txnId"] == "test-txn-123"
        assert payload["authData"]["otp"]["otpValue"] == "encrypted_otp_bytes"
        assert payload["authData"]["otp"]["mobile"] == "9876543210"
        assert payload["consent"]["code"] == "abha-enrollment"


from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
import pytest

client = TestClient(app)

@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@patch("app.routers.identity.enroll_abha")
def test_verify_otp_with_patient_id(mock_enroll, db_session):
    from app.models.patient import Patient
    # Create a test patient without ABHA
    patient = Patient(
        first_name="TestABHA",
        last_name="Persistence",
        phone="1234567890",
    )
    db_session.add(patient)
    db_session.commit()
    patient_id = str(patient.id)

    unique_abha = f"91-0000-0000-{uuid.uuid4().hex[:4]}"
    mock_enroll.return_value = {
        "message": "Success",
        "ABHANumber": unique_abha,
        "abha_address": f"{unique_abha.replace('-', '')}@sbx",
    }

    # Test with patient_id
    payload = {
        "txn_id": "txn_123",
        "otp": "123456",
        "patient_id": patient_id
    }
    resp = client.post("/identity/abha/verify-otp", json=payload)
    assert resp.status_code == 200
    
    # Verify patient DB was updated
    db_session.refresh(patient)
    assert patient.abha_id == unique_abha
    assert patient.abha_address == f"{unique_abha.replace('-', '')}@sbx"


@patch("app.routers.identity.enroll_abha")
def test_verify_otp_without_patient_id(mock_enroll):
    mock_enroll.return_value = {
        "message": "Success",
        "ABHANumber": "91-1111-1111-1111",
        "abha_address": "91111111111111@sbx",
    }

    # Test without patient_id
    payload = {
        "txn_id": "txn_123",
        "otp": "123456"
    }
    resp = client.post("/identity/abha/verify-otp", json=payload)
    assert resp.status_code == 200
    assert resp.json()["ABHANumber"] == "91-1111-1111-1111"


@patch("app.routers.identity.settings.ABDM_MOCK_MODE", False)
@patch("app.services.abdm.abha_service.settings.ABDM_MOCK_MODE", False)
@patch("app.services.abdm.abha_service.requests.post")
def test_abdm_failure_returns_structured_error(mock_post):
    import requests
    mock_resp = MagicMock()
    mock_resp.status_code = 422
    mock_resp.json.return_value = {"message": "Invalid OTP", "details": "The OTP provided is incorrect"}
    mock_post.side_effect = requests.exceptions.HTTPError(response=mock_resp)

    payload = {
        "txn_id": "txn_123",
        "otp": "wrong",
    }
    resp = client.post("/identity/abha/verify-otp", json=payload)
    assert resp.status_code == 422
    # Ensure raw tokens or internal exceptions aren't leaked, only structured message
    assert "Invalid OTP" in resp.json()["detail"] or "The OTP provided is incorrect" in resp.json()["detail"]


def test_patient_update_abha_fields(db_session):
    from app.models.patient import Patient
    from app.core.security import create_access_token
    # Create patient
    patient = Patient(
        first_name="Update",
        last_name="Test",
        phone="5555555555",
    )
    db_session.add(patient)
    db_session.commit()
    patient_id = str(patient.id)

    # Generate token
    token = create_access_token({"sub": patient_id, "role": "patient"})
    headers = {"Authorization": f"Bearer {token}"}

    # Update patient with ABHA fields
    unique_abha = f"91-8888-8888-{uuid.uuid4().hex[:4]}"
    update_payload = {
        "abha_id": unique_abha,
        "abha_address": f"{unique_abha.replace('-', '')}@sbx"
    }
    
    resp = client.put(f"/identity/patient/{patient_id}", json=update_payload, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["abha_id"] == unique_abha
    assert resp.json()["abha_address"] == f"{unique_abha.replace('-', '')}@sbx"

    # Verify DB
    db_session.refresh(patient)
    assert patient.abha_id == unique_abha
    assert patient.abha_address == f"{unique_abha.replace('-', '')}@sbx"
