"""
Seed script: bulk-insert drug data from data/kaggle_drugs.csv into the Supabase drugs table.

Usage:
    .\.venv\Scripts\python.exe scripts/seed_drugs.py
    .\.venv\Scripts\python.exe scripts/seed_drugs.py --force

Architecture:
    Primary path uses SQLAlchemy Session from app.core.database with
    db.bulk_insert_mappings(Drug, chunk) in chunks of 5000.
    Fallback path uses the Supabase REST API (via httpx) when the direct
    PostgreSQL connection is unavailable, preserving the same chunking
    and field-mapping logic.
"""
import csv
import re
import json
import os
import sys
import argparse

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.models.drug import Drug

CSV_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "kaggle_drugs.csv",
)
if not os.path.exists(CSV_PATH):
    # Fallback to root directory if backend/data/kaggle_drugs.csv is not present
    alt_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "kaggle_drugs.csv",
    )
    if os.path.exists(alt_path):
        CSV_PATH = alt_path

CHUNK_SIZE = 5_000
SKIP_THRESHOLD = 1_000

DOSAGE_FORMS = [
    "tablet", "capsule", "syrup", "suspension", "injection", "drops",
    "cream", "ointment", "gel", "powder", "lozenge", "spray", "patch",
    "mouthwash", "suppository", "shampoo", "solution",
]


def parse_strength(name: str) -> str:
    """Extract strength info (e.g. '625', '500mg', '120mg') from drug name."""
    match = re.search(
        r"(\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g|tab|tablet|capsule|unit|units)?)",
        name,
        re.IGNORECASE,
    )
    if match:
        return match.group(1).strip()
    return None


def parse_dosage_form(name: str) -> str:
    """Detect dosage form from the drug name text."""
    lower = name.lower()
    for form in DOSAGE_FORMS:
        if form in lower:
            return form
    return None


def build_description(row: dict) -> str:
    """Combine a few side-effect / use / class fields into a short text."""
    parts = []

    side_effects = []
    for i in range(42):
        key = f"sideEffect{i}"
        val = (row.get(key) or "").strip()
        if val and val.lower() != "na":
            side_effects.append(val)
    if side_effects:
        parts.append(f"Side Effects: {', '.join(side_effects[:5])}")

    uses = []
    for i in range(5):
        key = f"use{i}"
        val = (row.get(key) or "").strip()
        if val and val.lower() != "na":
            uses.append(val)
    if uses:
        parts.append(f"Uses: {', '.join(uses[:3])}")

    chemical = (row.get("Chemical Class") or "").strip()
    if chemical and chemical.lower() != "na":
        parts.append(f"Chemical: {chemical}")

    therapeutic = (row.get("Therapeutic Class") or "").strip()
    if therapeutic and therapeutic.lower() != "na":
        parts.append(f"Therapeutic: {therapeutic}")

    desc = "; ".join(parts)
    if len(desc) > 500:
        desc = desc[:500]
    return desc if desc else None


def transform_row(row: dict) -> dict:
    """Map a CSV row to Drug model fields."""
    name = (row.get("name") or "").strip()
    if not name:
        return None

    substitute0 = (row.get("substitute0") or "").strip()
    generic_name = substitute0 if substitute0 and substitute0.lower() != "na" else None

    return {
        "name": name,
        "generic_name": generic_name,
        "strength": parse_strength(name),
        "dosage_form": parse_dosage_form(name),
        "manufacturer": None,
        "description": build_description(row),
        "is_active": True,
    }


# ---------------------------------------------------------------------------
# Primary path: SQLAlchemy + bulk_insert_mappings
# ---------------------------------------------------------------------------

def _get_existing_count_sqlalchemy() -> int:
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        return db.query(Drug).count()
    finally:
        db.close()


