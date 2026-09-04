from enum import Enum
from typing import List
from fastapi import Depends, HTTPException, status
from app.core.auth import get_current_user_token

class UserRole(str, Enum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    KIOSK = "KIOSK"
    HOSPITAL_ADMIN = "HOSPITAL_ADMIN"
    SYSTEM_ADMIN = "SYSTEM_ADMIN"

class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = [r.value if isinstance(r, UserRole) else r for r in allowed_roles]

    def __call__(self, token_data: dict = Depends(get_current_user_token)) -> dict:
        user_role = token_data.get("role")
        if user_role not in self.allowed_roles and UserRole.SYSTEM_ADMIN.value not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user_role}' is not authorized to access this resource"
            )
        return token_data

require_patient = RoleChecker([UserRole.PATIENT])
require_doctor = RoleChecker([UserRole.DOCTOR])
require_kiosk = RoleChecker([UserRole.KIOSK, UserRole.HOSPITAL_ADMIN])
require_admin = RoleChecker([UserRole.HOSPITAL_ADMIN, UserRole.SYSTEM_ADMIN])
