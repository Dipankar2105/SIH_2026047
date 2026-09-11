/**
 * FHIR Health Records Service — Patient Web
 *
 * Endpoints (FastAPI):
 *   GET /fhir/patient/{patientId}/summary        — FHIR patient summary (ABHA linked records)
 *   GET /fhir/patient/{patientId}/observations   — vital observations
 *   GET /fhir/patient/{patientId}/conditions     — active conditions
 *   GET /fhir/patient/{patientId}/medications    — current medications
 *   GET /fhir/patient/{patientId}/immunizations  — immunization records
 *
 * NOTE: These endpoints depend on ABDM/ABHA linkage.
 * If not linked, returns empty arrays — UI shows empty state.
 */

import { patientApiClient, IS_MOCK } from "./client";

export interface HealthRecord {
  recordId: string;
  type: "observation" | "condition" | "medication" | "immunization" | "allergy";
  title: string;
  value?: string;
  date: string;
  source?: string;
  status?: string;
}

export interface PatientHealthSummary {
  patientId: string;
  abhaLinked: boolean;
  lastUpdated?: string;
  conditions: HealthRecord[];
  medications: HealthRecord[];
  observations: HealthRecord[];
  immunizations: HealthRecord[];
  allergies: HealthRecord[];
}

// ─── Mock data ─────────────────────────────────────────────────────────────

const MOCK_HEALTH_SUMMARY: PatientHealthSummary = {
  patientId: "pt-001",
  abhaLinked: true,
  lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  conditions: [
    { recordId: "cond-1", type: "condition", title: "Hypertension", date: "2024-01-15", status: "active", source: "ABDM" },
    { recordId: "cond-2", type: "condition", title: "Type 2 Diabetes Mellitus", date: "2023-06-20", status: "active", source: "ABDM" },
  ],
  medications: [
    { recordId: "med-1", type: "medication", title: "Metformin 500mg", value: "Twice daily", date: "2024-01-15", status: "active", source: "ABDM" },
    { recordId: "med-2", type: "medication", title: "Amlodipine 5mg", value: "Once daily", date: "2024-01-15", status: "active", source: "ABDM" },
  ],
  observations: [
    { recordId: "obs-1", type: "observation", title: "Blood Pressure", value: "128/82 mmHg", date: "2024-08-01", source: "ABDM" },
    { recordId: "obs-2", type: "observation", title: "HbA1c", value: "7.2%", date: "2024-07-15", source: "ABDM" },
    { recordId: "obs-3", type: "observation", title: "Fasting Blood Glucose", value: "118 mg/dL", date: "2024-07-15", source: "ABDM" },
  ],
  immunizations: [
    { recordId: "imm-1", type: "immunization", title: "COVID-19 (Covishield)", date: "2021-05-20", status: "completed", source: "CoWIN" },
    { recordId: "imm-2", type: "immunization", title: "Influenza Vaccine", date: "2023-10-12", status: "completed", source: "ABDM" },
  ],
  allergies: [
    { recordId: "all-1", type: "allergy", title: "Penicillin", value: "Rash", date: "2020-03-10", source: "Patient-reported" },
  ],
};

// ─── Service ───────────────────────────────────────────────────────────────

export const fhirService = {
  /**
   * Fetch full health summary for a patient.
   * Real: GET /fhir/patient/{patientId}/summary
   */
  async getHealthSummary(patientId: string): Promise<PatientHealthSummary> {
    if (IS_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_HEALTH_SUMMARY), 400));
    }

    try {
      return await patientApiClient.get<PatientHealthSummary>(`/fhir/patient/${patientId}/summary`);
    } catch (err) {
      console.warn("FHIR summary fetch failed (ABDM may not be linked):", err);
      // Return empty summary — UI will show empty state
      return {
        patientId,
        abhaLinked: false,
        conditions: [],
        medications: [],
        observations: [],
        immunizations: [],
        allergies: [],
      };
    }
  },

  /**
   * Fetch observations only.
   * Real: GET /fhir/patient/{patientId}/observations
   */
  async getObservations(patientId: string): Promise<HealthRecord[]> {
    if (IS_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_HEALTH_SUMMARY.observations), 300));
    }

    try {
      return await patientApiClient.get<HealthRecord[]>(`/fhir/patient/${patientId}/observations`);
    } catch (err) {
      console.warn("FHIR observations fetch failed:", err);
      return [];
    }
  },
};
