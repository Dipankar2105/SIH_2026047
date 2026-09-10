"""
seed_kaggle_drugs.py
Ingests kaggle_drugs.csv (~222K Indian drugs) into Supabase PostgreSQL `drugs` table.
Maps attributes for Track C prescription autocomplete:
- name: brand / formulation name
- generic_name: substitute0 (or best available fallback)
- strength: cleanly parsed dosage strength (e.g. 500mg, 625, 50mg/500mg)
- dosage_form: tablet/capsule/syrup/suspension/injection/etc.
- manufacturer: None (not available in CSV)
- description: concise summary of therapeutic class, uses, side effects
- is_active: True
"""

import csv
import io
import os
import re
import sys
import time
from dotenv import load_dotenv
import psycopg2

# Load environment
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
db_url = os.environ.get("DATABASE_URL")
if not db_url:
    print("[ERROR] DATABASE_URL not found in backend/.env")
    sys.exit(1)

CSV_FILE = os.path.join(os.path.dirname(__file__), "..", "kaggle_drugs.csv")
if not os.path.exists(CSV_FILE):
    # Try current directory
    CSV_FILE = "kaggle_drugs.csv"
    if not os.path.exists(CSV_FILE):
        print(f"[ERROR] kaggle_drugs.csv not found at {CSV_FILE}")
        sys.exit(1)

DOSAGE_FORMS = [
    ("tablet", r"\b(?:tablet|tablets|tab|tabs|dt|sr|er|cr|dr|md|mr|pr)\b"),
    ("capsule", r"\b(?:capsule|capsules|cap|caps)\b"),
    ("syrup", r"\b(?:syrup|syrups|syp)\b"),
    ("suspension", r"\b(?:suspension|susp)\b"),
    ("injection", r"\b(?:injection|injections|inj)\b"),
    ("drops", r"\b(?:drops|drop)\b"),
    ("cream", r"\b(?:cream|crm)\b"),
    ("ointment", r"\b(?:ointment|oint)\b"),
    ("gel", r"\b(?:gel)\b"),
    ("lotion", r"\b(?:lotion)\b"),
    ("solution", r"\b(?:solution|soln|sol)\b"),
    ("inhaler", r"\b(?:inhaler|respules|rotacaps|rotacap)\b"),
    ("spray", r"\b(?:spray|nasal spray)\b"),
    ("powder", r"\b(?:powder|sachet|granules)\b"),
    ("infusion", r"\b(?:infusion)\b"),
    ("soap", r"\b(?:soap)\b"),
    ("mouthwash", r"\b(?:mouthwash|gargle)\b"),
    ("oil", r"\b(?:oil)\b"),
    ("patch", r"\b(?:patch)\b"),
    ("suppository", r"\b(?:suppository|pessary)\b"),
]

def extract_dosage_form(name: str) -> str | None:
    for form, pat in DOSAGE_FORMS:
        if re.search(pat, name, re.I):
            return form
    return None

def extract_strength(name: str) -> str | None:
    # 1. Multi-component dosage with units (e.g. 500 mg/125 mg, 50mg+500mg, 100mg/325mg/10mg)
    m = re.search(
        r"\b\d+(?:\.\d+)?\s*(?:mg|mcg|gm|g|ml|iu|%)\s*(?:/|\+|\&)\s*\d+(?:\.\d+)?\s*(?:mg|mcg|gm|g|ml|iu|%)(?:\s*(?:/|\+|\&)\s*\d+(?:\.\d+)?\s*(?:mg|mcg|gm|g|ml|iu|%))?",
        name,
        re.I,
    )
    if m:
        return m.group(0).strip()[:100]

    # 2. Number + unit (e.g. 120mg, 0.9%, 60000 iu, 100 mcg)
    m = re.search(
        r"\b\d+(?:\.\d+)?\s*(?:mg|mcg|gm|g|ml|iu|%)(?![a-zA-Z0-9])",
        name,
        re.I,
    )
    if m:
        return m.group(0).strip()[:100]

    # 3. Ratio without units (e.g. 1/500, 50/500)
    m = re.search(r"\b\d+(?:\.\d+)?\s*/\s*\d+(?:\.\d+)?\b", name)
    if m:
        return m.group(0).strip()[:100]

    # 4. Standalone dosage number directly preceding suffix or dosage keyword (e.g. '625 duo', '500 tablet')
    # Extracts ONLY the digits group to strictly avoid trailing text like 'tab'
    m = re.search(
        r"\b(\d{1,5})\s*(?:duo|forte|plus|ds|sr|er|cr|dt|mr|pr|tr|tablet|tablets|tab|tabs|capsule|capsules|cap|caps|syrup|syrups|syp|injection|inj|suspension|susp|drops|drop)\b",
        name,
        re.I,
    )
    if m:
        return m.group(1).strip()[:100]

    return None

