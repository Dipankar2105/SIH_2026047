/** Document upload types */

export type DocumentType = "lab_report" | "prescription" | "discharge_summary" | "imaging" | "insurance" | "other";

export interface PatientDocument {
  documentId: string;
  patientId: string;
  type: DocumentType;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  url?: string;
  description?: string;
}

export interface DocumentUploadResponse {
  documentId: string;
  filename: string;
  url: string;
  uploadedAt: string;
}
