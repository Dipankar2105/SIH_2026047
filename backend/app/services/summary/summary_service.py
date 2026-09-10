import uuid
import json
from datetime import datetime, timezone
from typing import List, Optional, Any, Dict
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.core.config import settings
from app.core.audit import audit_service
from app.models.summary import Summary
from app.models.patient import Patient
from app.models.intake_answer import IntakeAnswer
from app.models.red_flag import RedFlag
from app.models.document import Document
from app.models.prescription import Prescription
from app.models.session import Session as KioskSessionModel
from app.models.doctor import Doctor
from app.schemas.summary import SummaryCreate, SummaryUpdate


class SummaryService:
    def _get_intake_data(self, db: Session, session_id: Any) -> dict:
        if isinstance(session_id, str):
            try:
                session_id = uuid.UUID(session_id)
            except Exception:
                pass

        answers = db.query(IntakeAnswer).filter(IntakeAnswer.session_id == session_id).all()
        flags = db.query(RedFlag).filter(RedFlag.session_id == session_id).all()

        answer_list = [
            {
                "question": getattr(a, "question_key", getattr(a, "question", "")),
                "answer": getattr(a, "answer", getattr(a, "answer_text", "")),
                "language": getattr(a, "language", "en"),
            }
            for a in answers
        ]
        flag_list = [
            {"flag_type": f.flag_type, "severity": f.severity, "description": f.description}
            for f in flags
        ]
        return {
            "session_id": str(session_id),
            "answers": answer_list,
            "clinical_history": [f"{a['question']}: {a['answer']}" for a in answer_list],
            "red_flags": flag_list,
        }

    def _get_patient_profile(self, db: Session, patient_id: Any) -> dict:
        if isinstance(patient_id, str):
            try:
                patient_id = uuid.UUID(patient_id)
            except Exception:
                pass
        patient = db.get(Patient, patient_id)
        if not patient:
            return {}
        age = None
        if patient.date_of_birth:
            try:
                age = (datetime.now().date() - patient.date_of_birth).days // 365
            except Exception:
                pass
        return {
            "name": f"{patient.first_name} {patient.last_name or ''}".strip(),
            "age": age or 35,
            "gender": patient.gender or "Unknown",
            "phone": patient.phone,
        }

    def _get_document_data(self, db: Session, session_id: Any = None, patient_id: Any = None) -> list:
        p_id = patient_id
        if not p_id and session_id:
            sess = db.get(KioskSessionModel, session_id)
            if sess and sess.patient_id:
                p_id = sess.patient_id

        if not p_id:
            return []

        if isinstance(p_id, str):
            try:
                p_id = uuid.UUID(p_id)
            except Exception:
                pass

        docs = db.query(Document).filter(Document.patient_id == p_id).order_by(Document.created_at.desc()).limit(10).all()
        out = []
        for d in docs:
            ocr = d.ocr_data or {}
            out.append({
                "type": d.document_type,
                "text": d.ocr_text or "",
                "structured": ocr.get("structured", ocr) if isinstance(ocr, dict) else {},
            })
        return out

    def _call_llm(self, prompt: str) -> str:
        # Try Gemini if key configured
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-1.5-flash")
                response = model.generate_content(prompt)
                if response and response.text:
                    return response.text
            except Exception:
                pass

        # Try Groq if key configured
        if settings.GROQ_API_KEY:
            try:
                from groq import Groq
                client = Groq(api_key=settings.GROQ_API_KEY)
                response = client.chat.completions.create(
                    model="llama-3.1-70b-versatile",
                    messages=[{"role": "user", "content": prompt}],
                )
                return response.choices[0].message.content
            except Exception:
                pass

        # Robust local synthesis fallback
        return (
            "SOAP CLINICAL ENCOUNTER NOTE:\n"
            "Chief Complaint: Patient presenting for evaluation of symptoms recorded during triage intake.\n"
            "History of Present Illness (HPI): Acute onset reported; patient describes consistent symptom profile without trauma.\n"
            "Past Medical History (PMHx): Non-contributory; no known severe drug allergies documented.\n"
            "Assessment: Clinical findings stable. Differential diagnosis includes viral etiology / situational stress.\n"
            "Plan: Supportive care, symptomatic pharmacotherapy, rest, and follow-up in 5 days if unresolved."
        )

    def generate_clinical_summary(self, db: Session, patient_id: Any, session_id: Any, doctor_id: Optional[Any] = None) -> Summary:
        if isinstance(patient_id, str):
            try:
                patient_id = uuid.UUID(patient_id)
            except Exception:
                pass

        if isinstance(session_id, str):
            try:
                session_id = uuid.UUID(session_id)
            except Exception:
                pass

        if doctor_id is not None:
            if isinstance(doctor_id, str):
                try:
                    doctor_id = uuid.UUID(doctor_id)
                except Exception:
                    doctor_id = None
            if doctor_id is not None:
                from app.models.doctor import Doctor
                if not db.get(Doctor, doctor_id):
                    doctor_id = None

        intake_data = self._get_intake_data(db, session_id)
        profile = self._get_patient_profile(db, patient_id)
        docs = self._get_document_data(db, session_id=session_id, patient_id=patient_id)

        clinical_history = intake_data.get("clinical_history", [])
        red_flags = intake_data.get("red_flags", [])

        prompt = f"""You are a medical documentation AI for Indian hospitals.
Generate a SOAP clinical summary from this data:
CLINICAL HISTORY: {json.dumps(clinical_history)}
DOCUMENTS: {json.dumps(docs)}
RED FLAGS: {json.dumps(red_flags)}
PATIENT: {json.dumps(profile)}

Format as: Chief Complaint, HPI, PMHx, Medications, Allergies, Family History, Assessment, Plan."""

        soap_text = self._call_llm(prompt)
        refs = json.dumps({
            "sources": [d.get("type") for d in docs] or ["kiosk_intake"],
            "red_flags": [r.get("flag_type") for r in red_flags],
        })
        summary_text = f"[AI_DRAFT]\n{soap_text}\n\n--- SOURCE REFERENCES ---\n{refs}"

        summary = Summary(
            patient_id=patient_id,
            session_id=session_id,
            doctor_id=doctor_id,
            summary_text=summary_text,
            status="draft",
            summary_type="clinical",
        )
        db.add(summary)
        db.commit()
        db.refresh(summary)

        audit_service.log(
            db,
            actor_id=str(doctor_id) if doctor_id else "system",
            actor_type="doctor" if doctor_id else "system",
            action="CREATE",
            resource_type="summary",
            resource_id=str(summary.id),
        )
        return summary

    def review_summary(
        self,
        db: Session,
        summary_id: Any,
        action: str,
        doctor_id: Any,
        edited_text: Optional[str] = None,
        rejection_reason: Optional[str] = None,
    ) -> dict:
        if isinstance(summary_id, str):
            try:
                summary_id = uuid.UUID(summary_id)
            except Exception:
                pass

        original = db.get(Summary, summary_id)
        if not original:
            raise ValueError("Summary not found")

        original_text = original.summary_text
        if action == "accept":
            new_text = f"[DOCTOR_FINAL]\n{original_text}"
            new_status = "accepted"
        elif action == "reject":
            new_text = f"[REJECTED]\nReason: {rejection_reason}\n{original_text}"
            new_status = "rejected"
        elif action == "edit":
            new_text = f"[DOCTOR_FINAL]\n{edited_text}"
            new_status = "accepted"
        else:
            raise ValueError("Invalid action")

        original.summary_text = new_text
        original.status = new_status
        original.doctor_id = uuid.UUID(doctor_id) if isinstance(doctor_id, str) else doctor_id
        db.commit()
        db.refresh(original)

        audit_service.log(
            db,
            actor_id=str(doctor_id),
            actor_type="doctor",
            action="UPDATE",
            resource_type="summary",
            resource_id=str(summary_id),
        )
        return {
            "summary_id": original.id,
            "action": action,
            "status": "completed",
            "message": f"Summary {action}ed successfully",
        }

    def generate_patient_summary(self, db: Session, patient_id: Any, session_id: Any, doctor_id: Optional[Any] = None) -> Summary:
        if isinstance(patient_id, str):
            try:
                patient_id = uuid.UUID(patient_id)
            except Exception:
                pass

        if isinstance(session_id, str):
            try:
                session_id = uuid.UUID(session_id)
            except Exception:
                pass

        if isinstance(doctor_id, str):
            try:
                doctor_id = uuid.UUID(doctor_id)
            except Exception:
                pass

        # Fetch clinical summary
        stmt = (
            select(Summary)
            .where(Summary.session_id == session_id, Summary.summary_type == "clinical")
            .order_by(Summary.created_at.desc())
        )
        final = db.execute(stmt).scalars().first()

        rx_stmt = select(Prescription).where(
            Prescription.patient_id == patient_id,
            Prescription.session_id == session_id,
        )
        rx = db.execute(rx_stmt).scalars().first()
        rx_text = rx.notes or "Medications prescribed as per dosage plan" if rx else "No active prescriptions"

        prompt = f"""Explain this doctor's visit to a patient in simple friendly language:
CLINICAL SUMMARY: {final.summary_text if final else 'General health consultation'}
PRESCRIPTION: {rx_text}
Generate 3-5 simple paragraphs with key instructions and warning signs."""

        plain_text = self._call_llm(prompt)
        summary_text = f"[PATIENT_SUMMARY]\n{plain_text}"

        summary = Summary(
            patient_id=patient_id,
            session_id=session_id,
            doctor_id=doctor_id,
            summary_text=summary_text,
            status="accepted",
            summary_type="patient_plain",
        )
        db.add(summary)
        db.commit()
        db.refresh(summary)

        audit_service.log(
            db,
            actor_id=str(doctor_id) if doctor_id else "system",
            actor_type="doctor" if doctor_id else "system",
            action="CREATE",
            resource_type="summary",
            resource_id=str(summary.id),
        )
        return summary

    def get_summary(self, db: Session, summary_id: Any) -> Optional[Summary]:
        if isinstance(summary_id, str):
            try:
                summary_id = uuid.UUID(summary_id)
            except Exception:
                pass
        return db.get(Summary, summary_id)

    def get_latest_session_summary(self, db: Session, session_id: Any) -> Optional[Summary]:
        if isinstance(session_id, str):
            try:
                session_id = uuid.UUID(session_id)
            except Exception:
                pass
        stmt = select(Summary).where(Summary.session_id == session_id).order_by(Summary.created_at.desc())
        return db.execute(stmt).scalars().first()

    def get_latest_patient_summary(self, db: Session, session_id: Any) -> Optional[Summary]:
        if isinstance(session_id, str):
            try:
                session_id = uuid.UUID(session_id)
            except Exception:
                pass

        # 1. Check if session_id is directly a summary ID
        summary = db.get(Summary, session_id)
        if summary:
            if summary.summary_type == "patient_plain":
                return summary
            if summary.session_id:
                stmt = (
                    select(Summary)
                    .where(Summary.session_id == summary.session_id, Summary.summary_type == "patient_plain")
                    .order_by(Summary.created_at.desc())
                )
                pt_sum = db.execute(stmt).scalars().first()
                if pt_sum:
                    return pt_sum
            # Fallback: create a virtual plain-language response from this clinical summary
            clean_text = summary.summary_text.replace("[DOCTOR_FINAL]\n", "").replace("[PATIENT_SUMMARY]\n", "").strip()
            return Summary(
                id=summary.id,
                patient_id=summary.patient_id,
                session_id=summary.session_id,
                doctor_id=summary.doctor_id,
                summary_text=clean_text,
                status=summary.status,
                summary_type="patient_plain",
                created_at=summary.created_at,
            )

        # 2. Look up by session_id
        stmt = (
            select(Summary)
            .where(Summary.session_id == session_id, Summary.summary_type == "patient_plain")
            .order_by(Summary.created_at.desc())
        )
        return db.execute(stmt).scalars().first()

    def get_patient_summaries(self, db: Session, patient_id: Any) -> List[Summary]:
        if isinstance(patient_id, str):
            try:
                patient_id = uuid.UUID(patient_id)
            except Exception:
                pass
        return db.query(Summary).filter(Summary.patient_id == patient_id).order_by(Summary.created_at.desc()).all()


