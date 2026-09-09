import socket

# Force IPv4 socket resolution for environments without IPv6 routing
_old_getaddrinfo = socket.getaddrinfo
def _ipv4_getaddrinfo(*args, **kwargs):
    responses = _old_getaddrinfo(*args, **kwargs)
    ipv4_responses = [r for r in responses if r[0] == socket.AF_INET]
    return ipv4_responses if ipv4_responses else responses
socket.getaddrinfo = _ipv4_getaddrinfo

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

_db_url = settings.DATABASE_URL
if "+asyncpg" in _db_url:
    _db_url = _db_url.replace("+asyncpg", "+psycopg")

engine = create_engine(_db_url, echo=True, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
