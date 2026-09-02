# AarogyaFlow
 
**AI-powered patient case-taking software for Indian OPDs — built for SIH 2026, Problem Statement 26047 (AIIA, Ministry of AYUSH).**
 
AarogyaFlow lets a patient complete a structured, AI-guided clinical history (voice + touch, in their own language) and digitize prior medical documents **before** they see the doctor — cutting India's 2–5 minute OPD consult bottleneck and generating an ABDM/FHIR-ready record automatically.
 
---
 
## 📋 Problem Statement
 
- **PS ID:** 26047
- **Title:** Patient Case-Taking Software
- **Organization:** All India Institute of Ayurveda (AIIA), Ministry of AYUSH
- **Category:** Software · Theme: Medtech / Biotech / Healthtech
## ✨ Core Features
 
- 🆔 ABHA-linked patient identity + consent management
- 🗣️ Multilingual voice (ASR/TTS) + touch history-taking, with automatic voice→touch fallback
- 🩺 Adaptive AI questioning — separate flows for Allopathic and AYUSH (Dashavidha Pariksha) case-taking
- 🚩 Real-time red-flag / emergency detection with instant staff alert
- 📄 Document scanning + OCR (printed & handwritten), always human-verified before saving
- 🧾 AI-generated, doctor-editable structured clinical summary with full source traceability
- 💊 In-app prescription builder (medicine autocomplete, dose/timing/food-relation) + medication reminders
- 🏥 Doctor Console, Hospital Admin Dashboard, and a dedicated low-literacy Kiosk mode
- 🔐 RBAC, audit trail, and FHIR R4-compliant records via ABDM Sandbox integration
Full feature list, module ownership, and API contracts: see [`/docs`](./docs).
 
## 🏗️ Architecture
 
Modular monolith for the hackathon build — one FastAPI backend, cleanly split into per-module routers, so multiple engineers can work in parallel without microservice overhead. Supabase provides the managed Postgres database, auth session store, file storage, and realtime updates, so the team isn't self-hosting infra during the hackathon. See [`docs/AarogyaFlow_Backend_Engineering_Plan.docx`](./docs) for the full system design and database schema.
 
```
Patient App / Kiosk (Next.js + TS)   Doctor Console / Admin Dashboard (Next.js + TS)
              │                                  │
              └───────────────┬──────────────────┘
                               │  REST + Realtime
                        FastAPI Backend
        ┌─────────────┬───────┴───────┬─────────────┐
   Identity/Consent   Intake/Safety   Documents/Summary/
   /Discovery (A)      (B)            Prescription (C)
                               │
        Supabase (Postgres · Auth · Storage · Realtime) · HAPI FHIR
                               │
                    ABDM Sandbox (ABHA, Consent Manager)
```
 
## 🛠️ Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | Next.js + TypeScript |
| Backend | FastAPI (Python) |
| Database | Supabase (managed Postgres) |
| Auth / Sessions | Supabase Auth (JWT) + a `kiosk_sessions` table with `expires_at` for guest kiosk sessions (no Redis needed) |
| File / Document Storage | Supabase Storage (replaces self-hosted object storage) |
| Realtime (queue updates) | Supabase Realtime (Postgres change subscriptions) |
| Clinical Records | HAPI FHIR (FHIR R4) — still a separate service, Supabase doesn't cover this |
| ASR / TTS | Bhashini / AI4Bharat |
| OCR | Tesseract / PaddleOCR + Vision-LLM (handwritten) |
| LLM | Claude / GPT-4 class API |
| Identity (govt health ID) | ABDM Sandbox |
 
**Note on data access pattern:** all clinical/business logic goes through FastAPI (never Next.js talking to Supabase directly for patient data) — this keeps consent checks, red-flag rules, and audit logging centralized in one place. Next.js may use the Supabase client directly only for non-sensitive conveniences (e.g. uploading a raw file to Storage before the backend processes it). Enable **Row Level Security (RLS)** on every table regardless, and give the FastAPI backend a `service_role` key so it can bypass RLS as the trusted server — this is the standard safe pattern for a Supabase + custom-backend setup.
 
## 📁 Project Structure
 
```
aarogyaflow/
├── backend/
│   ├── app/
│   │   ├── routers/        # identity, discovery, hospital, intake, safety, voice,
│   │   │                    documents, summary, prescription, fhir
│   │   ├── core/            # auth (Supabase JWT verify), rbac, audit, config
│   │   ├── models/          # SQLAlchemy models (pointed at Supabase Postgres)
│   │   ├── services/        # LLM, ASR/TTS, OCR, ABDM sandbox, Supabase clients
│   │   └── main.py
│   ├── alembic/              # DB migrations
│   ├── tests/
│   └── docker-compose.yml    # api + HAPI FHIR only (DB/Storage are hosted on Supabase)
├── frontend/
│   ├── app/                  # Next.js — Patient App + Kiosk mode (shared codebase)
│   │   ├── app/               # App Router pages
│   │   ├── components/
│   │   └── lib/                # supabase client, api client
│   └── console/               # Next.js — Doctor Console + Hospital Admin Dashboard
├── docs/
│   ├── AarogyaFlow_PRD_TRD.docx
│   ├── AarogyaFlow_Backend_Engineering_Plan.docx
│   └── SIH26047_Problem_Statement.pdf
└── README.md
```
 
## 🚀 Getting Started
 
### Prerequisites
- Node.js 18+ (Next.js frontend)
- Python 3.11+ (FastAPI backend)
- A [Supabase](https://supabase.com) project (free tier is enough for the hackathon) — one shared project for the whole team
- Docker (only needed for the local HAPI FHIR server)
### Backend
```bash
cd backend
cp .env.example .env
# fill in: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ABDM sandbox keys, LLM API key
pip install -r requirements.txt
alembic upgrade head          # runs migrations against the Supabase Postgres DB
docker compose up -d          # starts the local HAPI FHIR server only
uvicorn app.main:app --reload
```
 
### Frontend
```bash
cd frontend/app
npm install
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, API base URL
npm run dev
```
 
API docs available at `http://localhost:8000/docs` once the backend is running.
 
## 👥 Team & Ownership
 
| Track | Owner | Scope |
|---|---|---|
| Backend — Identity, Discovery & Hospital Ops | @github-handle | Auth, consent, doctor discovery, booking, queue |
| Backend — Conversational AI Intake & Safety | @github-handle | Intake engine, ASR/TTS, red-flag detection |
| Backend — Documents, Summary & Prescription | @github-handle | OCR, summary generation, FHIR, prescription builder |
| Frontend — Patient App & Kiosk | @github-handle | Patient-facing app + kiosk mode |
| Frontend — Doctor Console & Admin | @github-handle | Doctor + hospital admin interfaces |
| Presentation & Docs | @github-handle | PPT, demo video, documentation |
 
## 🌿 Branching & Workflow
 
- `main` — always demo-ready
- `dev` — integration branch
- `feature/<track>-<short-name>` — e.g. `feature/backend-intake-engine`, `feature/frontend-kiosk-ui`
- Open a PR into `dev`; merge into `main` only after the Day-2 integration checkpoint passes
## 📄 License
 
Built for Smart India Hackathon 2026. License TBD by team/institution policy.
