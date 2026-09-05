# Medikiosk Backend

Backend architecture and folder structure for **Medikiosk**, an AI-powered digital OPD and patient case-taking platform.

## Backend Structure

```text
backend/
│
├── app/
│   ├── __init__.py
│   ├── main.py
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── auth.py
│   │   ├── rbac.py
│   │   ├── audit.py
│   │   ├── security.py
│   │   └── exceptions.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── patient.py
│   │   ├── session.py
│   │   ├── kiosk_session.py
│   │   ├── consent.py
│   │   ├── doctor.py
│   │   ├── hospital.py
│   │   ├── visit_history.py
│   │   ├── appointment.py
│   │   ├── intake_answer.py
│   │   ├── red_flag.py
│   │   ├── document.py
│   │   ├── summary.py
│   │   ├── prescription.py
│   │   ├── prescription_item.py
│   │   ├── drug.py
│   │   ├── reminder.py
│   │   └── audit_log.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── common.py
│   │   ├── patient.py
│   │   ├── session.py
│   │   ├── consent.py
│   │   ├── doctor.py
│   │   ├── hospital.py
│   │   ├── appointment.py
│   │   ├── intake.py
│   │   ├── safety.py
│   │   ├── voice.py
│   │   ├── document.py
│   │   ├── summary.py
│   │   ├── prescription.py
│   │   ├── reminder.py
│   │   └── fhir.py
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── identity.py
│   │   ├── discovery.py
│   │   ├── hospital.py
│   │   ├── intake.py
│   │   ├── safety.py
│   │   ├── voice.py
│   │   ├── documents.py
│   │   ├── summary.py
│   │   ├── prescription.py
│   │   └── fhir.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   │
│   │   ├── identity/
│   │   │   ├── __init__.py
│   │   │   ├── abha_service.py
│   │   │   ├── patient_service.py
│   │   │   └── consent_service.py
│   │   │
│   │   ├── discovery/
│   │   │   ├── __init__.py
│   │   │   ├── doctor_service.py
│   │   │   ├── hospital_service.py
│   │   │   └── appointment_service.py
│   │   │
│   │   ├── intake/
│   │   │   ├── __init__.py
│   │   │   ├── dialogue_engine.py
│   │   │   ├── question_service.py
│   │   │   ├── intake_service.py
│   │   │   └── llm_service.py
│   │   │
│   │   ├── safety/
│   │   │   ├── __init__.py
│   │   │   ├── red_flag_service.py
│   │   │   └── safety_rules.py
│   │   │
│   │   ├── voice/
│   │   │   ├── __init__.py
│   │   │   ├── asr_service.py
│   │   │   └── tts_service.py
│   │   │
│   │   ├── documents/
│   │   │   ├── __init__.py
│   │   │   ├── ocr_service.py
│   │   │   └── document_service.py
│   │   │
│   │   ├── summary/
│   │   │   ├── __init__.py
│   │   │   └── summary_service.py
│   │   │
│   │   ├── prescription/
│   │   │   ├── __init__.py
│   │   │   ├── prescription_service.py
│   │   │   └── reminder_service.py
│   │   │
│   │   └── fhir/
│   │       ├── __init__.py
│   │       └── fhir_service.py
│   │
│   └── utils/
│       ├── __init__.py
│       ├── encryption.py
│       ├── validators.py
│       └── helpers.py
│
├── alembic/
│   ├── versions/
│   │   └── __init__.py
│   ├── env.py
│   └── script.py.mako
│
├── tests/
│   ├── __init__.py
│   ├── test_health.py
│   ├── test_identity.py
│   ├── test_discovery.py
│   ├── test_intake.py
│   ├── test_safety.py
│   ├── test_voice.py
│   ├── test_documents.py
│   ├── test_summary.py
│   ├── test_prescription.py
│   └── test_fhir.py
│
├── .env
├── .env.example
├── .gitignore
├── requirements.txt
├── alembic.ini
└── README.md
