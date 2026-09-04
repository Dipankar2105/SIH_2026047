# Medikiosk 🩺⚡

**Medikiosk** is an AI-powered smart medical intake kiosk, triage system, and clinical platform built for ABDM compliance and real-time healthcare workflows.

---

## 🏗 Project Architecture

```
Medikiosk/
├── backend/
│   ├── app/
│   │   ├── core/           # Security, Auth, RBAC, DB Config & Encryption
│   │   ├── models/         # SQLAlchemy ORM Models
│   │   ├── schemas/        # Pydantic Schemas (including voice.py & fhir.py)
│   │   ├── routers/        # FastAPI Endpoint Handlers
│   │   ├── services/       # Domain Logic (ABHA, Voice, OCR, Safety, FHIR)
│   │   └── utils/          # Helpers & Encryption Utilities
│   ├── alembic/            # Database Migrations
│   └── tests/              # 10-Module Test Suite
└── frontend/               # Vite + React Kiosk Interface
```

---

## 🚀 Quick Start (Backend)

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```
Open interactive API docs at `http://localhost:8000/docs`
