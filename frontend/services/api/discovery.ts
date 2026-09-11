/**
 * Discovery Service — Patient Web
 *
 * Endpoints (FastAPI):
 *   GET /discovery/hospitals              — list hospitals (optional query: city, lat, lon)
 *   GET /discovery/specialties            — list specialties
 *   GET /discovery/doctors                — list doctors (query: hospitalId?, specialtyId?)
 *   GET /discovery/doctors/{doctorId}     — single doctor details
 *   GET /discovery/slots/{doctorId}       — available time slots
 *
 * Mock fallback preserved when IS_MOCK = true.
 */

import { patientApiClient, IS_MOCK } from "./client";
import type { Hospital, Doctor, Specialty, TimeSlot } from "../../types/doctor";

// ─── Mock data ─────────────────────────────────────────────────────────────

const MOCK_HOSPITALS: Hospital[] = [
  { hospitalId: "h1", name: "AIIMS New Delhi", address: "Ansari Nagar, New Delhi", city: "New Delhi", type: "Government", distance: 2.1 },
  { hospitalId: "h2", name: "Safdarjung Hospital", address: "Ansari Nagar West, New Delhi", city: "New Delhi", type: "Government", distance: 3.5 },
  { hospitalId: "h3", name: "Apollo Hospital", address: "Sarita Vihar, New Delhi", city: "New Delhi", type: "Private", distance: 5.8 },
];

const MOCK_SPECIALTIES: Specialty[] = [
  { specialtyId: "sp1", name: "General Medicine", description: "Primary and internal medicine" },
  { specialtyId: "sp2", name: "Cardiology", description: "Heart and cardiovascular care" },
  { specialtyId: "sp3", name: "Orthopaedics", description: "Bone, joint and muscle care" },
  { specialtyId: "sp4", name: "ENT", description: "Ear, Nose and Throat" },
  { specialtyId: "sp5", name: "Gynaecology", description: "Women's health" },
  { specialtyId: "sp6", name: "Paediatrics", description: "Child health" },
  { specialtyId: "sp7", name: "Dermatology", description: "Skin conditions" },
  { specialtyId: "sp8", name: "Neurology", description: "Brain and nervous system" },
];

const MOCK_DOCTORS: Doctor[] = [
  {
    doctorId: "doc-1",
    name: "Dr. Aarav Mehta",
    qualifications: "MBBS, MD (Internal Medicine)",
    specialty: "General Medicine",
    specialtyId: "sp1",
    hospitalId: "h1",
    hospitalName: "AIIMS New Delhi",
    experience: 12,
    languages: ["English", "Hindi"],
    rating: 4.8,
    availableToday: true,
    nextAvailable: new Date().toISOString(),
    opdRoom: "OPD Room 14",
  },
  {
    doctorId: "doc-2",
    name: "Dr. Priya Sharma",
    qualifications: "MBBS, DM (Cardiology)",
    specialty: "Cardiology",
    specialtyId: "sp2",
    hospitalId: "h1",
    hospitalName: "AIIMS New Delhi",
    experience: 9,
    languages: ["English", "Hindi", "Bengali"],
    rating: 4.7,
    availableToday: true,
    nextAvailable: new Date().toISOString(),
  },
  {
    doctorId: "doc-3",
    name: "Dr. Suresh Nair",
    qualifications: "MBBS, MS (Orthopaedics)",
    specialty: "Orthopaedics",
    specialtyId: "sp3",
    hospitalId: "h2",
    hospitalName: "Safdarjung Hospital",
    experience: 15,
    languages: ["English", "Hindi", "Malayalam"],
    rating: 4.6,
    availableToday: false,
    nextAvailable: new Date(Date.now() + 86400000).toISOString(),
  },
];

function generateMockSlots(doctorId: string, date: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const base = new Date(date || new Date().toDateString());
  for (let h = 9; h <= 16; h++) {
    const start = new Date(base);
    start.setHours(h, 0, 0, 0);
    const end = new Date(base);
    end.setHours(h, 30, 0, 0);
    slots.push({
      slotId: `${doctorId}-${h}`,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      available: h !== 12 && h !== 13, // lunch break
    });
  }
  return slots;
}

// ─── Service ───────────────────────────────────────────────────────────────

