👥 Complete Test Users Reference Table
Save this table. You can copy-paste these IDs and tokens anytime you need to test:

1. Patient — Ananya Sharma (Female, 28y)
Field	Value
Role	patient
UUID (patient_id)	93341282-1fdb-4fb2-aa43-529ce35f9c34
Phone	9876543210
ABHA ID	12-3456-7890-1234
Blood Group	O+
Session ID	d8165868-c098-4928-add9-eb2b3004e3c3
Emergency QR Token	-kUiVLMw_Fcp-crnniJtmg
Signed Prescription ID	55844d31-b237-4daa-9bf7-b92d372a8c9f
JWT Bearer Token	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MzM0MTI4Mi0xZmRiLTRmYjItYWE0My01MjljZTM1ZjljMzQiLCJyb2xlIjoicGF0aWVudCIsImlhdCI6MTc4OTA2ODc4MywiZXhwIjoxNzg5MTU1MTgzfQ.uZb8SD9VRh6shuCnfJ_W5owKGKkU3yy0LzaZSm2qwDg
Use for: Document upload, women's health log, emergency profile, trusted circle setup, viewing own prescriptions.

2. General Doctor — Dr. Rajesh Kumar (General Medicine)
Field	Value
Role	doctor
Specialty	General Medicine
UUID (doctor_id)	b667dc29-f27a-40cf-a726-9e145cf355c4
Phone	9111111111
Registration	DMC-102030
JWT Bearer Token	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiNjY3ZGMyOS1mMjdhLTQwY2YtYTcyNi05ZTE0NWNmMzU1YzQiLCJyb2xlIjoiZG9jdG9yIiwic3BlY2lhbHR5IjoiR2VuZXJhbCBNZWRpY2luZSIsImlhdCI6MTc4OTA2ODc4MywiZXhwIjoxNzg5MTU1MTgzfQ.ud97QrmIqeozauzoeTCM5SGSIAcw5QKV2eLGcRa7wow
Use for: Prescriptions, clinical summaries, FHIR bundles. Cannot access Gynae Digest (gets 403).

3. Gynecologist — Dr. Priya Mehta (Gynecology)
Field	Value
Role	doctor
Specialty	Gynecology
UUID (doctor_id)	97eee2bc-2268-4332-a530-b2da7907e04c
Phone	9222222222
Registration	DMC-405060
JWT Bearer Token	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5N2VlZTJiYy0yMjY4LTQzMzItYTUzMC1iMmRhNzkwN2UwNGMiLCJyb2xlIjoiZG9jdG9yIiwic3BlY2lhbHR5IjoiR3luZWNvbG9neSIsImlhdCI6MTc4OTA2ODc4MywiZXhwIjoxNzg5MTU1MTgzfQ.L_Uk2yElr3y7JjFCwnU98y7YC6c5j2sJdQME4VYCePc
Use for: Full Gynae Clinical Digest, women's health timeline, all clinical workflows.

4. Pharmacist — Suresh Pharma
Field	Value
Role	pharmacist
JWT Bearer Token	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiNjY3ZGMyOS1mMjdhLTQwY2YtYTcyNi05ZTE0NWNmMzU1YzQiLCJyb2xlIjoicGhhcm1hY2lzdCIsImlhdCI6MTc4OTA2ODc4MywiZXhwIjoxNzg5MTU1MTgzfQ.a0VPxOWkxPsO9dsWMtaZgffG52fENvLVcAbsTs54Jvw
Use for: GET /prescriptions/{id}/pharmacist read-only dispensing view.

5. Family Relative — Rohan Sharma (Partner)
Field	Value
Role	Relative (no full login)
Phone	9998887770
Relationship	partner
Access Method	Public endpoint with relative_phone query param
Permissions	Pregnancy ✅ · Appointments ✅ · Emergency ✅ · Period History ❌ · Fertility ❌ · Medications ❌
Use for: GET /api/trusted-circle/view/{patient_id}?relative_phone=9998887770

6. Public / Ambulance / 108 First Responder
Field	Value
Role	Public (no login)
Access Method	QR Token only
QR Token	-kUiVLMw_Fcp-crnniJtmg
Endpoint	GET /api/emergency/qr/-kUiVLMw_Fcp-crnniJtmg
Use for: Emergency Golden Hour card scan (zero auth).

