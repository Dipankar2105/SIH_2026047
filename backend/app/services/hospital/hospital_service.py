import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Set, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status, WebSocket

from app.models.appointment import Appointment
from app.models.hospital import Hospital
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.kiosk_session import KioskSession
from app.schemas.hospital import QueueItemCreate, QueueItemResponse, QueueStatusUpdate, HospitalDashboardResponse


class ConnectionManager:
    def __init__(self):
        # Map hospital_id -> Set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, hospital_id: str, websocket: WebSocket):
        await websocket.accept()
        if hospital_id not in self.active_connections:
            self.active_connections[hospital_id] = set()
        self.active_connections[hospital_id].add(websocket)

    def disconnect(self, hospital_id: str, websocket: WebSocket):
        if hospital_id in self.active_connections:
            self.active_connections[hospital_id].discard(websocket)

    async def broadcast_queue_update(self, hospital_id: str, data: Dict[str, Any]):
        if hospital_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[hospital_id]:
                try:
                    await connection.send_json(data)
                except Exception:
                    disconnected.add(connection)
            for conn in disconnected:
                self.active_connections[hospital_id].discard(conn)


ws_manager = ConnectionManager()


def add_patient_to_queue(db: Session, queue_in: QueueItemCreate) -> QueueItemResponse:
    hospital = db.query(Hospital).filter(Hospital.id == queue_in.hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found")

    doctor = db.query(Doctor).filter(Doctor.id == queue_in.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    patient = db.query(Patient).filter(Patient.id == queue_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    # Create queue appointment item
    now = datetime.now(timezone.utc)
    appointment = Appointment(
        patient_id=queue_in.patient_id,
        doctor_id=queue_in.doctor_id,
        hospital_id=queue_in.hospital_id,
        appointment_time=now,
        status="waiting",
        reason=queue_in.reason or "Kiosk Check-in",
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    # Calculate queue position
    queue_pos = (
        db.query(Appointment)
        .filter(
            Appointment.hospital_id == queue_in.hospital_id,
            Appointment.doctor_id == queue_in.doctor_id,
            Appointment.status == "waiting",
            Appointment.created_at <= appointment.created_at,
        )
        .count()
    )

    return QueueItemResponse(
        appointment_id=appointment.id,
        patient_id=patient.id,
        patient_name=f"{patient.first_name} {patient.last_name or ''}".strip(),
        doctor_id=doctor.id,
        doctor_name=doctor.name,
        hospital_id=hospital.id,
        queue_position=queue_pos,
        status="waiting",
        created_at=appointment.created_at,
    )


def get_live_queue(db: Session, hospital_id: uuid.UUID, doctor_id: Optional[uuid.UUID] = None) -> List[QueueItemResponse]:
    query = (
        db.query(Appointment)
        .filter(
            Appointment.hospital_id == hospital_id,
            Appointment.status.in_(["waiting", "in_consultation"]),
        )
    )

    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)

    appointments = query.order_by(Appointment.created_at.asc()).all()

    items: List[QueueItemResponse] = []
    for idx, appt in enumerate(appointments, start=1):
        patient = db.query(Patient).filter(Patient.id == appt.patient_id).first()
        doctor = db.query(Doctor).filter(Doctor.id == appt.doctor_id).first()

        items.append(
            QueueItemResponse(
                appointment_id=appt.id,
                patient_id=appt.patient_id,
                patient_name=f"{patient.first_name} {patient.last_name or ''}".strip() if patient else "Unknown",
                doctor_id=appt.doctor_id,
                doctor_name=doctor.name if doctor else "Unknown",
                hospital_id=hospital_id,
                queue_position=idx,
                status=appt.status,
                created_at=appt.created_at,
            )
        )
    return items


def update_queue_status(db: Session, appointment_id: uuid.UUID, update_in: QueueStatusUpdate) -> QueueItemResponse:
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Queue appointment not found")

    appt.status = update_in.status
    if update_in.status == "in_consultation" and appt.consultation_start_time is None:
        appt.consultation_start_time = datetime.now(timezone.utc)

    db.commit()
    db.refresh(appt)

    queue = get_live_queue(db, appt.hospital_id, appt.doctor_id)
    for item in queue:
        if item.appointment_id == appt.id:
            return item

    patient = db.query(Patient).filter(Patient.id == appt.patient_id).first()
    doctor = db.query(Doctor).filter(Doctor.id == appt.doctor_id).first()

    return QueueItemResponse(
        appointment_id=appt.id,
        patient_id=appt.patient_id,
        patient_name=f"{patient.first_name} {patient.last_name or ''}".strip() if patient else "Unknown",
        doctor_id=appt.doctor_id,
        doctor_name=doctor.name if doctor else "Unknown",
        hospital_id=appt.hospital_id,
        queue_position=0,
        status=appt.status,
        created_at=appt.created_at,
    )


def get_hospital_dashboard(db: Session, hospital_id: uuid.UUID) -> HospitalDashboardResponse:
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found")

    now = datetime.now(timezone.utc)
    # Kiosk Fleet Status
    active_kiosks = db.query(KioskSession).filter(KioskSession.status == "active", KioskSession.expires_at > now).count()
    total_kiosks = db.query(KioskSession).count()
    inactive_kiosks = max(0, total_kiosks - active_kiosks)

    # Queue stats
    waiting = db.query(Appointment).filter(Appointment.hospital_id == hospital_id, Appointment.status == "waiting").count()
    in_consultation = db.query(Appointment).filter(Appointment.hospital_id == hospital_id, Appointment.status == "in_consultation").count()
    completed = db.query(Appointment).filter(Appointment.hospital_id == hospital_id, Appointment.status == "completed").count()

    total_doctors = db.query(Doctor).filter(Doctor.hospital_id == hospital_id).count()

    # Calculate avg wait time for completed appointments today
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    completed_today_appts = db.query(Appointment).filter(
        Appointment.hospital_id == hospital_id,
        Appointment.status == "completed",
        Appointment.appointment_time >= today_start
    ).all()

    avg_wait_time = None
    if completed_today_appts:
        total_wait_seconds = 0
        valid_appts = 0
        for appt in completed_today_appts:
            if appt.consultation_start_time and appt.appointment_time:
                wait_time = (appt.consultation_start_time - appt.appointment_time).total_seconds()
                if wait_time >= 0:
                    total_wait_seconds += wait_time
                    valid_appts += 1
        
        if valid_appts > 0:
            avg_wait_time = (total_wait_seconds / valid_appts) / 60.0  # in minutes
            avg_wait_time = round(avg_wait_time, 1)

    return HospitalDashboardResponse(
        hospital_id=hospital.id,
        hospital_name=hospital.name,
        fleet_status={
            "total_kiosks": total_kiosks,
            "active_kiosks": active_kiosks,
            "inactive_kiosks": inactive_kiosks,
        },
        queue_stats={
            "waiting_patients": waiting,
            "in_consultation": in_consultation,
            "completed_today": completed,
        },
        daily_analytics={
            "total_doctors_on_duty": total_doctors,
            "total_checkins_today": waiting + in_consultation + completed,
            "avg_wait_time_minutes": avg_wait_time,
        },
    )
