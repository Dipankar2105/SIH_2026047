/**
 * Document Upload Service — Patient Web
 *
 * Endpoints (FastAPI):
 *   POST /documents/upload                      — upload a document (multipart/form-data)
 *   GET  /documents/patient/{patientId}         — list patient's documents
 *   GET  /documents/{documentId}                — get single document metadata
 *   DELETE /documents/{documentId}              — delete document
 *
 * Preserves existing UI behaviour:
 *   - file picker, filename, preview, loading, success, error
 */

import { patientApiClient, IS_MOCK } from "./client";
import type { PatientDocument, DocumentUploadResponse, DocumentType } from "../../types/document";

// ─── Mock data ─────────────────────────────────────────────────────────────

const MOCK_DOCUMENTS: PatientDocument[] = [
  {
    documentId: "doc-001",
    patientId: "pt-001",
    type: "lab_report",
    filename: "blood_report_aug2026.pdf",
    mimeType: "application/pdf",
    sizeBytes: 245000,
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Complete blood count report",
  },
  {
    documentId: "doc-002",
    patientId: "pt-001",
    type: "prescription",
    filename: "prescription_jul2026.pdf",
    mimeType: "application/pdf",
    sizeBytes: 125000,
    uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Prescription from previous visit",
  },
];

// ─── Service ───────────────────────────────────────────────────────────────

export const documentService = {
  /**
   * Upload a document file.
   * Real: POST /documents/upload (multipart/form-data)
   *   Fields: file, patientId, type, description (optional)
   */
  async uploadDocument(
    file: File,
    patientId: string,
    type: DocumentType = "other",
    description?: string
  ): Promise<DocumentUploadResponse> {
    if (IS_MOCK) {
      return new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              documentId: `doc-${Date.now()}`,
              filename: file.name,
              url: URL.createObjectURL(file),
              uploadedAt: new Date().toISOString(),
            }),
          800 // Simulate upload delay
        )
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("patient_id", patientId);
    formData.append("type", type);
    if (description) formData.append("description", description);

    // Hard failure in real mode — don't fake success
    return await patientApiClient.upload<DocumentUploadResponse>("/documents/upload", formData);
  },

  /**
   * List all documents for a patient.
   * Real: GET /documents/patient/{patientId}
   */
  async listDocuments(patientId: string): Promise<PatientDocument[]> {
    if (IS_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_DOCUMENTS), 300));
    }

    try {
      return await patientApiClient.get<PatientDocument[]>(`/documents/patient/${patientId}`);
    } catch (err) {
      console.warn("Failed to list documents:", err);
      return MOCK_DOCUMENTS;
    }
  },

  /**
   * Get single document metadata.
   * Real: GET /documents/{documentId}
   */
  async getDocument(documentId: string): Promise<PatientDocument | null> {
    if (IS_MOCK) {
      const doc = MOCK_DOCUMENTS.find((d) => d.documentId === documentId) ?? null;
      return new Promise((resolve) => setTimeout(() => resolve(doc), 200));
    }

    try {
      return await patientApiClient.get<PatientDocument>(`/documents/${documentId}`);
    } catch (err) {
      console.warn("Failed to get document:", err);
      return null;
    }
  },

  /**
   * Delete a document.
   * Real: DELETE /documents/{documentId}
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    if (IS_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(true), 300));
    }

    try {
      await patientApiClient.delete(`/documents/${documentId}`);
      return true;
    } catch (err) {
      console.error("Failed to delete document:", err);
      throw err;
    }
  },
};
