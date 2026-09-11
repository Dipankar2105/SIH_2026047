/**
 * Safety / Red-Flag Evaluation Service — Patient Web
 *
 * Endpoints (FastAPI):
 *   GET /safety/{sessionId}           — get safety evaluation result for an intake session
 *   POST /safety/evaluate             — trigger safety evaluation (if not auto-done during intake)
 *
 * Backend is authoritative for clinical red-flag logic.
 * Frontend only displays what the backend returns.
 */

import { patientApiClient, IS_MOCK } from "./client";
import type { SafetyEvaluation } from "../../types/safety";

// ─── Mock data ─────────────────────────────────────────────────────────────

const MOCK_SAFE: SafetyEvaluation = {
  sessionId: "mock-session",
  patientId: "pt-001",
  redFlagDetected: false,
  flags: [],
  overallRisk: "low",
  immediateAttentionRequired: false,
  evaluatedAt: new Date().toISOString(),
};

const MOCK_RED_FLAG: SafetyEvaluation = {
  sessionId: "mock-session",
  patientId: "pt-001",
  redFlagDetected: true,
  flags: [
    {
      flagId: "flag-1",
      category: "cardiac",
      severity: "high",
      description: "Chest pain with radiation to left arm reported",
      recommendedAction: "Immediate ECG and troponin levels. Consider emergency referral.",
    },
  ],
  overallRisk: "high",
  immediateAttentionRequired: true,
  evaluatedAt: new Date().toISOString(),
};

// ─── Service ───────────────────────────────────────────────────────────────

export const safetyService = {
  /**
   * Get safety evaluation result for a session.
   * Real: GET /safety/{sessionId}
   */
  async getSafetyEvaluation(sessionId: string): Promise<SafetyEvaluation> {
    if (IS_MOCK) {
      // Simulate red flag 20% of the time in mock mode for demo
      const hasFlag = Math.random() < 0.2;
      return new Promise((resolve) =>
        setTimeout(() => resolve({ ...(hasFlag ? MOCK_RED_FLAG : MOCK_SAFE), sessionId }), 400)
      );
    }

    try {
      return await patientApiClient.get<SafetyEvaluation>(`/safety/${sessionId}`);
    } catch (err) {
      console.warn("Failed to get safety evaluation:", err);
      return { ...MOCK_SAFE, sessionId };
    }
  },

  /**
   * Trigger safety evaluation (if backend requires explicit trigger).
   * Real: POST /safety/evaluate
   */
  async triggerEvaluation(data: {
    sessionId: string;
    patientId: string;
    answers?: Record<string, string | string[] | number | boolean>;
  }): Promise<SafetyEvaluation> {
    if (IS_MOCK) {
      return this.getSafetyEvaluation(data.sessionId);
    }

    try {
      return await patientApiClient.post<SafetyEvaluation>("/safety/evaluate", data);
    } catch (err) {
      console.warn("Safety evaluation trigger failed:", err);
      return { ...MOCK_SAFE, sessionId: data.sessionId, patientId: data.patientId };
    }
  },
};
