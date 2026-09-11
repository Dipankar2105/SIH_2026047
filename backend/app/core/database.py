import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

load_dotenv()

raw_url = settings.DATABASE_URL

# Ensure dialect is psycopg (sync driver)
if raw_url.startswith("postgresql+asyncpg://"):
    raw_url = raw_url.replace("postgresql+asyncpg://", "postgresql+psycopg://", 1)
elif raw_url.startswith("postgresql://"):
    raw_url = raw_url.replace("postgresql://", "postgresql+psycopg://", 1)

# Convert direct IPv6 host to IPv4 Pooler host if direct host is detected
if "db.tqyvoqddppdzhkcqochw.supabase.co" in raw_url:
    raw_url = raw_url.replace("postgres:", "postgres.tqyvoqddppdzhkcqochw:", 1)
    raw_url = raw_url.replace("db.tqyvoqddppdzhkcqochw.supabase.co:5432", "aws-0-ap-south-1.pooler.supabase.com:6543", 1)

engine = create_engine(raw_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
