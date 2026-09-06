"""
seed.py

WARNING: This script populates the database with purely synthetic, fictional demo data.
This includes generated hospitals, doctors, patients, visit history, appointments, drugs, and prescriptions.
The patients created here (e.g. "Demo Patient - ...") are NOT real citizens and should NOT be confused
with the real ABDM-verified test patients. This is strictly for demonstration and hackathon purposes.
"""

import sys
import os
import random
import uuid
from datetime import datetime, timedelta
from typing import List

# Ensure the backend directory is in the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.hospital import Hospital
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.visit_history import VisitHistory
from app.models.appointment import Appointment
from app.models.drug import Drug
from app.models.prescription import Prescription
from app.models.prescription_item import PrescriptionItem

def seed_hospitals(db) -> List[Hospital]:
    hospital_data = [
        {
            "name": "Sanjeevani Care Hospital",
            "city": "Bengaluru",
            "state": "Karnataka",
            "address": "45 MG Road, Indiranagar",
            "pincode": "560038",
            "phone": "080-45678901",
            "email": "contact@sanjeevani.demo",
        },
        {
            "name": "Aarogya Multi-Specialty Center",
            "city": "Pune",
            "state": "Maharashtra",
            "address": "12 FC Road, Deccan Gymkhana",
            "pincode": "411004",
            "phone": "020-25531234",
            "email": "info@aarogya.demo",
        },
        {
            "name": "Lifeline General Hospital",
            "city": "Hyderabad",
            "state": "Telangana",
            "address": "88 Jubilee Hills, Road No 36",
            "pincode": "500033",
            "phone": "040-66778899",
            "email": "helpdesk@lifeline.demo",
        }
    ]

    seeded_hospitals = []
    for data in hospital_data:
        hospital = db.query(Hospital).filter_by(name=data["name"]).first()
        if not hospital:
            hospital = Hospital(**data)
            db.add(hospital)
            db.commit()
            db.refresh(hospital)
        seeded_hospitals.append(hospital)
    return seeded_hospitals

def seed_doctors(db, hospitals: List[Hospital]) -> List[Doctor]:
    doctor_data = [
        {"name": "Dr. Ramesh Nair", "specialization": "General Medicine", "qualification": "MBBS, MD", "bio": "Over 15 years of experience in internal medicine. Highly rated by patients."},
        {"name": "Dr. Ananya Sharma", "specialization": "Cardiology", "qualification": "MBBS, MD, DM", "bio": "Specialist in interventional cardiology with a patient satisfaction score of 4.9/5."},
        {"name": "Vaidya Suresh Patil", "specialization": "Ayurveda (Vaidya)", "qualification": "BAMS, MD (Ayu)", "bio": "Expert in Nadi Pariksha and chronic disease management through Ayurveda."},
        {"name": "Dr. Meera Iyer", "specialization": "Pediatrics", "qualification": "MBBS, MD (Pediatrics)", "bio": "Compassionate pediatrician. Rating: 4.8/5."},
        {"name": "Dr. Karan Singh", "specialization": "Orthopedics", "qualification": "MBBS, MS", "bio": "Sports injury specialist and joint replacement surgeon."},
        {"name": "Dr. Neha Gupta", "specialization": "ENT", "qualification": "MBBS, MS (ENT)", "bio": "Experienced otolaryngologist treating ear, nose, and throat conditions."},
        {"name": "Dr. Priya Desai", "specialization": "Gynecology", "qualification": "MBBS, DGO", "bio": "Dedicated to women's health and prenatal care."},
        {"name": "Dr. Rahul Verma", "specialization": "Dermatology", "qualification": "MBBS, DDVL", "bio": "Focuses on clinical dermatology and cosmetic procedures."}
    ]

    seeded_doctors = []
    for i, data in enumerate(doctor_data):
        hospital = hospitals[i % len(hospitals)]
        doctor = db.query(Doctor).filter_by(name=data["name"], hospital_id=hospital.id).first()
        if not doctor:
            doctor = Doctor(
                hospital_id=hospital.id,
                name=data["name"],
                specialization=data["specialization"],
                qualification=data["qualification"],
                registration_number=f"REG-{10000+i}",
                phone=f"98765432{i:02d}",
                email=f"dr.{data['name'].split()[-1].lower()}@demo.com",
                bio=data["bio"]
            )
            db.add(doctor)
            db.commit()
            db.refresh(doctor)
        seeded_doctors.append(doctor)
    return seeded_doctors


