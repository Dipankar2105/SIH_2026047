import uuid
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session

from app.models.red_flag import RedFlag
from app.services.safety.safety_rules import EMERGENCY_KEYWORD_RULES


NEGATION_PREFIXES = [
    "no ",
    "not ",
    "do not have ",
    "don't have ",
    "does not have ",
    "without ",
    "free of ",
    "denies ",
    "denying ",
    "नहीं ",
    "ना ",
    "नाही ",
]


def detect_red_flags(message: str) -> Tuple[bool, str, Optional[str], Optional[str]]:
    """
    Evaluates message against emergency rules.
    Returns: (is_emergency, severity, specialty, matched_rule_category)
    """
    msg_lower = (message or "").lower().strip()
    if not msg_lower:
        return (False, "normal", None, None)

    for rule in EMERGENCY_KEYWORD_RULES:
        for kw in rule["keywords"]:
            kw_lower = kw.lower()
            idx = 0
            while True:
                pos = msg_lower.find(kw_lower, idx)
                if pos == -1:
                    break
                preceding = msg_lower[max(0, pos - 25):pos]
                is_negated = any(neg in preceding for neg in NEGATION_PREFIXES)
                if not is_negated:
                    return (True, rule["severity"], rule["specialty"], rule["category"])
                idx = pos + len(kw_lower)

    return (False, "normal", None, None)



def record_red_flag(
    db: Session,
    session_id: uuid.UUID,
    flag_type: str = "EMERGENCY_RED_FLAG",
    description: str = "Emergency symptom detected",
    severity: str = "high",
) -> RedFlag:
    flag = RedFlag(
        session_id=session_id,
        flag_type=flag_type,
        description=description,
        severity=severity,
        triggered=True,
    )
    db.add(flag)
    db.commit()
    db.refresh(flag)
    return flag


def get_session_red_flags(db: Session, session_id: uuid.UUID) -> List[RedFlag]:
    return db.query(RedFlag).filter(RedFlag.session_id == session_id).order_by(RedFlag.created_at.desc()).all()


def list_active_red_flags(db: Session, limit: int = 50) -> List[RedFlag]:
    return db.query(RedFlag).filter(RedFlag.triggered == True).order_by(RedFlag.created_at.desc()).limit(limit).all()
