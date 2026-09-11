/** Prescription types */

export interface PrescriptionMedication {
  medicationId?: string;
  medicineName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  route?: string;
  instructions: string;
}

export interface Prescription {
  prescriptionId: string;
  patientId: string;
  appointmentId?: string;
  queueToken?: string;
  doctorId: string;
  doctorName: string;
  medications: PrescriptionMedication[];
  diagnoses?: string[];
  notes?: string;
  followUpDate?: string;
  issuedAt: string;
}
