/**
 * Identity / Auth Service — Patient Web
 *
 * Endpoints used (FastAPI backend):
 *   POST /identity/register   — create patient record
 *   POST /identity/login      — get session token
 *   GET  /identity/profile    — get patient profile by token
 *   POST /identity/logout     — invalidate session
 *
 * Mock fallback is preserved when IS_MOCK = true.
 */

import { patientApiClient, IS_MOCK, ApiError } from "./client";
import type { PatientProfile, PatientSession } from "../../types/patient";

// ─── Mock data ─────────────────────────────────────────────────────────────

const MOCK_PATIENT: PatientProfile = {
  id: "pt-001",
  patientId: "pt-001",
  abhaId: "ABHA-1111-2222-3333-4444",
  name: "Demo Patient",
  age: 32,
  gender: "M",
  dob: "1993-04-15",
  phone: "+91-9876543210",
  email: "demo@aarogyaflow.gov.in",
  bloodGroup: "B+",
  createdAt: new Date().toISOString(),
};

const MOCK_SESSION: PatientSession = {
  patientId: "pt-001",
  abhaId: "ABHA-1111-2222-3333-4444",
  name: "Demo Patient",
  sessionToken: "mock-session-token-xyz",
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// ─── Service ───────────────────────────────────────────────────────────────

export interface PatientLoginRequest {
  abhaId?: string;
  phone?: string;
  otp?: string;
  password?: string;
}

export interface PatientRegisterRequest {
  name: string;
  phone: string;
  dob: string;
  gender: "M" | "F" | "O";
  abhaId?: string;
}

export const identityService = {
  /**
   * Register a new patient.
   * Real: POST /identity/register
   * Fallback: returns mock profile
   */
  async register(data: PatientRegisterRequest): Promise<PatientProfile> {
    if (IS_MOCK) {
      return new Promise((resolve) =>
        setTimeout(() => resolve({ ...MOCK_PATIENT, ...data, id: `pt-${Date.now()}`, patientId: `pt-${Date.now()}`, createdAt: new Date().toISOString() }), 500)
      );
    }

    try {
      return await patientApiClient.post<PatientProfile>("/identity/register", data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        throw new Error("Patient with this ABHA ID or phone already registered.");
      }
      throw err;
    }
  },

  /**
   * Login patient (ABHA OTP or phone/password).
   * Real: POST /identity/login
   * On success: saves session token to localStorage.
   * Fallback: returns mock session.
   */
  async login(credentials: PatientLoginRequest): Promise<PatientSession> {
    if (IS_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (typeof window !== "undefined") {
            localStorage.setItem("patient_token", MOCK_SESSION.sessionToken);
            localStorage.setItem("patient_id", MOCK_SESSION.patientId);
            localStorage.setItem("patient_name", MOCK_SESSION.name);
          }
          resolve(MOCK_SESSION);
        }, 500);
      });
    }

    try {
      const session = await patientApiClient.post<PatientSession>("/identity/login", credentials);
      if (typeof window !== "undefined") {
        localStorage.setItem("patient_token", session.sessionToken);
        localStorage.setItem("patient_id", session.patientId);
        localStorage.setItem("patient_name", session.name);
        if (session.abhaId) {
          localStorage.setItem("patient_abha", session.abhaId);
        }
      }
      return session;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        throw new Error("Invalid credentials. Please check your ABHA ID or OTP.");
      }
      throw err;
    }
  },

  /**
   * Get the stored patient session from localStorage (no API call).
   */
  getLocalSession(): PatientSession | null {
    if (typeof window === "undefined") return null;
    const sessionToken = localStorage.getItem("patient_token");
    const patientId = localStorage.getItem("patient_id");
    const name = localStorage.getItem("patient_name");
    if (!sessionToken || !patientId) return null;
    return {
      patientId,
      name: name || "Patient",
      abhaId: localStorage.getItem("patient_abha") || undefined,
      sessionToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  /**
   * Fetch patient profile from backend.
   * Real: GET /identity/profile
   * Fallback: returns MOCK_PATIENT
   */
  async getProfile(): Promise<PatientProfile> {
    if (IS_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_PATIENT), 300));
    }

    try {
      return await patientApiClient.get<PatientProfile>("/identity/profile");
    } catch (err) {
      console.warn("Failed to load patient profile from backend:", err);
      return MOCK_PATIENT;
    }
  },

  /**
   * Logout — invalidates session on backend and clears localStorage.
   * Real: POST /identity/logout
   */
  async logout(): Promise<void> {
    if (!IS_MOCK) {
      try {
        await patientApiClient.post("/identity/logout");
      } catch (err) {
        console.warn("Backend logout failed, clearing local session anyway:", err);
      }
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("patient_token");
      localStorage.removeItem("patient_id");
      localStorage.removeItem("patient_name");
      localStorage.removeItem("patient_abha");
    }
  },

  /** Check if patient has an active local session */
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("patient_token");
  },
};
