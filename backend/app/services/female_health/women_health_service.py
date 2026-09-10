from datetime import datetime, timedelta
from collections import Counter
from statistics import mean, stdev
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.women_timeline import WomenTimeline
from app.core.audit import audit_service

GYNAE_SPECIALTIES = {"Gynecology", "Obstetrics", "Prasuti Tantra", "Gynae"}


class WomenHealthService:
    def log_timeline_event(self, db: Session, data: dict) -> WomenTimeline:
        event = WomenTimeline(**data)
        db.add(event)
        db.commit()
        db.refresh(event)
        audit_service.log(
            db,
            actor_id=data.get("patient_id", "unknown"),
            actor_type="patient",
            action="CREATE",
            resource_type="women_health_timeline",
            resource_id=str(event.id),
        )
        return event

    def get_patient_timeline(self, db: Session, patient_id: str, requesting_doctor_specialty: str | None = None) -> list[WomenTimeline]:
        stmt = select(WomenTimeline).where(WomenTimeline.patient_id == patient_id)

        if requesting_doctor_specialty and requesting_doctor_specialty not in GYNAE_SPECIALTIES:
            stmt = stmt.where(WomenTimeline.privacy_level == "general_doctor")

        stmt = stmt.order_by(WomenTimeline.event_date.desc())
        return db.execute(stmt).scalars().all()

    def generate_gynae_clinical_digest(self, db: Session, patient_id: str) -> dict:
        cutoff = datetime.utcnow().date() - timedelta(days=180)
        stmt = select(WomenTimeline).where(
            WomenTimeline.patient_id == patient_id,
            WomenTimeline.event_date >= cutoff,
        )
        events = db.execute(stmt).scalars().all()

        cycle_lengths = [e.cycle_length_days for e in events if e.cycle_length_days is not None]
        pain_scores = [e.pain_score for e in events if e.pain_score is not None]

        all_symptoms = []
        for e in events:
            if e.symptoms:
                all_symptoms.extend(e.symptoms if isinstance(e.symptoms, list) else [str(e.symptoms)])

        symptom_counter = Counter(all_symptoms)
        common_symptoms = [s for s, _ in symptom_counter.most_common(5)]

        active_pregnancy = None
        for e in events:
            if e.category == "pregnancy" and e.pregnancy_trimester:
                active_pregnancy = e.pregnancy_trimester

        return {
            "patient_id": patient_id,
            "average_cycle_length": round(mean(cycle_lengths), 1) if cycle_lengths else None,
            "cycle_variability_days": round(stdev(cycle_lengths), 1) if len(cycle_lengths) >= 2 else None,
            "average_pain_score": round(mean(pain_scores), 1) if pain_scores else None,
            "heavy_bleeding_episodes_last_6mo": sum(1 for e in events if e.flow_intensity == "heavy"),
            "severe_pain_episodes_last_6mo": sum(1 for e in events if e.pain_score is not None and e.pain_score >= 7),
            "common_symptoms": common_symptoms,
            "active_pregnancy": active_pregnancy,
            "total_events_logged": len(events),
        }


women_health_service = WomenHealthService()
