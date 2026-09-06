import logging
import uuid
from datetime import datetime, timezone

import requests
from fastapi import HTTPException

from app.core.config import settings
from app.services.abdm.auth import generate_session_token
from app.services.abdm.encryption import encrypt_data, get_public_key

logger = logging.getLogger(__name__)


def request_aadhaar_otp(aadhaar: str) -> dict:
    """
    Requests OTP for Aadhaar enrollment via ABDM ABHA V3 API.
    Endpoint: POST https://abhasbx.abdm.gov.in/abha/api/v3/enrollment/request/otp
    """
    if settings.ABDM_MOCK_MODE:
        return {"txnId": "test-txn-123", "message": "OTP sent successfully (Mocked)"}

    try:
        # 1. Get ABDM session token
        session = generate_session_token()
        access_token = session.get("accessToken")
        if not access_token:
            raise HTTPException(status_code=502, detail="Failed to obtain ABDM access token")

        # 2. Get ABDM public key
        key_response = get_public_key(access_token)
        public_key = key_response.get("publicKey")
        if not public_key:
            raise HTTPException(status_code=502, detail="Failed to obtain ABDM public certificate key")

        # 3. Encrypt Aadhaar
        encrypted_aadhaar = encrypt_data(aadhaar, public_key)

        # 4. Request OTP
        url = f"{settings.ABDM_ABHA_BASE_URL}/v3/enrollment/request/otp"

        timestamp = (
            datetime.now(timezone.utc)
            .strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]
            + "Z"
        )

        headers = {
            "Authorization": f"Bearer {access_token}",
            "REQUEST-ID": str(uuid.uuid4()),
            "TIMESTAMP": timestamp,
            "Content-Type": "application/json",
        }

        payload = {
            "txnId": "",
            "scope": ["abha-enrol"],
            "loginHint": "aadhaar",
            "loginId": encrypted_aadhaar,
            "otpSystem": "aadhaar",
        }

        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=15,
        )
        response.raise_for_status()
        return response.json()
    except HTTPException:
        raise
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if hasattr(e, "response") and e.response is not None else 502
        is_dev = getattr(settings, "ENVIRONMENT", "").lower() in ("development", "dev", "local")

        resp_body = None
        if hasattr(e, "response") and e.response is not None:
            try:
                resp_body = e.response.json()
            except Exception:
                resp_body = e.response.text

        if is_dev:
            logger.error("ABDM Aadhaar OTP request failed: status=%s, response=%s", status_code, resp_body)
            error_detail = f"ABDM Aadhaar OTP request failed (Status {status_code}): {resp_body}"
        else:
            error_detail = "ABDM Aadhaar OTP request failed"
            if isinstance(resp_body, dict):
                if "message" in resp_body:
                    error_detail = f"ABDM OTP Request Error: {resp_body['message']}"
                elif "details" in resp_body:
                    error_detail = f"ABDM OTP Request Error: {resp_body['details']}"

        raise HTTPException(status_code=status_code, detail=error_detail)
    except Exception:
        raise HTTPException(status_code=502, detail="ABDM service unavailable. Please try again or continue with local registration.")


