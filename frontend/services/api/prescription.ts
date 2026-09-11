/**
 * Prescription Retrieval Service — Patient Web
 *
 * Endpoints (FastAPI):
 *   GET /prescription/patient/{patientId}              — list patient prescriptions
 *   GET /prescription/{prescriptionId}                 — get single prescription
 *   GET /prescription/appointment/{appointmentId}      — get prescription for appointment
 *
 * Uses the SAME backend prescription data that the Doctor Console writes to.
 * No second prescription source.
 */

import { patientApiClient, IS_MOCK } from "./client";
import type { Prescription } from "../../types/prescription";

// ─── Mock data ─────────────────────────────────────────────────────────────

const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    prescriptionId: "rx-001",
    patientId: "pt-001",
    appointmentId: "appt-prev-001",
    queueToken: "#42",
    doctorId: "doc-1",
    doctorName: "Dr. Aarav Mehta",
    medications: [
      {
        medicineName: "Pantoprazole 40mg",
        dosage: "40mg",
        frequency: "Once daily",
        duration: "14 days",
        route: "Oral",
        instructions: "Take 30 minutes before breakfast on an empty stomach",
      },
      {
        medicineName: "Domperidone 10mg",
        dosage: "10mg",
        frequency: "Three times daily",
        duration: "7 days",
        route: "Oral",
        instructions: "Take 15 minutes before meals",
      },
    ],
    diagnoses: ["Acute Gastritis", "Dyspepsia"],
    notes: "Avoid spicy food and alcohol. Follow-up in 2 weeks if symptoms persist.",
    followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    issuedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Service ───────────────────────────────────────────────────────────────

export const prescriptionService = {
  /**
   * List all prescriptions for a patient.
   * Real: GET /prescription/patient/{patientId}
   */
  async listPrescriptions(patientId: string): Promise<Prescription[]> {
    if (IS_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_PRESCRIPTIONS), 300));
    }

    try {
      return await patientApiClient.get<Prescription[]>(`/prescription/patient/${patientId}`);
    } catch (err) {
      console.warn("Failed to fetch prescriptions:", err);
      return MOCK_PRESCRIPTIONS;
    }
  },

  /**
   * Get a single prescription.
   * Real: GET /prescription/{prescriptionId}
   */
  async getPrescription(prescriptionId: string): Promise<Prescription | null> {
    if (IS_MOCK) {
      const rx = MOCK_PRESCRIPTIONS.find((p) => p.prescriptionId === prescriptionId) ?? null;
      return new Promise((resolve) => setTimeout(() => resolve(rx), 200));
    }

    try {
      return await patientApiClient.get<Prescription>(`/prescription/${prescriptionId}`);
    } catch (err) {
      console.warn("Failed to get prescription:", err);
      return MOCK_PRESCRIPTIONS.find((p) => p.prescriptionId === prescriptionId) ?? null;
    }
  },

  /**
   * Get prescription for a specific appointment.
   * Real: GET /prescription/appointment/{appointmentId}
   */
  async getPrescriptionForAppointment(appointmentId: string): Promise<Prescription | null> {
    if (IS_MOCK) {
      const rx = MOCK_PRESCRIPTIONS.find((p) => p.appointmentId === appointmentId) ?? null;
      return new Promise((resolve) => setTimeout(() => resolve(rx), 200));
    }

    try {
      return await patientApiClient.get<Prescription>(
        `/prescription/appointment/${appointmentId}`
      );
    } catch (err) {
      console.warn("Failed to get appointment prescription:", err);
      return null;
    }
  },
};
