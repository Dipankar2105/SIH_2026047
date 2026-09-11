/**
 * Hospital / Appointment Booking Service — Patient Web
 *
 * Endpoints (FastAPI):
 *   GET  /hospital/list                           — list hospitals (alias discovery)
 *   POST /hospital/appointment/book               — book appointment
 *   GET  /hospital/appointment/{appointmentId}    — get appointment details
 *   GET  /hospital/appointments?patientId=        — list patient appointments
 *   POST /hospital/appointment/{id}/cancel        — cancel appointment
 *   POST /hospital/queue/register                 — self-register into queue at hospital
 *
 * On booking confirmation: stores appointmentId in sessionStorage for cross-flow identity.
 */

import { patientApiClient, IS_MOCK } from "./client";
import type { Appointment, AppointmentRequest } from "../../types/appointment";

// ─── Mock data ─────────────────────────────────────────────────────────────

function makeMockAppointment(req?: Partial<AppointmentRequest>): Appointment {
  return {
    appointmentId: `appt-${Date.now()}`,
    patientId: req?.patientId || "pt-001",
    doctorId: req?.doctorId || "doc-1",
    doctorName: "Dr. Aarav Mehta",
    hospitalId: req?.hospitalId || "h1",
    hospitalName: "AIIMS New Delhi",
    specialty: "General Medicine",
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: "scheduled",
    queueToken: undefined,
    chiefComplaint: req?.chiefComplaint || "General checkup",
    notes: req?.notes,
    createdAt: new Date().toISOString(),
  };
}

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    appointmentId: "appt-prev-001",
    patientId: "pt-001",
    doctorId: "doc-1",
    doctorName: "Dr. Aarav Mehta",
    hospitalId: "h1",
    hospitalName: "AIIMS New Delhi",
    specialty: "General Medicine",
    scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    queueToken: "#42",
    chiefComplaint: "Abdominal pain",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Service ───────────────────────────────────────────────────────────────

export const appointmentService = {
  /**
   * Book a new appointment.
   * Real: POST /hospital/appointment/book
   * DO NOT show success if backend fails (hard failure in real mode).
   */
  async bookAppointment(request: AppointmentRequest): Promise<Appointment> {
    if (IS_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const appt = makeMockAppointment(request);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("current_appointment_id", appt.appointmentId);
            sessionStorage.setItem("current_appointment", JSON.stringify(appt));
          }
          resolve(appt);
        }, 600);
      });
    }

    // Real mode: hard failure if backend fails
    const appt = await patientApiClient.post<Appointment>("/hospital/appointment/book", request);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("current_appointment_id", appt.appointmentId);
      sessionStorage.setItem("current_appointment", JSON.stringify(appt));
    }
    return appt;
  },

  /**
   * Get a single appointment.
   * Real: GET /hospital/appointment/{appointmentId}
   */
  async getAppointment(appointmentId: string): Promise<Appointment | null> {
    // Check session storage first
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("current_appointment");
        if (stored) {
          const parsed = JSON.parse(stored) as Appointment;
          if (parsed.appointmentId === appointmentId) return parsed;
        }
      } catch { /* continue */ }
    }

    if (IS_MOCK) {
      const found = MOCK_APPOINTMENTS.find((a) => a.appointmentId === appointmentId) ?? null;
      return new Promise((resolve) => setTimeout(() => resolve(found), 250));
    }

    try {
      return await patientApiClient.get<Appointment>(`/hospital/appointment/${appointmentId}`);
    } catch (err) {
      console.warn("Failed to get appointment:", err);
      return null;
    }
  },

  /**
   * List all appointments for the current patient.
   * Real: GET /hospital/appointments?patient_id=
   */
  async listAppointments(patientId: string): Promise<Appointment[]> {
    if (IS_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_APPOINTMENTS), 300));
    }

    try {
      return await patientApiClient.get<Appointment[]>(
        `/hospital/appointments?patient_id=${patientId}`
      );
    } catch (err) {
      console.warn("Failed to list appointments:", err);
      return MOCK_APPOINTMENTS;
    }
  },

  /**
   * Cancel an appointment.
   * Real: POST /hospital/appointment/{id}/cancel
   */
  async cancelAppointment(appointmentId: string): Promise<boolean> {
    if (IS_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(true), 300));
    }

    try {
      await patientApiClient.post(`/hospital/appointment/${appointmentId}/cancel`);
      return true;
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      throw err;
    }
  },

  /**
   * Self-register into the queue at a hospital (patient arrives at reception/kiosk).
   * Real: POST /hospital/queue/register
   * Returns: { queueToken: "#XX" }
   */
  async registerInQueue(data: {
    patientId: string;
    appointmentId?: string;
    hospitalId: string;
    chiefComplaint: string;
  }): Promise<{ queueToken: string }> {
    if (IS_MOCK) {
      const token = `#${String(Math.floor(Math.random() * 90) + 10)}`;
      return new Promise((resolve) => {
        setTimeout(() => {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("queue_token", token);
          }
          resolve({ queueToken: token });
        }, 400);
      });
    }

    const result = await patientApiClient.post<{ queueToken: string }>("/hospital/queue/register", data);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("queue_token", result.queueToken);
    }
    return result;
  },

  /** Get the locally stored queue token */
  getLocalQueueToken(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("queue_token");
  },

  /** Get the locally stored current appointment */
  getLocalAppointment(): Appointment | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem("current_appointment");
      return stored ? (JSON.parse(stored) as Appointment) : null;
    } catch {
      return null;
    }
  },
};
