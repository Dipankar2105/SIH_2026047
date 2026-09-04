from datetime import datetime, timezone
import logging
from sqlalchemy.orm import Session

logger = logging.getLogger("medikiosk.audit")
logger.setLevel(logging.INFO)

def log_audit_event(
    db: Session,
    user_id: str,
    action: str,
    resource: str,
    details: str = None,
    ip_address: str = None
):
    """Log compliance and PHI access events."""
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
        "action": action,
        "resource": resource,
        "details": details,
        "ip_address": ip_address
    }
    logger.info(f"AUDIT_EVENT: {event}")
    return event
