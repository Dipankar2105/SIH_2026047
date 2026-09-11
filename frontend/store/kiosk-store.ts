/**
 * Kiosk Store — Patient Web
 * Manages kiosk-specific multi-step flow state:
 *   Identity → Consent → Intake → Safety → Documents → Queue
 */

import type { SafetyEvaluation } from "../types/safety";

export type KioskStep =
  | "identity"
  | "consent"
  | "intake"
  | "safety"
  | "documents"
  | "queue-registered";

export interface KioskState {
  step: KioskStep;
  patientId: string | null;
  abhaId: string | null;
  appointmentId: string | null;
  intakeSessionId: string | null;
  safetyResult: SafetyEvaluation | null;
  queueToken: string | null;
  consentGiven: boolean;
  isLoading: boolean;
  error: string | null;
}

const STATE: KioskState = {
  step: "identity",
  patientId: null,
  abhaId: null,
  appointmentId: null,
  intakeSessionId: null,
  safetyResult: null,
  queueToken: null,
  consentGiven: false,
  isLoading: false,
  error: null,
};

const listeners = new Set<() => void>();
function notify() { listeners.forEach((fn) => fn()); }

export const kioskStore = {
  getState(): KioskState { return { ...STATE }; },

  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  setStep(step: KioskStep): void {
    STATE.step = step;
    notify();
  },

  setPatient(patientId: string, abhaId?: string): void {
    STATE.patientId = patientId;
    STATE.abhaId = abhaId || null;
    notify();
  },

  setAppointment(appointmentId: string): void {
    STATE.appointmentId = appointmentId;
    notify();
  },

  setIntakeSession(sessionId: string): void {
    STATE.intakeSessionId = sessionId;
    notify();
  },

  setSafetyResult(result: SafetyEvaluation): void {
    STATE.safetyResult = result;
    notify();
  },

  setQueueToken(token: string): void {
    STATE.queueToken = token;
    notify();
  },

  giveConsent(): void {
    STATE.consentGiven = true;
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

  /** Advance to the next kiosk step */
  advance(): void {
    const STEPS: KioskStep[] = ["identity", "consent", "intake", "safety", "documents", "queue-registered"];
    const idx = STEPS.indexOf(STATE.step);
    if (idx < STEPS.length - 1) {
      STATE.step = STEPS[idx + 1];
      notify();
    }
  },

  reset(): void {
    STATE.step = "identity";
    STATE.patientId = null;
    STATE.abhaId = null;
    STATE.appointmentId = null;
    STATE.intakeSessionId = null;
    STATE.safetyResult = null;
    STATE.queueToken = null;
    STATE.consentGiven = false;
    STATE.isLoading = false;
    STATE.error = null;
    notify();
  },
};
