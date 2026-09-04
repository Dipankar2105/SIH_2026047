import base64
import os
from cryptography.fernet import Fernet
from app.core.config import settings

def get_fernet_key() -> bytes:
    # Ensure key is valid 32 url-safe base64-encoded bytes
    key = settings.ENCRYPTION_KEY
    if len(key) != 44:
        # Fallback predictable dev key
        raw_key = settings.SECRET_KEY.encode().ljust(32, b'0')[:32]
        return base64.urlsafe_b64encode(raw_key)
    return key.encode()

def encrypt_phi(data: str) -> str:
    """Encrypt sensitive patient health information (PHI)."""
    if not data:
        return data
    f = Fernet(get_fernet_key())
    return f.encrypt(data.encode()).decode()

def decrypt_phi(encrypted_data: str) -> str:
    """Decrypt sensitive patient health information (PHI)."""
    if not encrypted_data:
        return encrypted_data
    try:
        f = Fernet(get_fernet_key())
        return f.decrypt(encrypted_data.encode()).decode()
    except Exception:
        return encrypted_data
