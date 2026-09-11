/**
 * AI Summary Service — Patient Web
 *
 * Endpoints (FastAPI):
 *   GET  /summary/{sessionId}            — get AI-generated summary for intake session
 *   POST /summary/generate               — request generation of a summary
 *
 * Used to show the patient a readable summary of their intake answers before consulting the doctor.
 */

import { patientApiClient, IS_MOCK } from "./client";
import type { PatientSummary } from "../../types/summary";

// ─── Mock data ─────────────────────────────────────────────────────────────

function getMockSummary(sessionId: string): PatientSummary {
  return {
    patientId: "pt-001",
    chiefComplaint: "Abdominal pain and cramping",
    symptomsSummary:
      "Patient reports intermittent abdominal pain rated 6/10, onset 2 days ago after outside food. " +
      "Associated with nausea and one episode of vomiting. No fever. No urinary symptoms.",
    aiNarrative:
      "Based on the intake, this appears to be an acute gastrointestinal complaint likely secondary to dietary indiscretion. " +
      "The pain pattern and associated symptoms are consistent with acute gastritis or food poisoning. " +
      "No red flags (e.g., blood in stool, severe unrelenting pain) were reported.",
    redFlagDetected: false,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Service ───────────────────────────────────────────────────────────────

export const summaryService = {
  /**
   * Get AI summary for a session.
   * Real: GET /summary/{sessionId}
   */
  async getSummary(sessionId: string): Promise<PatientSummary | null> {
    if (IS_MOCK) {
      return new Promise((resolve) =>
        setTimeout(() => resolve(getMockSummary(sessionId)), 400)
      );
    }

    try {
      return await patientApiClient.get<PatientSummary>(`/summary/${sessionId}`);
    } catch (err) {
      console.warn("Failed to fetch summary:", err);
      return getMockSummary(sessionId);
    }
  },

  /**
   * Request summary generation (if backend requires explicit trigger).
   * Real: POST /summary/generate
   */
  async generateSummary(data: { sessionId: string; patientId: string }): Promise<PatientSummary | null> {
    if (IS_MOCK) {
      return this.getSummary(data.sessionId);
    }

    try {
      return await patientApiClient.post<PatientSummary>("/summary/generate", data);
    } catch (err) {
      console.warn("Summary generation failed:", err);
      return null;
    }
  },
};
