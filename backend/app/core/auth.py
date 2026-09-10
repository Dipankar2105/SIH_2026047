from typing import Optional, Dict, Any
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token

security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    request: Request = None,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Extracts and validates the current user:
    1. Primary: Validates Bearer JWT from Authorization header.
    2. Fallback: For Track C tests/dev, checks X-User-Role and X-User-Id headers.
    3. If neither is valid, raises 401 Unauthorized.
    """
    if credentials and credentials.credentials:
        token = credentials.credentials
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is expired or invalid",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload

    # Fallback to header-based role/user simulation (used in Track C tests & dev)
    if request is not None:
        user_role = request.headers.get("X-User-Role")
        user_id = request.headers.get("X-User-Id")
        if user_role:
            sub = "00000000-0000-0000-0000-000000000000"
            if user_id:
                try:
                    sub = str(UUID(user_id))
                except (ValueError, TypeError):
                    sub = str(user_id)
            return {
                "sub": sub,
                "role": user_role.lower(),
                "email": f"{user_role.lower()}@medikiosk.in",
            }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Missing or invalid authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_optional_user(
    request: Request = None,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> Optional[Dict[str, Any]]:
    if credentials and credentials.credentials:
        return decode_access_token(credentials.credentials)
    if request is not None and request.headers.get("X-User-Role"):
        user_role = request.headers.get("X-User-Role")
        user_id = request.headers.get("X-User-Id", "00000000-0000-0000-0000-000000000000")
        return {"sub": user_id, "role": user_role.lower()}
    return None


# Re-export require_roles from rbac for Track C compatibility
def require_roles(*roles: str):
    from app.core.rbac import require_roles as _require_roles
    return _require_roles(*roles)
