/**
 * Auth Store — Patient Web
 * Manages patient authentication state.
 * Uses simple signal-like pattern compatible with React useState / Zustand.
 * Import this into your React components or hooks.
 */

import type { PatientProfile, PatientSession } from "../types/patient";

export interface PatientAuthState {
  isAuthenticated: boolean;
  session: PatientSession | null;
  profile: PatientProfile | null;
  isLoading: boolean;
  error: string | null;
}

const STATE: PatientAuthState = {
  isAuthenticated: false,
  session: null,
  profile: null,
  isLoading: false,
  error: null,
};

// Initialize from localStorage on module load (client-side only)
if (typeof window !== "undefined") {
  const token = localStorage.getItem("patient_token");
  const patientId = localStorage.getItem("patient_id");
  const name = localStorage.getItem("patient_name");
  if (token && patientId) {
    STATE.isAuthenticated = true;
    STATE.session = {
      patientId,
      name: name || "Patient",
      abhaId: localStorage.getItem("patient_abha") || undefined,
      sessionToken: token,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };
  }
}

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export const authStore = {
  getState(): PatientAuthState {
    return { ...STATE };
  },

  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  setSession(session: PatientSession): void {
    STATE.session = session;
    STATE.isAuthenticated = true;
    STATE.error = null;
    notify();
  },

  setProfile(profile: PatientProfile): void {
    STATE.profile = profile;
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

  clearAuth(): void {
    STATE.isAuthenticated = false;
    STATE.session = null;
    STATE.profile = null;
    STATE.error = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("patient_token");
      localStorage.removeItem("patient_id");
      localStorage.removeItem("patient_name");
      localStorage.removeItem("patient_abha");
    }
    notify();
  },
};
