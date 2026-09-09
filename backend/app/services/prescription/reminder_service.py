import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.prescription import Prescription
from app.models.prescription_item import PrescriptionItem
from app.models.reminder import Reminder
from app.core.config import settings
from app.core.audit import audit_service

MEAL_TIMES = {"breakfast": "08:00", "lunch": "13:00", "dinner": "20:00"}
FOOD_OFFSETS = {"before_food": -30, "after_food": 30, "with_food": 0, "empty_stomach": -60, "any_time": 0}


class ReminderService:
    def _parse_frequency(self, frequency: str) -> list:
        parts = frequency.split("-")
        meals = []
        if len(parts) >= 1 and parts[0] == "1":
            meals.append("breakfast")
        if len(parts) >= 2 and parts[1] == "1":
            meals.append("lunch")
        if len(parts) >= 3 and parts[2] == "1":
            meals.append("dinner")
        return meals

    def _extract_food_relation(self, instructions: str) -> str:
        if not instructions:
            return "after_food"
        lower = instructions.lower()
        if "before food" in lower:
            return "before_food"
        if "after food" in lower:
            return "after_food"
        if "with food" in lower:
            return "with_food"
        if "empty stomach" in lower:
            return "empty_stomach"
        return "after_food"

    def _compute_reminder_times(self, frequency: str, food_relation: str, duration_days: int) -> list:
        meals = self._parse_frequency(frequency)
        offset = FOOD_OFFSETS.get(food_relation, 0)
        times = []
        base_date = datetime.now()
        for day in range(duration_days):
            for meal in meals:
                meal_time = datetime.strptime(MEAL_TIMES[meal], "%H:%M")
                dt = base_date + timedelta(days=day)
                dt = dt.replace(hour=meal_time.hour, minute=meal_time.minute, second=0, microsecond=0)
                dt = dt + timedelta(minutes=offset)
                times.append(dt)
        return times

    def create_reminders(self, db: Session, prescription_id: str) -> list:
        rx = db.get(Prescription, prescription_id)
        if not rx:
            raise ValueError("Prescription not found")
        reminders = []
        for item in rx.items:
            freq = item.frequency or "1-0-1"
            instructions = item.instructions or ""
            food_relation = self._extract_food_relation(instructions)
            duration_days = 5
            if item.duration:
                try:
                    duration_days = int(item.duration.split()[0])
                except Exception:
                    duration_days = 5
            times = self._compute_reminder_times(freq, food_relation, duration_days)
            for dt in times:
                reminder = Reminder(
                    prescription_id=prescription_id,
                    reminder_time=dt,
                    message=f"Take {item.drug_name} {item.dosage or ''} - {food_relation.replace('_', ' ')}",
                    status="pending",
                )
                db.add(reminder)
                reminders.append(reminder)
        db.commit()
        audit_service.log(
            db, actor_id="system", actor_type="system",
            action="CREATE", resource_type="reminder", resource_id=str(prescription_id)
        )
        return reminders

    def send_push(self, topic: str, title: str, message: str):
        try:
            import httpx
            with httpx.Client() as client:
                client.post(
                    f"{settings.NTFY_BASE_URL}/{topic}",
                    data=message,
                    headers={"Title": title, "Priority": "high", "Tags": "pill"},
                )
        except Exception:
            pass

    def get_patient_reminders(self, db: Session, patient_id: str) -> dict:
        stmt = (
            select(Reminder)
            .join(Prescription, Reminder.prescription_id == Prescription.id)
            .where(Prescription.patient_id == patient_id)
            .order_by(Reminder.reminder_time.desc())
        )
        reminders = db.execute(stmt).scalars().all()
        active = sum(1 for r in reminders if r.status in ("pending", "sent"))
        return {"patient_id": patient_id, "reminders": reminders, "active_count": active}


reminder_service = ReminderService()
