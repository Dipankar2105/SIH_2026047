import uuid
from datetime import datetime, timezone

import requests
from fastapi import HTTPException

from app.core.config import settings


def generate_session_token() -> dict:
    """
    Generates an ABDM Gateway Session Token.
    Endpoint: POST https://dev.abdm.gov.in/api/hiecm/gateway/v3/sessions
    """
    url = f"{settings.ABDM_BASE_URL}/api/hiecm/gateway/v3/sessions"

    timestamp = (
        datetime.now(timezone.utc)
        .strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]
        + "Z"
    )

    headers = {
        "REQUEST-ID": str(uuid.uuid4()),
        "TIMESTAMP": timestamp,
        "X-CM-ID": "sbx",
        "Content-Type": "application/json",
    }

    payload = {
        "clientId": settings.ABDM_CLIENT_ID,
        "clientSecret": settings.ABDM_CLIENT_SECRET,
        "grantType": "client_credentials",
    }

    try:
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=15,
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if e.response is not None else 502
        error_detail = "ABDM Gateway session authentication failed"
        if e.response is not None:
            try:
                res_json = e.response.json()
                if isinstance(res_json, dict) and "message" in res_json:
                    error_detail = f"ABDM Session Error: {res_json['message']}"
            except Exception:
                pass
        raise HTTPException(status_code=status_code, detail=error_detail)