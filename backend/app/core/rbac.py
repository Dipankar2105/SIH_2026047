from typing import List, Dict, Any, Callable
import uuid

from fastapi import Depends, HTTPException, status

from app.core.auth import get_current_user


class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = [r.lower() for r in allowed_roles]

    def __call__(self, current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = str(current_user.get("role", "")).lower()

        # Super admin bypasses all role restrictions
        if user_role == "super_admin":
            return current_user

        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{user_role}' is not authorized to access this resource",
            )
        return current_user


def require_roles(*roles: str) -> RoleChecker:
    return RoleChecker(list(roles))


def verify_patient_access(current_user: Dict[str, Any], patient_id: str | uuid.UUID) -> None:
    """
    Prevents horizontal privilege escalation.
    Patients can only access their own data.
    Doctors, Hospital Admins, Kiosk Operators, and Super Admins can access patient data as authorized.
    """
    user_role = str(current_user.get("role", "")).lower()

    if user_role in ["doctor", "hospital_admin", "kiosk_operator", "super_admin"]:
        return

    current_patient_id = str(current_user.get("sub", "") or current_user.get("patient_id", ""))
    target_patient_id = str(patient_id)

    if user_role == "patient" and current_patient_id != target_patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot access data belonging to another patient",
        )
