import json
import httpx
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.core.config import settings
from app.models.summary import Summary
from app.models.session import Session as KioskSessionModel
from app.core.audit import audit_service


class SummaryService:
    def _get_intake_data(self, db: Session, session_id: str) -> dict:
        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.get(
                    f"http://127.0.0.1:8000/api/v1/intake/track-c-summary/{session_id}"
                )
                if response.status_code == 200:
                    return response.json()
                return {}
        except Exception:
            return {}

    def _get_patient_profile(self, db: Session, patient_id: str) -> dict:
        from app.models.patient import Patient
        patient = db.get(Patient, patient_id)
        if not patient:
            return {}
        age = None
        if patient.date_of_birth:
            age = (datetime.now().date() - patient.date_of_birth).days // 365
        return {
            "name": f"{patient.first_name} {patient.last_name or ''}",
            "age": age,
            "gender": patient.gender,
            "phone": patient.phone,
        }

    def _get_document_data(self, db: Session, session_id: str) -> list:
        from app.models.document import Document
        stmt = select(Document).where(Document.session_id == session_id)
        docs = db.execute(stmt).scalars().all()
        out = []
        for d in docs:
            ocr = d.ocr_data or {}
            out.append({
                "type": d.document_type,
                "text": d.ocr_text or "",
                "structured": ocr.get("structured", ocr),
            })
        return out

    def _call_llm(self, prompt: str) -> str:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            return response.text
        except Exception:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            response = client.chat.completions.create(
                model="llama-3.1-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
            )
            return response.choices[0].message.content

    def _check_session_completed(self, db: Session, session_id: str) -> bool:
        session = db.get(KioskSessionModel, session_id)
        if session and session.status == "completed":
            return True
        return False

    def generate_clinical_summary(self, db: Session, patient_id: str, session_id: str, doctor_id: str) -> Summary:
        if not self._check_session_completed(db, session_id):
            raise ValueError("Session must be completed before generating summary")

        intake_data = self._get_intake_data(db, session_id)
        profile = self._get_patient_profile(db, patient_id)
        docs = self._get_document_data(db, session_id)

        clinical_history = intake_data.get("clinical_history", json.dumps(intake_data))
        red_flags = intake_data.get("red_flags", [])

        prompt = f"""You are a medical documentation AI for Indian hospitals.
Generate a SOAP clinical summary from this data:
CLINICAL HISTORY: {json.dumps(clinical_history)}
DOCUMENTS: {json.dumps(docs)}
RED FLAGS: {json.dumps(red_flags)}
PATIENT: {json.dumps(profile)}

Format as: Chief Complaint, HPI, PMHx, Medications, Allergies,
Family History, Assessment, Plan.
Include source references at the end."""

        soap_text = self._call_llm(prompt)
        refs = json.dumps({
            "sources": [d.get("type") for d in docs],
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
            db, actor_id=str(doctor_id), actor_type="doctor",
            action="CREATE", resource_type="summary", resource_id=str(summary.id)
        )
        return summary

    def review_summary(self, db: Session, summary_id: str, action: str, doctor_id: str,
                       edited_text: str = None, rejection_reason: str = None) -> dict:
        original = db.get(Summary, summary_id)
        if not original:
            raise ValueError("Summary not found")

        original_text = original.summary_text
        if action == "accept":
            new_text = f"[DOCTOR_FINAL]\n{original_text}"
            status = "accepted"
        elif action == "reject":
            new_text = f"[REJECTED]\nReason: {rejection_reason}\n{original_text}"
            status = "rejected"
        elif action == "edit":
            new_text = f"[DOCTOR_FINAL]\n{edited_text}"
            status = "accepted"
        else:
            raise ValueError("Invalid action")

        new_summary = Summary(
            patient_id=original.patient_id,
            session_id=original.session_id,
            doctor_id=doctor_id,
            summary_text=new_text,
            status=status,
            summary_type="clinical",
        )
        db.add(new_summary)
        db.commit()
        db.refresh(new_summary)
        audit_service.log(
            db, actor_id=str(doctor_id), actor_type="doctor",
            action="UPDATE", resource_type="summary", resource_id=str(summary_id)
        )
        return {
            "summary_id": str(new_summary.id),
            "action": action,
            "status": "completed",
            "message": f"Summary {action}ed successfully",
        }

    def generate_patient_summary(self, db: Session, patient_id: str, session_id: str, doctor_id: str) -> Summary:
        stmt = select(Summary).where(
            Summary.session_id == session_id,
            Summary.status == "accepted",
            Summary.summary_type == "clinical",
        ).order_by(Summary.created_at.desc())
        final = db.execute(stmt).scalar_one_or_none()

        rx_text = "No active prescriptions"
        if final:
            from app.models.prescription import Prescription
            rx_stmt = select(Prescription).where(
                Prescription.patient_id == patient_id,
                Prescription.session_id == session_id,
                Prescription.status == "signed",
            )
            rx = db.execute(rx_stmt).scalar_one_or_none()
            if rx:
                rx_text = rx.notes or "Medications prescribed"

        prompt = f"""Explain this doctor's visit to a patient in simple friendly language.
CLINICAL SUMMARY: {final.summary_text if final else 'N/A'}
PRESCRIPTION: {rx_text}
Generate: 3-5 paragraph summary, key points, medication instructions in simple terms, warning signs, follow-up info."""

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
            db, actor_id=str(doctor_id), actor_type="doctor",
            action="CREATE", resource_type="summary", resource_id=str(summary.id)
        )
        return summary

    def get_summary(self, db: Session, summary_id: str):
        return db.get(Summary, summary_id)

    def get_latest_session_summary(self, db: Session, session_id: str):
        stmt = select(Summary).where(Summary.session_id == session_id).order_by(Summary.created_at.desc())
        return db.execute(stmt).scalar_one_or_none()

    def get_latest_patient_summary(self, db: Session, session_id: str):
        stmt = select(Summary).where(
            Summary.session_id == session_id,
            Summary.summary_type == "patient_plain",
        ).order_by(Summary.created_at.desc())
        return db.execute(stmt).scalar_one_or_none()


summary_service = SummaryService()
