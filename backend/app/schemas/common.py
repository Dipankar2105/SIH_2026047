from uuid import UUID
from typing import Generic, TypeVar, List, Optional, Annotated
from pydantic import BaseModel, ConfigDict, BeforeValidator

T = TypeVar("T")


def _coerce_str(v):
    if v is None:
        return None
    if isinstance(v, str):
        return v
    iso = getattr(v, "isoformat", None)
    if callable(iso):
        try:
            return iso()
        except Exception:
            pass
    return str(v)


Stringified = Annotated[str, BeforeValidator(_coerce_str)]


class UUIDResponse(BaseModel):
    id: UUID


class MessageResponse(BaseModel):
    message: str


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
