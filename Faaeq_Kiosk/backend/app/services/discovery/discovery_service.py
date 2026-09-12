import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict
from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.doctor import Doctor
from app.models.hospital import Hospital
from app.models.appointment import Appointment
from app.models.visit_history import VisitHistory
from app.schemas.appointment import (
    AppointmentCreate,
    DoctorRecommendationResponse,
    DoctorRecommendationItem,
    DoctorResponse,
    SlotListingResponse,
)

SYMPTOM_SPECIALTY_MAP = {
    "chest pain": "Cardiology",
    "heart": "Cardiology",
    "bp": "Cardiology",
    "hypertension": "Cardiology",
    "skin": "Dermatology",
    "rash": "Dermatology",
    "itching": "Dermatology",
    "acne": "Dermatology",
    "headache": "General Medicine",
    "fever": "General Medicine",
    "cough": "General Medicine",
    "cold": "General Medicine",
    "fatigue": "General Medicine",
    "bone": "Orthopedics",
    "joint pain": "Orthopedics",
    "fracture": "Orthopedics",
    "stomach": "Gastroenterology",
    "digestion": "Gastroenterology",
    "nausea": "Gastroenterology",
    "eye": "Ophthalmology",
    "vision": "Ophthalmology",
    "child": "Pediatrics",
    "infant": "Pediatrics",
}


def recommend_doctors_for_symptoms(
    db: Session,
    symptoms: str,
    patient_id: Optional[uuid.UUID] = None,
) -> DoctorRecommendationResponse:
    symptoms_lower = symptoms.lower()

    recommended_specialty = "General Medicine"
    for kw, spec in SYMPTOM_SPECIALTY_MAP.items():
        if kw in symptoms_lower:
            recommended_specialty = spec
            break

    # Fetch matching doctors
    doctors = db.query(Doctor).filter(Doctor.specialization.ilike(f"%{recommended_specialty}%")).all()

    # Fallback to all doctors if no specialty match found
    if not doctors:
        doctors = db.query(Doctor).limit(10).all()

    # Determine previously visited doctors for this specific patient
    visited_doctors = {}
    if patient_id:
        visits = db.query(VisitHistory.doctor_id, func.max(VisitHistory.visit_date)).filter(VisitHistory.patient_id == patient_id).group_by(VisitHistory.doctor_id).all()
        visited_doctors = {v[0]: v[1] for v in visits if v[0] is not None}

    doctor_items: List[DoctorRecommendationItem] = []
    for doc in doctors:
        last_visit = visited_doctors.get(doc.id)
        is_visited = last_visit is not None
        hospital = db.query(Hospital).filter(Hospital.id == doc.hospital_id).first() if doc.hospital_id else None

        doctor_items.append(
            DoctorRecommendationItem(
                doctor_id=doc.id,
                name=doc.name,
                specialization=doc.specialization,
                qualification=doc.qualification,
                hospital_name=hospital.name if hospital else None,
                match_score=0.95 if is_visited else 0.85,
                previously_visited=is_visited,
                last_visit_date=last_visit,
            )
        )

    # Pin previously visited doctors to the top
    doctor_items.sort(key=lambda x: (not x.previously_visited, x.name))

    return DoctorRecommendationResponse(
        recommended_specialty=recommended_specialty,
        doctors=doctor_items,
    )


def list_doctors(
    db: Session,
    hospital_id: Optional[uuid.UUID] = None,
    specialty: Optional[str] = None,
    patient_id: Optional[uuid.UUID] = None,
) -> List[DoctorResponse]:
    query = db.query(Doctor)
    if hospital_id:
        query = query.filter(Doctor.hospital_id == hospital_id)
    if specialty:
        query = query.filter(Doctor.specialization.ilike(f"%{specialty}%"))

    doctors = query.all()

    visited_doctors = {}
    if patient_id:
        visits = db.query(VisitHistory.doctor_id, func.max(VisitHistory.visit_date)).filter(VisitHistory.patient_id == patient_id).group_by(VisitHistory.doctor_id).all()
        visited_doctors = {v[0]: v[1] for v in visits if v[0] is not None}

    res: List[DoctorResponse] = []
    for doc in doctors:
        last_visit = visited_doctors.get(doc.id)
        is_visited = last_visit is not None
        res.append(
            DoctorResponse(
                id=doc.id,
                hospital_id=doc.hospital_id,
                name=doc.name,
                specialization=doc.specialization,
                qualification=doc.qualification,
                phone=doc.phone,
                email=doc.email,
                bio=doc.bio,
                previously_visited=is_visited,
                last_visit_date=last_visit,
            )
        )

    # Pin previously visited doctors to top
    res.sort(key=lambda d: (not d.previously_visited, d.name))
    return res


def list_available_slots(db: Session, doctor_id: uuid.UUID, target_date: Optional[datetime] = None) -> SlotListingResponse:
    if not target_date:
        target_date = datetime.now(timezone.utc) + timedelta(days=1)

    # Standard clinic hours: 9:00 AM to 5:00 PM (hourly slots)
    base_slots = []
    start_time = target_date.replace(hour=9, minute=0, second=0, microsecond=0)
    for i in range(8):
        slot_dt = start_time + timedelta(hours=i)
        base_slots.append(slot_dt)

    # Fetch existing appointments for this doctor on target_date
    booked_appointments = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_id == doctor_id,
            Appointment.status != "cancelled",
        )
        .all()
    )

    booked_times = {a.appointment_time for a in booked_appointments}

    available_slot_strs = []
    for slot in base_slots:
        if slot not in booked_times:
            available_slot_strs.append(slot.isoformat())

    return SlotListingResponse(
        doctor_id=doctor_id,
        available_slots=available_slot_strs,
    )


def book_appointment(db: Session, appt_in: AppointmentCreate) -> Appointment:
    # Check if doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == appt_in.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    # PREVENT DOUBLE BOOKING: Check if slot is already booked for this doctor
    existing = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_id == appt_in.doctor_id,
            Appointment.appointment_time == appt_in.appointment_time,
            Appointment.status != "cancelled",
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Double Booking Conflict: Doctor is already booked for this appointment time slot",
        )

    appointment = Appointment(
        patient_id=appt_in.patient_id,
        doctor_id=appt_in.doctor_id,
        hospital_id=appt_in.hospital_id,
        appointment_time=appt_in.appointment_time,
        status="scheduled",
        reason=appt_in.reason,
        notes=appt_in.notes,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment
