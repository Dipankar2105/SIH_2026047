# AarogyaFlow Android API Contract

This document outlines the VERIFIED backend API endpoints that the Android application must use.

**Base URL Strategy**:
- Emulator: `http://10.0.2.2:8000/api`
- Physical Device: LAN IP (e.g., `http://192.168.x.x:8000/api`)

**Authentication Scheme**:
- JWT Bearer Token (`Authorization: Bearer <token>`)

---

## 1. Identity & Authentication

### Request Mobile OTP
- **Feature**: Patient Login/Registration
- **Method**: `POST`
- **Endpoint**: `/api/identity/mobile/request-otp`
- **Auth**: None
- **Request Body**: `{"mobile": "string"}`
- **Response**: `{"txnId": "string", "message": "string"}`

### Verify Mobile OTP
- **Feature**: Patient Login/Registration
- **Method**: `POST`
- **Endpoint**: `/api/identity/mobile/verify-otp`
- **Auth**: None
- **Request Body**: `{"txn_id": "string", "otp": "string", "patient_id": "optional-uuid"}`
- **Response**: `{"status": "string", "token": "string", "patient": {...}}`

---

## 2. Family Members (Dependents)

### Add Dependent
- **Feature**: Link Family Member
- **Method**: `POST`
- **Endpoint**: `/api/identity/patient/dependents`
- **Auth**: Bearer
- **Request Body**: `{"dependent_patient_id": "uuid", "relationship": "string"}`
- **Response**: `{"id": "uuid", "primary_patient_id": "uuid", "dependent_patient_id": "uuid", "relationship": "string"}`

### List Dependents
- **Feature**: Manage Family
- **Method**: `GET`
- **Endpoint**: `/api/identity/patient/dependents`
- **Auth**: Bearer
- **Response**: List of dependent objects.

---

## 3. Clinical Intake & AI Chat

### Get Intake Questions
- **Feature**: Triage Intake
- **Method**: `GET`
- **Endpoint**: `/api/intake/questions?language={lang}`
- **Auth**: None
- **Response**: `{"language": "string", "questions": [...]}`

### Send Intake Message
- **Feature**: Triage Chatbot
- **Method**: `POST`
- **Endpoint**: `/api/intake/message`
- **Auth**: None
- **Request Body**: `{"message": "string", "step": "integer"}`
- **Response**: `{"reply": "string", "is_urgent": "boolean", "next_step": "integer", ...}`

---

## 4. Hospital & Queuing

### Add to Queue
- **Feature**: Kiosk Check-in
- **Method**: `POST`
- **Endpoint**: `/api/hospital/queue/add`
- **Auth**: Bearer
- **Request Body**: `{"hospital_id": "uuid", "patient_id": "uuid", "doctor_id": "uuid"}`
- **Response**: Queue status.

### Live Queue (WebSocket)
- **Feature**: Wait time tracking
- **Route**: `ws://<base_url>/hospital/{hospital_id}/queue/ws`
- **Auth**: None (connection level)
- **Response**: Push notifications on queue status changes.

---

## 5. Documents & Health Records

### Fetch Patient Documents
- **Feature**: Health Locker
- **Method**: `GET`
- **Endpoint**: `/api/documents/patient/{patient_id}`
- **Auth**: Bearer
- **Response**: List of document records.

### Upload Document
- **Feature**: Add Medical Record
- **Method**: `POST`
- **Endpoint**: `/api/documents/upload`
- **Auth**: Bearer
- **Request Body**: `{"patient_id": "uuid", "title": "string", "document_type": "string", "file_name": "string"}`
- **Response**: `{"id": "uuid", "status": "string"}`

---

## 6. Emergency & Safety

### Golden Health QR Token
- **Feature**: Emergency Access
- **Method**: `GET`
- **Endpoint**: `/api/emergency/qr`
- **Auth**: Bearer
- **Response**: `{"emergency_token": "string", "qr_url": "string"}`

### Retrieve Emergency Record
- **Feature**: First Responder QR Scan
- **Method**: `GET`
- **Endpoint**: `/api/emergency/record/{token}`
- **Auth**: None (Token contains scopes)
- **Response**: Critical red flags, active medications, basic demographics.
