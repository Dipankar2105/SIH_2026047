/** Patient identity & profile types */

export interface PatientProfile {
  id: string;
  patientId: string;
  abhaId?: string;
  name: string;
  age: number;
  gender: "M" | "F" | "O";
  dob?: string;
  phone?: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  createdAt: string;
}

export interface AbhaProfile {
  abhaNumber: string;
  name: string;
  gender: string;
  dob: string;
  address?: string;
  mobile?: string;
  email?: string;
}

export interface PatientSession {
  patientId: string;
  abhaId?: string;
  name: string;
  token?: string;    // queue token e.g. "#42"
  appointmentId?: string;
  sessionToken: string;
  expiresAt: string;
}
