from datetime import datetime, timezone

def format_iso_datetime(dt: datetime) -> str:
    if not dt:
        return ""
    return dt.astimezone(timezone.utc).isoformat()
