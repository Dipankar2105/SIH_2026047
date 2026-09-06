import uuid
from typing import Optional, Dict, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate

LANGUAGE_PACKS: Dict[str, Dict[str, str]] = {
    "en": {
        "welcome": "Welcome to MediKiosk",
        "select_language": "Please select your preferred language",
        "abha_login": "Login with ABHA Number or Aadhaar",
        "symptoms": "Please describe your health symptoms",
        "doctor_recommendation": "Recommended Doctor Specialties",
        "queue_status": "Your Queue Status",
    },
    "hi": {
        "welcome": "मेडीकियोस्क में आपका स्वागत है",
        "select_language": "कृपया अपनी पसंदीदा भाषा चुनें",
        "abha_login": "आभा नंबर या आधार से लॉगिन करें",
        "symptoms": "कृपया अपने स्वास्थ्य के लक्षणों का वर्णन करें",
        "doctor_recommendation": "अनुशंसित डॉक्टर विशेषज्ञता",
        "queue_status": "आपकी कतार की स्थिति",
    },
    "ta": {
        "welcome": "மெடிகியோஸ்கிற்கு வருக",
        "select_language": "உங்கள் விருப்ப மொழியைத் தேர்ந்தெடுக்கவும்",
        "abha_login": "ABHA எண் அல்லது ஆதாரைக் கொண்டு லாகின் செய்யவும்",
        "symptoms": "உங்கள் சுகாதார அறிகுறிகளை விவரிக்கவும்",
        "doctor_recommendation": "பரிந்துரைக்கப்பட்ட மருத்துவர்கள்",
        "queue_status": "உங்கள் வரிசை நிலை",
    },
    "te": {
        "welcome": "మెడికియోస్క్‌కి స్వాగతం",
        "select_language": "మీ ప్రాధాన్యత భాషను ఎంచుకోండి",
        "abha_login": "ABHA లేదా ఆధార్‌తో లాగిన్ చేయండి",
        "symptoms": "మీ ఆరోగ్య లక్షణాలను వివరించండి",
        "doctor_recommendation": "సిఫార్సు చేసిన వైద్యులు",
        "queue_status": "మీ నావిగేషన్ స్థితి",
    },
}


def register_patient(db: Session, patient_in: PatientCreate) -> Patient:
    # Check if ABHA ID already exists if provided
    if patient_in.abha_id:
        existing = db.query(Patient).filter(Patient.abha_id == patient_in.abha_id).first()
        if existing:
            return existing

    patient = Patient(
        first_name=patient_in.first_name,
        last_name=patient_in.last_name,
        date_of_birth=patient_in.date_of_birth,
        gender=patient_in.gender,
        phone=patient_in.phone,
        email=patient_in.email,
        address=patient_in.address,
        emergency_contact_name=patient_in.emergency_contact_name,
        emergency_contact_phone=patient_in.emergency_contact_phone,
        preferred_language=patient_in.preferred_language or "en",
        abha_id=patient_in.abha_id,
        abha_address=patient_in.abha_address,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def get_patient(db: Session, patient_id: uuid.UUID) -> Patient:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{patient_id}' not found",
        )
    return patient


def update_patient(db: Session, patient_id: uuid.UUID, patient_in: PatientUpdate) -> Patient:
    patient = get_patient(db, patient_id)
    update_data = patient_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    return patient


def update_preferred_language(db: Session, patient_id: uuid.UUID, language_code: str) -> Patient:
    patient = get_patient(db, patient_id)
    patient.preferred_language = language_code
    db.commit()
    db.refresh(patient)
    return patient


def get_language_pack(language_code: str) -> Dict[str, str]:
    return LANGUAGE_PACKS.get(language_code.lower(), LANGUAGE_PACKS["en"])


def get_supported_languages() -> List[Dict[str, str]]:
    return [
        {"code": "en", "name": "English"},
        {"code": "hi", "name": "Hindi (हिंदी)"},
        {"code": "ta", "name": "Tamil (தமிழ்)"},
        {"code": "te", "name": "Telugu (తెలుగు)"},
        {"code": "kn", "name": "Kannada (கன்னட)"},
        {"code": "mr", "name": "Marathi (मराठी)"},
        {"code": "bn", "name": "Bengali (বাংলা)"},
    ]