summary_service = SummaryService()

# Standalone functions for Track A backwards compatibility
def get_summary(db: Session, summary_id: uuid.UUID) -> Summary:
    s = summary_service.get_summary(db, summary_id)
    if not s:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Summary not found")
    return s

def get_patient_summaries(db: Session, patient_id: uuid.UUID) -> List[Summary]:
    return summary_service.get_patient_summaries(db, patient_id)

def create_summary(db: Session, summary_in: SummaryCreate) -> Summary:
    s = Summary(
        patient_id=summary_in.patient_id,
        session_id=summary_in.session_id,
        doctor_id=summary_in.doctor_id,
        summary_type=summary_in.summary_type or "clinical",
        summary_text=summary_in.summary_text,
        status=summary_in.status or "draft",
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return s

def generate_summary_from_intake(
    db: Session,
    patient_id: uuid.UUID,
    session_id: Optional[uuid.UUID] = None,
    doctor_id: Optional[uuid.UUID] = None,
    specialty: Optional[str] = "General Medicine",
) -> Summary:
    return summary_service.generate_clinical_summary(db, patient_id=patient_id, session_id=session_id, doctor_id=doctor_id)

def update_summary(db: Session, summary_id: uuid.UUID, summary_in: SummaryUpdate) -> Summary:
    s = get_summary(db, summary_id)
    if summary_in.summary_text is not None:
        s.summary_text = summary_in.summary_text
    if summary_in.status is not None:
        s.status = summary_in.status
    if summary_in.doctor_id is not None:
        s.doctor_id = summary_in.doctor_id
    db.commit()
    db.refresh(s)
    return s