def extract_generic_name(row: dict) -> str | None:
    for i in range(5):
        val = row.get(f"substitute{i}", "").strip()
        if val and val.lower() not in ("na", "nan", "none", ""):
            return val[:200]
    return None

def build_description(row: dict) -> str | None:
    parts = []
    # Uses
    uses = [row.get(f"use{i}", "").strip() for i in range(5)]
    uses = [u for u in uses if u and u.lower() not in ("na", "nan", "none", "")]
    if uses:
        parts.append("Uses: " + ", ".join(uses[:3]))

    # Side Effects
    ses = [row.get(f"sideEffect{i}", "").strip() for i in range(42)]
    ses = [s for s in ses if s and s.lower() not in ("na", "nan", "none", "")]
    if ses:
        parts.append("Side Effects: " + ", ".join(ses[:4]))

    # Therapeutic Class
    tc = row.get("Therapeutic Class", "").strip()
    if tc and tc.lower() not in ("na", "nan", "none", ""):
        parts.append("Therapeutic: " + tc)

    # Chemical Class
    cc = row.get("Chemical Class", "").strip()
    if cc and cc.lower() not in ("na", "nan", "none", ""):
        parts.append("Chemical: " + cc)

    if parts:
        return "; ".join(parts)
    return None

def clean_tsv_value(val: str | None) -> str:
    if val is None:
        return r"\N"
    # Replace tabs and newlines with space, escape backslashes
    clean = str(val).replace("\\", "\\\\").replace("\t", " ").replace("\r", " ").replace("\n", " ").strip()
    return clean if clean else r"\N"

