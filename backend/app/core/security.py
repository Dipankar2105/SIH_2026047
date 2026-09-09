from fastapi import Request
from uuid import UUID

def get_current_user(request: Request) -> dict:
    user_id = request.headers.get("X-User-Id")
    user_role = request.headers.get("X-User-Role", "doctor")
    if not user_id:
        return {"sub": "00000000-0000-0000-0000-000000000000", "role": user_role}
    try:
        uid = UUID(user_id)
    except ValueError:
        uid = UUID("00000000-0000-0000-0000-000000000000")
    return {"sub": str(uid), "role": user_role}