def seed_patients(db) -> List[Patient]:
    patient_data = [
        {"first_name": "Demo Patient", "last_name": "Ramesh K", "phone": "9999000001", "gender": "Male", "date_of_birth": datetime(1980, 5, 12).date()},
        {"first_name": "Demo Patient", "last_name": "Sunita M", "phone": "9999000002", "gender": "Female", "date_of_birth": datetime(1992, 8, 24).date()},
        {"first_name": "Demo Patient", "last_name": "Amit B", "phone": "9999000003", "gender": "Male", "date_of_birth": datetime(1975, 11, 5).date()},
        {"first_name": "Demo Patient", "last_name": "Kavita S", "phone": "9999000004", "gender": "Female", "date_of_birth": datetime(2000, 2, 18).date()},
        {"first_name": "Demo Patient", "last_name": "Vikram P", "phone": "9999000005", "gender": "Male", "date_of_birth": datetime(1965, 7, 30).date()},
    ]

    seeded_patients = []
    for data in patient_data:
        patient = db.query(Patient).filter_by(first_name=data["first_name"], last_name=data["last_name"]).first()
        if not patient:
            patient = Patient(**data, preferred_language="en", email=f"{data['last_name'].replace(' ', '').lower()}@demo.patient")
            db.add(patient)
            db.commit()
            db.refresh(patient)
        seeded_patients.append(patient)
    return seeded_patients


def seed_visit_history(db, patients: List[Patient], doctors: List[Doctor]):
    # Create past visits for 2 of the patients (2-6 months ago)
    # This enables the "previously visited doctor" recommendation feature
    target_patients = patients[:2]
    
    for i, patient in enumerate(target_patients):
        doctor = doctors[i % len(doctors)]
        visit_date = datetime.now() - timedelta(days=random.randint(60, 180))
        
        visit = db.query(VisitHistory).filter_by(patient_id=patient.id, doctor_id=doctor.id).first()
        if not visit:
            visit = VisitHistory(
                patient_id=patient.id,
                doctor_id=doctor.id,
                hospital_id=doctor.hospital_id,
                visit_date=visit_date,
                diagnosis="Routine checkup",
                treatment="Prescribed general wellness guidelines",
                notes="Patient is doing well. Follow-up if needed."
            )
            db.add(visit)
            db.commit()

def seed_appointments(db, patients: List[Patient], doctors: List[Doctor]):
    # 3-4 appointments (mix of upcoming and completed)
    appointments_to_create = [
        (patients[0], doctors[0], datetime.now() - timedelta(days=2), "completed", "Follow-up for fever"),
        (patients[1], doctors[1], datetime.now() + timedelta(days=1), "scheduled", "Cardiac consultation"),
        (patients[2], doctors[2], datetime.now() + timedelta(days=3), "scheduled", "Ayurvedic wellness consultation"),
        (patients[3], doctors[3], datetime.now() - timedelta(days=5), "completed", "Pediatric vaccination"),
    ]

    for patient, doctor, appt_time, status, reason in appointments_to_create:
        appt = db.query(Appointment).filter_by(patient_id=patient.id, doctor_id=doctor.id, status=status).first()
        if not appt:
            appt = Appointment(
                patient_id=patient.id,
                doctor_id=doctor.id,
                hospital_id=doctor.hospital_id,
                appointment_time=appt_time,
                status=status,
                reason=reason,
                notes="Created via demo seed script."
            )
            db.add(appt)
            db.commit()