def run():
    print("=" * 60)
    print("MediKiosk - Track A: Kaggle Drugs Seeder")
    print("=" * 60)
    print(f"Reading CSV from: {CSV_FILE}")

    # Parse and deduplicate CSV
    t_start = time.time()
    drugs_dict = {}
    total_raw_rows = 0

    with open(CSV_FILE, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        for row in reader:
            total_raw_rows += 1
            raw_name = row.get("name", "").strip()
            if not raw_name:
                continue
            key = raw_name.lower()
            if key not in drugs_dict:
                drugs_dict[key] = row
            else:
                # If existing entry has fewer fields, replace it
                curr_sub = drugs_dict[key].get("substitute0", "").strip()
                new_sub = row.get("substitute0", "").strip()
                if not curr_sub and new_sub:
                    drugs_dict[key] = row

    print(f"Total CSV rows: {total_raw_rows:,}")
    print(f"Unique drug brand names: {len(drugs_dict):,}")
    print(f"Deduplication completed in {time.time() - t_start:.2f}s")

    # Connect to Supabase
    print(f"\nConnecting to Supabase PostgreSQL at {db_url.split('@')[-1]}...")
    conn = psycopg2.connect(db_url)
    conn.autocommit = False
    cur = conn.cursor()

    try:
        # Check initial baseline rows from Sep 6
        cur.execute("SELECT count(*) FROM drugs WHERE created_at < '2026-09-09 00:00:00+00';")
        baseline_count = cur.fetchone()[0]
        print(f"Existing WHO/NLEM baseline drugs to preserve: {baseline_count}")

        # Remove previous corrupted/duplicate runs from today
        print("Cleaning previous flawed/duplicated seed runs from today...")
        cur.execute("DELETE FROM drugs WHERE created_at >= '2026-09-09 00:00:00+00';")
        deleted_count = cur.rowcount
        print(f"Removed {deleted_count:,} duplicate/corrupted rows from today.")
        conn.commit()

        # Stream entries into Supabase in batches
        print(f"\nStreaming {len(drugs_dict):,} drugs into Supabase via COPY FROM STDIN...")
        batch_size = 50000
        batch_rows = []
        total_inserted = 0
        t_copy_start = time.time()

        for name_key, row in drugs_dict.items():
            name = row["name"].strip()[:200]
            generic_name = extract_generic_name(row)
            strength = extract_strength(name)
            dosage_form = extract_dosage_form(name)
            manufacturer = None
            description = build_description(row)
            is_active = "true"

            line = "\t".join([
                clean_tsv_value(name),
                clean_tsv_value(generic_name),
                clean_tsv_value(strength),
                clean_tsv_value(dosage_form),
                clean_tsv_value(manufacturer),
                clean_tsv_value(description),
                is_active
            ]) + "\n"
            batch_rows.append(line)

            if len(batch_rows) >= batch_size:
                buf = io.StringIO("".join(batch_rows))
                cur.copy_expert(
                    "COPY drugs (name, generic_name, strength, dosage_form, manufacturer, description, is_active) FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N');",
                    buf
                )
                conn.commit()
                total_inserted += len(batch_rows)
                print(f"  Inserted {total_inserted:,} / {len(drugs_dict):,} rows...")
                batch_rows = []

        if batch_rows:
            buf = io.StringIO("".join(batch_rows))
            cur.copy_expert(
                "COPY drugs (name, generic_name, strength, dosage_form, manufacturer, description, is_active) FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N');",
                buf
            )
            conn.commit()
            total_inserted += len(batch_rows)
            print(f"  Inserted {total_inserted:,} / {len(drugs_dict):,} rows...")

        print(f"Bulk ingestion completed in {time.time() - t_copy_start:.2f}s!")

        # Create Trigram GIN indexes for lightning-fast autocomplete (pg_trgm)
        print("\nOptimizing search performance for Track C autocomplete...")
        conn.autocommit = True
        cur.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
        print("  [OK] pg_trgm extension verified.")

        print("  Creating GIN trigram index on drugs(name)...")
        cur.execute("CREATE INDEX IF NOT EXISTS ix_drugs_name_trgm ON drugs USING gin (name gin_trgm_ops);")
        print("  Creating GIN trigram index on drugs(generic_name)...")
        cur.execute("CREATE INDEX IF NOT EXISTS ix_drugs_generic_name_trgm ON drugs USING gin (generic_name gin_trgm_ops);")
        print("  [OK] GIN trigram indexes created successfully.")

        # Verification & Stats
        print("\n" + "=" * 60)
        print("VERIFICATION & STATISTICS")
        print("=" * 60)
        cur.execute("SELECT count(*) FROM drugs;")
        final_count = cur.fetchone()[0]
        print(f"Total Rows in `drugs` table: {final_count:,}")

        cur.execute("SELECT count(DISTINCT name) FROM drugs;")
        distinct_names = cur.fetchone()[0]
        print(f"Distinct Drug Names: {distinct_names:,}")

        cur.execute("SELECT count(*) FROM drugs WHERE strength LIKE '%tab%';")
        corrupted_strength = cur.fetchone()[0]
        print(f"Corrupted Strengths (containing 'tab'): {corrupted_strength} (must be 0)")

        # Test search query: q=paracetamol
        print("\nSimulating Track C Autocomplete Search: GET /api/prescriptions/drugs/search?q=paracetamol")
        t_query = time.time()
        cur.execute("""
            SELECT id, name, generic_name, strength, dosage_form, is_active
            FROM drugs
            WHERE is_active = true AND (name ILIKE '%paracetamol%' OR generic_name ILIKE '%paracetamol%')
            ORDER BY 
                CASE WHEN name ILIKE 'paracetamol%' THEN 1 
                     WHEN generic_name ILIKE 'paracetamol%' THEN 2 
                     ELSE 3 END,
                name
            LIMIT 10;
        """)
        results = cur.fetchall()
        query_time = (time.time() - t_query) * 1000
        print(f"Search Query Latency: {query_time:.1f} ms")
        print(f"Returned {len(results)} sample matches:")
        for r in results:
            print(f"  • {r[1]} | Generic: {r[2]} | Strength: {r[3]} | Form: {r[4]}")

        print("\n[SUCCESS] Shared `drugs` table successfully seeded and verified!")

    except Exception as e:
        conn.rollback()
        print(f"\n[ERROR] Seeding failed: {e}")
        raise e
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run()
