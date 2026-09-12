import base64
import hmac
import hashlib
import json
import time
from typing import Any, Dict, Optional

from app.core.config import settings


def _urlsafe_b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _urlsafe_b64decode(data: str) -> bytes:
    padding = "=" * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)


def create_access_token(data: Dict[str, Any], expires_in_seconds: int = 86400) -> str:
    """
    Creates an HMAC-SHA256 signed JWT token for authentication & RBAC.
    """
    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    now = int(time.time())
    payload.setdefault("iat", now)
    payload.setdefault("exp", now + expires_in_seconds)

    header_bytes = json.dumps(header, separators=(",", ":")).encode("utf-8")
    payload_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")

    encoded_header = _urlsafe_b64encode(header_bytes)
    encoded_payload = _urlsafe_b64encode(payload_bytes)

    signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
    secret_key = settings.SUPABASE_JWT_SECRET.encode("utf-8")
    signature = hmac.new(secret_key, signing_input, hashlib.sha256).digest()
    encoded_signature = _urlsafe_b64encode(signature)

    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and verifies an HMAC-SHA256 signed JWT token.
    """
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None

        encoded_header, encoded_payload, encoded_signature = parts
        signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
        secret_key = settings.SUPABASE_JWT_SECRET.encode("utf-8")
        expected_signature = hmac.new(secret_key, signing_input, hashlib.sha256).digest()

        actual_signature = _urlsafe_b64decode(encoded_signature)
        if not hmac.compare_digest(expected_signature, actual_signature):
            return None

        payload_bytes = _urlsafe_b64decode(encoded_payload)
        payload = json.loads(payload_bytes.decode("utf-8"))

        # Verify expiration
        exp = payload.get("exp")
        if exp and int(time.time()) > exp:
            return None

        return payload
    except Exception:
        return None