def enroll_abha(
    txn_id: str,
    otp: str,
    mobile: str = "",
) -> dict:
    """
    Verifies OTP and completes ABHA enrollment via ABDM ABHA V3 API.
    Endpoint: POST https://abhasbx.abdm.gov.in/abha/api/v3/enrollment/enrol/byAadhaar

    Returns a sanitized response with ABHAProfile data (tokens are stripped).
    """
    if settings.ABDM_MOCK_MODE:
        return {
            "message": "Account created successfully",
            "txnId": txn_id,
            "isNew": True,
            "ABHANumber": "91-1234-5678-9012",
            "abha_address": "91123456789012@sbx",
            "profile": {
                "firstName": "John",
                "middleName": "",
                "lastName": "Doe",
                "dob": "1990-01-01",
                "gender": "M",
                "mobile": mobile or "9876543210",
                "abhaStatus": "ACTIVE",
                "stateName": "Karnataka",
                "districtName": "Bengaluru",
                "address": "123 Mock Street",
                "pinCode": "560001",
            },
        }

    try:
        # 1. Get fresh ABDM session token
        session = generate_session_token()
        access_token = session.get("accessToken")
        if not access_token:
            raise HTTPException(status_code=502, detail="Failed to obtain ABDM access token")

        # 2. Get public key
        key_response = get_public_key(access_token)
        public_key = key_response.get("publicKey")
        if not public_key:
            raise HTTPException(status_code=502, detail="Failed to obtain ABDM public certificate key")

        # 3. Encrypt OTP
        encrypted_otp = encrypt_data(otp, public_key)

        # 4. Enrol ABHA via Aadhaar OTP
        url = f"{settings.ABDM_ABHA_BASE_URL}/v3/enrollment/enrol/byAadhaar"

        timestamp = (
            datetime.now(timezone.utc)
            .strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]
            + "Z"
        )

        headers = {
            "Authorization": f"Bearer {access_token}",
            "REQUEST-ID": str(uuid.uuid4()),
            "TIMESTAMP": timestamp,
            "Content-Type": "application/json",
        }

        otp_block = {
            "txnId": txn_id,
            "otpValue": encrypted_otp,
        }
        if mobile:
            otp_block["mobile"] = mobile

        payload = {
            "authData": {
                "authMethods": ["otp"],
                "otp": otp_block,
            },
            "consent": {
                "code": "abha-enrollment",
                "version": "1.4",
            },
        }

        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=15,
        )
        response.raise_for_status()
        raw = response.json()

        # Parse and return safe response (strip tokens — never leak to client)
        return _parse_enrollment_response(raw)
    except HTTPException:
        raise
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if hasattr(e, "response") and e.response is not None else 502
        is_dev = getattr(settings, "ENVIRONMENT", "").lower() in ("development", "dev", "local")

        resp_body = None
        if hasattr(e, "response") and e.response is not None:
            try:
                resp_body = e.response.json()
            except Exception:
                resp_body = e.response.text

        if is_dev:
            logger.error("ABDM ABHA Enrollment verification failed: status=%s, response=%s", status_code, resp_body)
            error_detail = f"ABDM ABHA Enrollment verification failed (Status {status_code}): {resp_body}"
        else:
            error_detail = "ABDM ABHA Enrollment verification failed"
            if isinstance(resp_body, dict):
                if "message" in resp_body:
                    error_detail = f"ABDM Enrollment Error: {resp_body['message']}"
                elif "details" in resp_body:
                    error_detail = f"ABDM Enrollment Error: {resp_body['details']}"

        raise HTTPException(status_code=status_code, detail=error_detail)
    except Exception:
        raise HTTPException(status_code=502, detail="ABDM service unavailable. Please try again or continue with local registration.")


def _parse_enrollment_response(raw: dict) -> dict:
    """
    Extracts ABHA profile data from the raw ABDM enrollment response.
    Strips tokens and sensitive data — never returns them to the client.

    Expected raw structure (from ABDM V3 Postman):
    {
        "message": "Account created successfully",
        "txnId": "...",
        "tokens": { ... },       <-- STRIPPED
        "ABHAProfile": {
            "ABHANumber": "91-XXXX-XXXX-XXXX",
            "phrAddress": ["XXXX@sbx"],
            "firstName": "...",
            "lastName": "...",
            ...
        },
        "isNew": true
    }
    """
    profile = raw.get("ABHAProfile", {})

    abha_number = profile.get("ABHANumber", "")
    phr_addresses = profile.get("phrAddress", [])
    abha_address = phr_addresses[0] if phr_addresses else ""

    return {
        "message": raw.get("message", ""),
        "txnId": raw.get("txnId", ""),
        "isNew": raw.get("isNew", False),
        "ABHANumber": abha_number,
        "abha_address": abha_address,
        "profile": {
            "firstName": profile.get("firstName", ""),
            "middleName": profile.get("middleName", ""),
            "lastName": profile.get("lastName", ""),
            "dob": profile.get("dob", ""),
            "gender": profile.get("gender", ""),
            "mobile": profile.get("mobile", ""),
            "abhaStatus": profile.get("abhaStatus", ""),
            "stateName": profile.get("stateName", ""),
            "districtName": profile.get("districtName", ""),
            "address": profile.get("address", ""),
            "pinCode": profile.get("pinCode", ""),
        },
    }