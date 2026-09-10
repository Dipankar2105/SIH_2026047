import uuid
from datetime import datetime, timezone, timedelta
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.core.database import get_db, SessionLocal
from app.core.security import create_access_token
from app.models.hospital import Hospital
from app.models.doctor import Doctor
from app.models.visit_history import VisitHistory
from app.models.prescription import Prescription

client = TestClient(app)


@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="module")
def test_hospital_and_doctor(db_session: Session):
    hospital = Hospital(
        name="MediKiosk General Hospital",
        address="123 Health Ave",
        city="Bengaluru",
        state="Karnataka",
        pincode="560001",
        phone="080-12345678",
        email="info@medikiosk.org",
    )
    db_session.add(hospital)
    db_session.commit()
    db_session.refresh(hospital)

    doctor = Doctor(
        hospital_id=hospital.id,
        name="Dr. Ananya Sharma",
        specialization="Cardiology",
        qualification="MD, DM Cardiology",
        phone="9876543210",
        email="ananya.sharma@medikiosk.org",
    )
    db_session.add(doctor)
    db_session.commit()
    db_session.refresh(doctor)

    return hospital, doctor


def test_track_a_end_to_end_flow(db_session: Session, test_hospital_and_doctor):
    hospital, doctor = test_hospital_and_doctor

    # 1. Register patient locally
    reg_payload = {
        "first_name": "Rajesh",
        "last_name": "Kumar",
        "date_of_birth": "1990-05-15",
        "gender": "male",
        "phone": "9998887770",
        "email": "rajesh.kumar@example.com",
        "address": "45 MG Road, Bengaluru",
        "preferred_language": "hi",
    }
    resp = client.post("/identity/patient/register", json=reg_payload)
    assert resp.status_code == 200, resp.text
    patient_data = resp.json()
    patient_id = patient_data["id"]
    assert patient_data["first_name"] == "Rajesh"
    assert patient_data["preferred_language"] == "hi"

    patient_role = "patient"
    patient_token = create_access_token({"sub": patient_id, "role": patient_role})
    other_patient_token = create_access_token({"sub": str(uuid.uuid4()), "role": "patient"})
    doctor_token = create_access_token({"sub": str(doctor.id), "role": "doctor"})
    admin_token = create_access_token({"sub": "admin-1", "role": "hospital_admin"})

    patient_headers = {"Authorization": f"Bearer {patient_token}"}
    other_patient_headers = {"Authorization": f"Bearer {other_patient_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Set preferred language
    lang_resp = client.post(f"/identity/patient/{patient_id}/language", json={"preferred_language": "ta"}, headers=patient_headers)
    assert lang_resp.status_code == 200
    assert lang_resp.json()["preferred_language"] == "ta"

    # Supported language & language pack endpoints
    assert client.get("/identity/languages").status_code == 200
    assert client.get("/identity/languages/hi").status_code == 200

    # 3. Create kiosk session
    kiosk_payload = {
        "kiosk_id": "KIOSK-BLR-01",
        "session_duration_minutes": 15,
        "temp_state": {"step": "intake_started", "vitals_captured": True},
    }
    ks_resp = client.post("/identity/kiosk/session/start", json=kiosk_payload)
    assert ks_resp.status_code == 200
    kiosk_session_id = ks_resp.json()["id"]

    # 4. Authenticate & validate kiosk session
    val_resp = client.get(f"/identity/kiosk/session/validate/{kiosk_session_id}")
    assert val_resp.status_code == 200
    assert val_resp.json()["status"] == "active"

    # 5. Update patient profile
    up_resp = client.put(f"/identity/patient/{patient_id}", json={"address": "100 Indiranagar, Bengaluru"}, headers=patient_headers)
    assert up_resp.status_code == 200
    assert up_resp.json()["address"] == "100 Indiranagar, Bengaluru"

    # 6. Create consent
    consent_payload = {
        "patient_id": patient_id,
        "consent_type": "health_record_sharing",
        "purpose": "Kiosk Consultation",
        "expires_in_hours": 24,
    }
    c_resp = client.post("/identity/consent/grant", json=consent_payload, headers=patient_headers)
    assert c_resp.status_code == 200
    consent_id = c_resp.json()["id"]

    # 7. Verify consent status
    cs_resp = client.get(f"/identity/consent/status/{patient_id}", headers=patient_headers)
    assert cs_resp.status_code == 200
    assert cs_resp.json()["is_valid"] is True

    # 8. Create a test document
    doc_payload = {
        "patient_id": patient_id,
        "document_type": "lab_report",
        "file_name": "blood_test_results.pdf",
        "storage_path": "/storage/docs/blood_test.pdf",
        "mime_type": "application/pdf",
        "ocr_text": "Hemoglobin: 14.5 g/dL Normal",
    }
    doc_resp = client.post("/documents/upload", json=doc_payload, headers=patient_headers)
    assert doc_resp.status_code == 200

    # 9, 10, 11. Add visit history & prescription in DB
    visit = VisitHistory(
        patient_id=uuid.UUID(patient_id),
        doctor_id=doctor.id,
        hospital_id=hospital.id,
        visit_date=datetime.now(timezone.utc).date(),
        diagnosis="Chest discomfort & fatigue",
        treatment="Rest & ECG prescribed",
        notes="Patient advised follow-up in 1 week",
    )
    db_session.add(visit)

    prescription = Prescription(
        patient_id=uuid.UUID(patient_id),
        doctor_id=doctor.id,
        status="active",
        notes="Take 1 tablet daily after food",
    )
    db_session.add(prescription)
    db_session.commit()

    # 12. Generate longitudinal timeline
    tl_resp = client.get(f"/documents/timeline/{patient_id}", headers=patient_headers)
    assert tl_resp.status_code == 200
    timeline = tl_resp.json()
    assert timeline["total_events"] >= 3

    # 13. Retrieve unified patient record
    un_resp = client.get(f"/documents/unified/{patient_id}", headers=patient_headers)
    assert un_resp.status_code == 200
    record = un_resp.json()
    assert record["profile"]["id"] == patient_id
    assert len(record["documents"]) >= 1

    # 14. Get doctor recommendations for symptoms
    rec_resp = client.post("/discovery/recommend-doctor", json={"symptoms": "chest pain and tightness", "patient_id": patient_id})
    assert rec_resp.status_code == 200
    rec_data = rec_resp.json()
    assert rec_data["recommended_specialty"] == "Cardiology"
    assert len(rec_data["doctors"]) >= 1

    # 15 & 16. List doctors & verify previously visited doctor is pinned to top
    doc_list_resp = client.get(f"/discovery/doctors?patient_id={patient_id}")
    assert doc_list_resp.status_code == 200
    doctors_list = doc_list_resp.json()
    top_doc = doctors_list[0]
    assert top_doc["previously_visited"] is True

    # 17. List appointment slots
    slots_resp = client.get(f"/discovery/slots/{doctor.id}")
    assert slots_resp.status_code == 200
    slots = slots_resp.json()["available_slots"]
    assert len(slots) >= 1

    # 18. Book appointment
    appt_time = slots[0]
    book_payload = {
        "patient_id": patient_id,
        "doctor_id": str(doctor.id),
        "hospital_id": str(hospital.id),
        "appointment_time": appt_time,
        "reason": "Cardiology Consultation",
    }
    book_resp = client.post("/discovery/book-appointment", json=book_payload, headers=patient_headers)
    assert book_resp.status_code == 200

    # 19. Verify slot cannot be double-booked
    db_book_resp = client.post("/discovery/book-appointment", json=book_payload, headers=patient_headers)
    assert db_book_resp.status_code == 400
    assert "Double Booking Conflict" in db_book_resp.json()["detail"]

    # 20. Put patient into hospital queue
    q_payload = {
        "patient_id": patient_id,
        "doctor_id": str(doctor.id),
        "hospital_id": str(hospital.id),
        "reason": "Kiosk Arrival Check-in",
    }
    q_resp = client.post("/hospital/queue/add", json=q_payload, headers=patient_headers)
    assert q_resp.status_code == 200
    queue_item = q_resp.json()

    # 21. Verify queue position
    live_q_resp = client.get(f"/hospital/queue/live/{hospital.id}")
    assert live_q_resp.status_code == 200
    live_q = live_q_resp.json()
    assert len(live_q) >= 1

    # 22. Update queue status
    up_q_resp = client.put(f"/hospital/queue/update/{queue_item['appointment_id']}", json={"status": "in_consultation"}, headers=admin_headers)
    assert up_q_resp.status_code == 200
    assert up_q_resp.json()["status"] == "in_consultation"

    # 23. Verify hospital dashboard aggregation
    dash_resp = client.get(f"/hospital/dashboard/{hospital.id}", headers=admin_headers)
    assert dash_resp.status_code == 200
    dashboard = dash_resp.json()
    assert dashboard["hospital_id"] == str(hospital.id)
    assert "fleet_status" in dashboard
    assert "queue_stats" in dashboard

    # 24. Revoke consent
    rev_resp = client.post(f"/identity/consent/revoke?patient_id={patient_id}", headers=patient_headers)
    assert rev_resp.status_code == 200

    # 25. Verify protected data access is blocked when consent is revoked
    blocked_resp = client.get(f"/documents/timeline/{patient_id}", headers=patient_headers)
    assert blocked_resp.status_code == 403
    assert "Patient consent is revoked" in blocked_resp.json()["detail"]

    # 26 & 28. End kiosk session & verify sensitive temporary state is cleared
    end_ks_resp = client.post(f"/identity/kiosk/session/end/{kiosk_session_id}")
    assert end_ks_resp.status_code == 200
    assert end_ks_resp.json()["temp_state_cleared"] is True

    # 27. Verify ended session cannot be reused / validated
    reval_resp = client.get(f"/identity/kiosk/session/validate/{kiosk_session_id}")
    assert reval_resp.status_code == 401

    # 30. Verify horizontal privilege escalation & unauthorized role access is blocked
    hpe_resp = client.get(f"/identity/patient/{patient_id}", headers=other_patient_headers)
    assert hpe_resp.status_code == 403

    unauth_dash = client.get(f"/hospital/dashboard/{hospital.id}", headers=patient_headers)
    assert unauth_dash.status_code == 403

    # 31. Expired kiosk session
    expired_kiosk_payload = {
        "kiosk_id": "KIOSK-BLR-02",
        "session_duration_minutes": -1,  # Set to negative so it expires immediately
        "temp_state": {"sensitive_data": "secret_state"},
    }
    exp_ks_resp = client.post("/identity/kiosk/session/start", json=expired_kiosk_payload)
    assert exp_ks_resp.status_code == 200
    expired_kiosk_session_id = exp_ks_resp.json()["id"]

    # Validate it, which should trigger the auto-expiry logic
    exp_val_resp = client.get(f"/identity/kiosk/session/validate/{expired_kiosk_session_id}")
    assert exp_val_resp.status_code == 401
    assert "has expired" in exp_val_resp.json()["detail"]

    # Verify temp_state is wiped from DB
    from app.models.kiosk_session import KioskSession
    expired_session_db = db_session.query(KioskSession).filter(KioskSession.id == expired_kiosk_session_id).first()
    assert expired_session_db.status == "expired"
    assert expired_session_db.temp_state is None

    # 32. WebSocket Integration Test
    with client.websocket_connect(f"/hospital/{hospital.id}/queue/ws") as websocket:
        # Trigger a queue update via REST
        ws_q_payload = {
            "patient_id": patient_id,
            "doctor_id": str(doctor.id),
            "hospital_id": str(hospital.id),
            "reason": "WS Test Check-in",
        }
        # Add to queue
        ws_q_resp = client.post("/hospital/queue/add", json=ws_q_payload, headers=patient_headers)
        assert ws_q_resp.status_code == 200
        ws_queue_item = ws_q_resp.json()
        
        # Check websocket received the add event
        data = websocket.receive_json()
        assert data["event"] == "queue_updated"
        assert data["appointment_id"] == ws_queue_item["appointment_id"]
        assert data["status"] == "waiting"

        # Update queue
        ws_up_resp = client.put(f"/hospital/queue/update/{ws_queue_item['appointment_id']}", json={"status": "in_consultation"}, headers=admin_headers)
        assert ws_up_resp.status_code == 200
        
        # Check websocket received the update event
        data2 = websocket.receive_json()
        assert data2["event"] == "status_changed"
        assert data2["appointment_id"] == ws_queue_item["appointment_id"]
        assert data2["status"] == "in_consultation"