def seed_via_sqlalchemy(force: bool):
    from app.core.database import SessionLocal

    db = SessionLocal()
    try:
        existing = db.query(Drug).count()
        if existing > SKIP_THRESHOLD:
            if force:
                db.execute(Drug.__table__.delete())
                db.commit()
                print(f"Truncated existing drugs table ({existing} rows).")
            else:
                print(f"Drugs table already has {existing} rows (> {SKIP_THRESHOLD}). Skipping. Use --force to reseed.")
                return existing

        chunk = []
        total = 0

        with open(CSV_PATH, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                record = transform_row(row)
                if record is None:
                    continue

                chunk.append(record)

                if len(chunk) >= CHUNK_SIZE:
                    db.bulk_insert_mappings(Drug, chunk)
                    db.commit()
                    total += len(chunk)
                    chunk.clear()
                    print(f"Inserted {total} drugs...")

            if chunk:
                db.bulk_insert_mappings(Drug, chunk)
                db.commit()
                total += len(chunk)
                print(f"Inserted {total} drugs...")

        count = db.query(Drug).count()
        print(f"\nDone! Total drugs inserted: {total}")
        print(f"Sample SELECT count: {count}")
        return count
    except Exception as e:
        db.rollback()
        print(f"SQLAlchemy path failed: {e}")
        raise
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Fallback path: Supabase REST API via httpx
# ---------------------------------------------------------------------------

def _get_existing_count_rest() -> int:
    import httpx
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Prefer": "count=exact",
    }
    url = f"{settings.SUPABASE_URL}/rest/v1/drugs?select=id"
    with httpx.Client(timeout=30.0) as client:
        resp = client.head(url, headers=headers)
        if resp.status_code in (200, 206):
            cr = resp.headers.get("content-range", "0-0/0")
            if "/" in cr:
                return int(cr.split("/")[-1])
    return 0


def seed_via_rest(force: bool):
    import httpx

    base_url = f"{settings.SUPABASE_URL}/rest/v1"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    existing = _get_existing_count_rest()
    if existing > SKIP_THRESHOLD:
        if force:
            # Delete via REST API
            with httpx.Client(timeout=30.0) as client:
                resp = client.delete(f"{base_url}/drugs", headers=headers)
                if resp.status_code != 200:
                    print(f"WARN: truncate via REST failed ({resp.status_code}): {resp.text}")
                else:
                    print(f"Truncated existing drugs table ({existing} rows).")
        else:
            print(f"Drugs table already has {existing} rows (> {SKIP_THRESHOLD}). Skipping. Use --force to reseed.")
            return existing

    total = 0
    chunk = []

    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            record = transform_row(row)
            if record is None:
                continue
            chunk.append(record)

            if len(chunk) >= CHUNK_SIZE:
                with httpx.Client(timeout=120.0) as client:
                    resp = client.post(f"{base_url}/drugs", headers=headers, json=chunk)
                    if resp.status_code == 201:
                        total += len(chunk)
                        print(f"Inserted {total} drugs...")
                    else:
                        print(f"REST insert failed at {total}: {resp.status_code} {resp.text[:200]}")
                        raise RuntimeError(f"REST insert failed: {resp.status_code}")
                chunk.clear()

        if chunk:
            with httpx.Client(timeout=120.0) as client:
                resp = client.post(f"{base_url}/drugs", headers=headers, json=chunk)
                if resp.status_code == 201:
                    total += len(chunk)
                    print(f"Inserted {total} drugs...")
                else:
                    print(f"REST insert failed at {total}: {resp.status_code} {resp.text[:200]}")
                    raise RuntimeError(f"REST insert failed: {resp.status_code}")

    count = _get_existing_count_rest()
    print(f"\nDone! Total drugs inserted: {total}")
    print(f"Sample SELECT count: {count}")
    return count


def seed():
    print(f"CSV path: {CSV_PATH}")
    if not os.path.exists(CSV_PATH):
        print("ERROR: kaggle_drugs.csv not found.")
        sys.exit(1)

    parser = argparse.ArgumentParser(description="Seed drugs table from CSV")
    parser.add_argument("--force", action="store_true", help="Truncate existing data before seeding")
    args = parser.parse_args()

    try:
        seed_via_sqlalchemy(args.force)
    except Exception:
        print("\nFalling back to Supabase REST API...")
        seed_via_rest(args.force)


if __name__ == "__main__":
    seed()