export const discoveryService = {
  /**
   * Fetch list of hospitals.
   * Real: GET /discovery/hospitals?city=&lat=&lon=
   */
  async getHospitals(params?: { city?: string; lat?: number; lon?: number }): Promise<Hospital[]> {
    if (IS_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_HOSPITALS), 300));
    }

    try {
      const query = new URLSearchParams();
      if (params?.city) query.set("city", params.city);
      if (params?.lat != null) query.set("lat", String(params.lat));
      if (params?.lon != null) query.set("lon", String(params.lon));
      const qs = query.toString();
      return await patientApiClient.get<Hospital[]>(`/discovery/hospitals${qs ? `?${qs}` : ""}`);
    } catch (err) {
      console.warn("Failed to fetch hospitals from backend:", err);
      return MOCK_HOSPITALS;
    }
  },

  /**
   * Fetch specialties list.
   * Real: GET /discovery/specialties
   */
  async getSpecialties(): Promise<Specialty[]> {
    if (IS_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_SPECIALTIES), 200));
    }

    try {
      return await patientApiClient.get<Specialty[]>("/discovery/specialties");
    } catch (err) {
      console.warn("Failed to fetch specialties:", err);
      return MOCK_SPECIALTIES;
    }
  },

  /**
   * Search doctors.
   * Real: GET /discovery/doctors?hospitalId=&specialtyId=&name=
   */
  async searchDoctors(params?: {
    hospitalId?: string;
    specialtyId?: string;
    name?: string;
    availableOnly?: boolean;
  }): Promise<Doctor[]> {
    if (IS_MOCK) {
      let filtered = [...MOCK_DOCTORS];
      if (params?.hospitalId) filtered = filtered.filter((d) => d.hospitalId === params.hospitalId);
      if (params?.specialtyId) filtered = filtered.filter((d) => d.specialtyId === params.specialtyId);
      if (params?.name) filtered = filtered.filter((d) => d.name.toLowerCase().includes(params.name!.toLowerCase()));
      if (params?.availableOnly) filtered = filtered.filter((d) => d.availableToday);
      return new Promise((resolve) => setTimeout(() => resolve(filtered), 300));
    }

    try {
      const query = new URLSearchParams();
      if (params?.hospitalId) query.set("hospital_id", params.hospitalId);
      if (params?.specialtyId) query.set("specialty_id", params.specialtyId);
      if (params?.name) query.set("name", params.name);
      if (params?.availableOnly) query.set("available_today", "true");
      const qs = query.toString();
      return await patientApiClient.get<Doctor[]>(`/discovery/doctors${qs ? `?${qs}` : ""}`);
    } catch (err) {
      console.warn("Failed to search doctors:", err);
      return MOCK_DOCTORS;
    }
  },

  /**
   * Get doctor details.
   * Real: GET /discovery/doctors/{doctorId}
   */
  async getDoctorById(doctorId: string): Promise<Doctor | null> {
    if (IS_MOCK) {
      const doctor = MOCK_DOCTORS.find((d) => d.doctorId === doctorId) ?? null;
      return new Promise((resolve) => setTimeout(() => resolve(doctor), 200));
    }

    try {
      return await patientApiClient.get<Doctor>(`/discovery/doctors/${doctorId}`);
    } catch (err) {
      console.warn("Failed to get doctor details:", err);
      return MOCK_DOCTORS.find((d) => d.doctorId === doctorId) ?? null;
    }
  },

  /**
   * Get available slots for a doctor on a date.
   * Real: GET /discovery/slots/{doctorId}?date=YYYY-MM-DD
   */
  async getAvailableSlots(doctorId: string, date?: string): Promise<TimeSlot[]> {
    const dateStr = date || new Date().toISOString().split("T")[0];

    if (IS_MOCK) {
      return new Promise((resolve) =>
        setTimeout(() => resolve(generateMockSlots(doctorId, dateStr)), 300)
      );
    }

    try {
      return await patientApiClient.get<TimeSlot[]>(
        `/discovery/slots/${doctorId}?date=${dateStr}`
      );
    } catch (err) {
      console.warn("Failed to fetch slots:", err);
      return generateMockSlots(doctorId, dateStr);
    }
  },
};
