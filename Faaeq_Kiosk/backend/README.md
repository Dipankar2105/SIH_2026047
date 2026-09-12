# MediKiosk Backend

This is the backend service for MediKiosk.

## Demo Data

To populate the database with realistic but synthetic demo data for presentations or hackathons, run the seed script:

```bash
cd backend
python seed.py
```

This will safely seed:
- 3 Fictional Hospitals
- 8 Doctors across various specialties
- 5 Demo Patients
- Sample Visit History for recommendation testing
- Sample Appointments
- ~30 WHO/NLEM Essential Medicines
- Sample Prescriptions

*Note: This data is purely synthetic and is kept separate from any real ABDM-verified test patients.*
