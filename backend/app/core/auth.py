from typing import Optional, Dict, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token

security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Extracts and validates the current user from the Authorization bearer header.
    Returns user payload dictionary: {"sub": user_id, "role": role, ...}
    """
    if not credentials:
        # Fallback for unauthenticated dev/kiosk operations if configured, or raise 401
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is expired or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> Optional[Dict[str, Any]]:
    if not credentials:
        return None
    return decode_access_token(credentials.credentials)
