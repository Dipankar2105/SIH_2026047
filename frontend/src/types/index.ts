export type UserRole = "patient" | "doctor" | "kiosk" | "admin";

export type TriagePriority = "normal" | "urgent" | "critical";

export interface Patient {
  id: string;
  abhaNumber?: string;
  abhaAddress?: string;
  fullName: string;
  gender: "male" | "female" | "other";
  dob: string;
  mobileNumber: string;
  bloodGroup?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  cabin: string;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  tokenNumber: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  scheduledTime: string;
  status: "scheduled" | "in_waiting" | "in_consultation" | "completed" | "cancelled";
  priority: TriagePriority;
  chiefComplaint: string;
}

export interface KioskSession {
  sessionId: string;
  language: string;
  activeStep: number;
  isEmergency: boolean;
  chiefComplaint?: string;
  duration?: string;
  severity?: number;
  existingConditions?: string[];
  currentMedications?: string[];
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
