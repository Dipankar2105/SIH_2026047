from typing import List
from sqlalchemy.orm import Session
from app.models.red_flag import RedFlag
from app.models.kiosk_session import KioskSession
from app.services.safety.safety_rules import RED_FLAG_RULES

class RedFlagService:
    def evaluate_text(self, db: Session, kiosk_session_id: str, text: str) -> dict:
        matched_flags = []
        is_emergency = False
        text_lower = text.lower()

        for rule in RED_FLAG_RULES:
            if any(kw in text_lower for kw in rule["keywords"]):
                flag_data = {
                    "rule_id": rule["rule_id"],
                    "severity": rule["severity"],
                    "trigger_symptom": rule["keywords"][0],
                    "recommendation": rule["recommendation"]
                }
                matched_flags.append(flag_data)
                if rule["severity"] == "CRITICAL":
                    is_emergency = True

                # Persist to database
                rf = RedFlag(
                    kiosk_session_id=kiosk_session_id,
                    rule_id=rule["rule_id"],
                    severity=rule["severity"],
                    trigger_symptom=rule["keywords"][0],
                    recommendation=rule["recommendation"]
                )
                db.add(rf)

        if matched_flags:
            db.commit()
            # Update kiosk session status
            session = db.query(KioskSession).filter(KioskSession.id == kiosk_session_id).first()
            if session:
                session.is_emergency = is_emergency
                session.triage_priority = "RED" if is_emergency else "YELLOW"
                db.commit()

        return {
            "kiosk_session_id": kiosk_session_id,
            "is_emergency": is_emergency,
            "triage_priority": "RED" if is_emergency else ("YELLOW" if matched_flags else "GREEN"),
            "red_flags": matched_flags,
            "action_required": "EMERGENCY_TRIAGE" if is_emergency else "STANDARD_INTAKE"
        }

red_flag_service = RedFlagService()