def seed_drugs(db) -> List[Drug]:
    # ~30 common medicines from WHO/NLEM
    drug_list = [
        ("Paracetamol", "Paracetamol", "500mg, 650mg", "Tablet"),
        ("Amoxicillin", "Amoxicillin", "250mg, 500mg", "Capsule"),
        ("Ibuprofen", "Ibuprofen", "200mg, 400mg", "Tablet"),
        ("Omeprazole", "Omeprazole", "20mg, 40mg", "Capsule"),
        ("Cetirizine", "Cetirizine", "10mg", "Tablet"),
        ("Azithromycin", "Azithromycin", "250mg, 500mg", "Tablet"),
        ("Metformin", "Metformin", "500mg, 850mg", "Tablet"),
        ("Amlodipine", "Amlodipine", "5mg, 10mg", "Tablet"),
        ("Atorvastatin", "Atorvastatin", "10mg, 20mg", "Tablet"),
        ("Levothyroxine", "Levothyroxine", "50mcg, 100mcg", "Tablet"),
        ("Losartan", "Losartan", "25mg, 50mg", "Tablet"),
        ("Pantoprazole", "Pantoprazole", "40mg", "Tablet"),
        ("Montelukast", "Montelukast", "10mg", "Tablet"),
        ("Metoprolol", "Metoprolol", "25mg, 50mg", "Tablet"),
        ("Diclofenac", "Diclofenac", "50mg", "Tablet"),
        ("Ciprofloxacin", "Ciprofloxacin", "500mg", "Tablet"),
        ("Aspirin", "Aspirin", "75mg, 150mg", "Tablet"),
        ("Doxycycline", "Doxycycline", "100mg", "Capsule"),
        ("Ceftriaxone", "Ceftriaxone", "1g", "Injection"),
        ("Ondansetron", "Ondansetron", "4mg, 8mg", "Tablet"),
        ("Fluconazole", "Fluconazole", "150mg", "Tablet"),
        ("Salbutamol", "Salbutamol", "100mcg", "Inhaler"),
        ("Metronidazole", "Metronidazole", "400mg", "Tablet"),
        ("Domperidone", "Domperidone", "10mg", "Tablet"),
        ("Tramadol", "Tramadol", "50mg", "Tablet"),
        ("Clopidogrel", "Clopidogrel", "75mg", "Tablet"),
        ("Rosuvastatin", "Rosuvastatin", "10mg, 20mg", "Tablet"),
        ("Telmisartan", "Telmisartan", "40mg, 80mg", "Tablet"),
        ("Vitamin D3", "Cholecalciferol", "60000 IU", "Capsule"),
        ("Multivitamin", "Multivitamins & Minerals", "1 tablet", "Tablet")
    ]

    seeded_drugs = []
    for name, generic, strength, form in drug_list:
        drug = db.query(Drug).filter_by(name=name).first()
        if not drug:
            drug = Drug(
                name=name,
                generic_name=generic,
                strength=strength,
                dosage_form=form,
                description=f"Common doses: {strength}",
                is_active=True
            )
            db.add(drug)
            db.commit()
            db.refresh(drug)
        seeded_drugs.append(drug)
    return seeded_drugs


def seed_prescriptions(db, patients: List[Patient], doctors: List[Doctor]):
    # 2 completed prescriptions with 2-3 items each
    target_patients = patients[:2]

    for i, patient in enumerate(target_patients):
        doctor = doctors[i % len(doctors)]
        
        presc = db.query(Prescription).filter_by(patient_id=patient.id, doctor_id=doctor.id).first()
        if not presc:
            presc = Prescription(
                patient_id=patient.id,
                doctor_id=doctor.id,
                status="completed",
                notes="Take medicines after food. Drink plenty of water.",
                prescribed_at=datetime.now() - timedelta(days=i+1)
            )
            db.add(presc)
            db.commit()
            db.refresh(presc)
            
            # Add Prescription Items
            items = [
                PrescriptionItem(
                    prescription_id=presc.id,
                    drug_name="Paracetamol",
                    dosage="650mg",
                    frequency="1-0-1",
                    duration="3 days",
                    quantity=6,
                    instructions="After food"
                ),
                PrescriptionItem(
                    prescription_id=presc.id,
                    drug_name="Amoxicillin",
                    dosage="500mg",
                    frequency="1-0-1",
                    duration="5 days",
                    quantity=10,
                    instructions="After food"
                )
            ]
            if i == 0:
                items.append(PrescriptionItem(
                    prescription_id=presc.id,
                    drug_name="Pantoprazole",
                    dosage="40mg",
                    frequency="1-0-0",
                    duration="5 days",
                    quantity=5,
                    instructions="Before food (empty stomach)"
                ))
            
            for item in items:
                db.add(item)
            db.commit()

def run_seed():
    db = SessionLocal()
    try:
        print("Starting Database Seed...")
        
        hospitals = seed_hospitals(db)
        print(f"[OK] Seeded {len(hospitals)} Hospitals")
        
        doctors = seed_doctors(db, hospitals)
        print(f"[OK] Seeded {len(doctors)} Doctors")
        
        patients = seed_patients(db)
        print(f"[OK] Seeded {len(patients)} Demo Patients")
        
        seed_visit_history(db, patients, doctors)
        print(f"[OK] Seeded Visit History")
        
        seed_appointments(db, patients, doctors)
        print(f"[OK] Seeded Appointments")
        
        drugs = seed_drugs(db)
        print(f"[OK] Seeded {len(drugs)} Drugs")
        
        seed_prescriptions(db, patients, doctors)
        print(f"[OK] Seeded Prescriptions")
        
        print("\n[SUCCESS] Seed complete! Demo data is ready.")
    except Exception as e:
        print(f"\n[ERROR] Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
