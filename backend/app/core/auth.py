from fastapi import Depends, HTTPException, Request

from app.core.rbac import (
    PATIENT, DOCTOR, PHARMACIST, ADMIN, SYSTEM,
)

_role_map = {
    PATIENT: "patient",
    DOCTOR: "doctor",
    PHARMACIST: "pharmacist",
    ADMIN: "admin",
    SYSTEM: "system",
}


def require_roles(*roles: str):
    """Dependency that requires one of the specified roles.
    Reads role from X-User-Role header. Returns the current user dict.
    Usage: current_user: dict = Depends(require_roles("doctor"))
    """
    def dependency(request: Request):
        role = request.headers.get("X-User-Role", "doctor") if request else "doctor"
        if role not in roles:
            raise HTTPException(
                status_code=403,
                detail=f"Role '{role}' is not authorized for this operation",
            )
        from app.core.security import get_current_user
        return get_current_user(request)

    return dependency
