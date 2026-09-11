import { apiClient } from "@/lib/api-client";
import { dashboardService, QueuePatient, PatientAssessment } from "@/lib/services/dashboard.service";

export interface PrescriptionItemData {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface PrescriptionData {
  token: string;
  medicines: PrescriptionItemData[];
  doctorSignature?: string;
  notes?: string;
  createdAt: string;
}

export interface ClinicalData {
  patient: QueuePatient | null;
  historySummary: string;
  safetyAlerts: string[];
}

const IS_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";

export const clinicalService = {
  async getPatientClinicalData(token: string): Promise<QueuePatient | null> {
    return dashboardService.getPatientByToken(token);
  },

  async getClinicalSummary(token: string): Promise<string> {
    if (IS_MOCK_API) {
      const patient = await dashboardService.getPatientByToken(token);
      return patient?.aiSummary || "Patient summary currently unavailable.";
    }

    try {
      const cleanToken = token.replace(/^#/, "");
      const res = await apiClient.get<{ summary: string }>(`/summary/${cleanToken}`);
      return res.summary;
    } catch (err) {
      console.warn("Failed to fetch real summary, falling back to local dataset:", err);
      const patient = await dashboardService.getPatientByToken(token);
      return patient?.aiSummary || "Patient summary currently unavailable.";
    }
  },

  async getSafetyAssessment(token: string): Promise<{ redFlagDetected: boolean; alerts: string[] }> {
    if (IS_MOCK_API) {
      const patient = await dashboardService.getPatientByToken(token);
      return {
        redFlagDetected: patient?.redFlagDetected || false,
        alerts: patient?.redFlagDetected
          ? ["Red flag detected during patient intake", "Immediate clinical review recommended"]
          : [],
      };
    }

    try {
      const cleanToken = token.replace(/^#/, "");
      return await apiClient.get<{ redFlagDetected: boolean; alerts: string[] }>(`/safety/${cleanToken}`);
    } catch (err) {
      console.warn("Failed to fetch real safety assessment:", err);
      const patient = await dashboardService.getPatientByToken(token);
      return {
        redFlagDetected: patient?.redFlagDetected || false,
        alerts: patient?.redFlagDetected
          ? ["Red flag detected during patient intake"]
          : [],
      };
    }
  },

  async saveAssessment(assessment: PatientAssessment): Promise<boolean> {
    // Save to local session storage first
    await dashboardService.saveAssessment(assessment);

    if (!IS_MOCK_API) {
      try {
        const cleanToken = assessment.token.replace(/^#/, "");
        await apiClient.post(`/consultation/assessment/${cleanToken}`, assessment);
      } catch (err) {
        console.warn("Backend save assessment call failed, stored locally in session:", err);
      }
    }
    return true;
  },

  async getAssessment(token: string): Promise<PatientAssessment | null> {
    return dashboardService.getAssessment(token);
  },

  async saveInvestigationOrder(token: string, tests: string[]): Promise<boolean> {
    const normalized = token.startsWith("#") ? token : `#${token}`;
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(`investigations_${normalized}`, JSON.stringify(tests));
    }

    if (!IS_MOCK_API) {
      try {
        const cleanToken = normalized.replace(/^#/, "");
        await apiClient.post(`/investigations/order/${cleanToken}`, { tests });
      } catch (err) {
        console.warn("Backend investigation order call failed, stored locally:", err);
      }
    }
    return true;
  },

  async getInvestigationOrder(token: string): Promise<string[]> {
    const normalized = token.startsWith("#") ? token : `#${token}`;
    if (typeof window !== "undefined") {
      try {
        const stored = window.sessionStorage.getItem(`investigations_${normalized}`);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  },

  async savePrescription(prescription: PrescriptionData): Promise<boolean> {
    const normalized = prescription.token.startsWith("#") ? prescription.token : `#${prescription.token}`;
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(`prescription_${normalized}`, JSON.stringify(prescription));
    }

    if (!IS_MOCK_API) {
      try {
        const cleanToken = normalized.replace(/^#/, "");
        await apiClient.post(`/prescription/create/${cleanToken}`, prescription);
      } catch (err) {
        console.warn("Backend prescription save call failed, stored locally:", err);
      }
    }
    return true;
  },

  async getPrescription(token: string): Promise<PrescriptionData | null> {
    const normalized = token.startsWith("#") ? token : `#${token}`;
    if (typeof window !== "undefined") {
      try {
        const stored = window.sessionStorage.getItem(`prescription_${normalized}`);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return null;
  },

  async finalizeConsultation(token: string): Promise<boolean> {
    const normalized = token.startsWith("#") ? token : `#${token}`;
    // Update local queue patient status to completed
    await dashboardService.updatePatientStatus(normalized, "completed");

    if (!IS_MOCK_API) {
      try {
        const cleanToken = normalized.replace(/^#/, "");
        await apiClient.post(`/consultation/${cleanToken}/finalize`);
      } catch (err) {
        console.warn("Backend consultation finalization call failed, completed locally:", err);
      }
    }
    return true;
  },
};
