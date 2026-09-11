/** Summary (AI-generated patient history summary) types */

export interface PatientSummary {
  patientId: string;
  appointmentId?: string;
  chiefComplaint: string;
  symptomsSummary: string;
  aiNarrative: string;
  redFlagDetected: boolean;
  generatedAt: string;
}
