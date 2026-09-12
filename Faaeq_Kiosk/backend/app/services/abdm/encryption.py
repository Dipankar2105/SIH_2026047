import base64
import uuid
from datetime import datetime, timezone

import requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from fastapi import HTTPException

from app.core.config import settings


def get_public_key(access_token: str) -> dict:
    """
    Fetches the public certificate/key from ABDM ABHA API.
    Endpoint: GET https://abhasbx.abdm.gov.in/abha/api/v3/profile/public/certificate
    """
    url = f"{settings.ABDM_ABHA_BASE_URL}/v3/profile/public/certificate"

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

    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if e.response is not None else 502
        error_detail = "Failed to fetch ABDM public certificate"
        if e.response is not None:
            try:
                res_json = e.response.json()
                if isinstance(res_json, dict) and "message" in res_json:
                    error_detail = f"ABDM Certificate Error: {res_json['message']}"
            except Exception:
                pass
        raise HTTPException(status_code=status_code, detail=error_detail)


def encrypt_data(data: str, public_key: str) -> str:
    """
    Encrypts string data using RSA OAEP SHA-1 with MGF1 SHA-1 per ABDM security guidelines.
    """
    if not data:
        return ""

    try:
        # Strip header/footer if present or decode base64 DER
        clean_key = public_key.strip()
        if "BEGIN PUBLIC KEY" in clean_key:
            public_key_obj = serialization.load_pem_public_key(clean_key.encode("utf-8"))
        else:
            key_bytes = base64.b64decode(clean_key)
            public_key_obj = serialization.load_der_public_key(key_bytes)

        encrypted = public_key_obj.encrypt(
            data.encode("utf-8"),
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA1()),
                algorithm=hashes.SHA1(),
                label=None,
            ),
        )

        return base64.b64encode(encrypted).decode("utf-8")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RSA Encryption failed: {str(e)}")