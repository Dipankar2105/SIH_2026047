/**
 * Patient Store — Patient Web
 * Stores current patient profile and appointment context.
 */

import type { PatientProfile } from "../types/patient";
import type { Appointment } from "../types/appointment";

export interface PatientState {
  profile: PatientProfile | null;
  currentAppointment: Appointment | null;
  queueToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const STATE: PatientState = {
  profile: null,
  currentAppointment: null,
  queueToken:
    typeof window !== "undefined"
      ? sessionStorage.getItem("queue_token")
      : null,
  isLoading: false,
  error: null,
};

const listeners = new Set<() => void>();
function notify() { listeners.forEach((fn) => fn()); }

export const patientStore = {
  getState(): PatientState { return { ...STATE }; },

  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  setProfile(profile: PatientProfile): void {
    STATE.profile = profile;
    notify();
  },

  setAppointment(appointment: Appointment): void {
    STATE.currentAppointment = appointment;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("current_appointment", JSON.stringify(appointment));
      sessionStorage.setItem("current_appointment_id", appointment.appointmentId);
    }
    notify();
  },

  setQueueToken(token: string): void {
    STATE.queueToken = token;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("queue_token", token);
    }
    notify();
  },

  setLoading(loading: boolean): void {
    STATE.isLoading = loading;
    notify();
  },

  setError(error: string | null): void {
    STATE.error = error;
    notify();
  },

  reset(): void {
    STATE.profile = null;
    STATE.currentAppointment = null;
    STATE.queueToken = null;
    STATE.isLoading = false;
    STATE.error = null;
    notify();
  },
};
