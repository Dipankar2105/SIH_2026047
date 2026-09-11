/** Appointment-related types */

export interface TimeSlot {
  slotId: string;
  startTime: string;   // ISO
  endTime: string;     // ISO
  available: boolean;
}

export interface AppointmentRequest {
  patientId: string;
  doctorId: string;
  hospitalId: string;
  specialtyId?: string;
  slotId: string;
  chiefComplaint: string;
  notes?: string;
}

export interface Appointment {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  specialty: string;
  scheduledAt: string;   // ISO
  status: "scheduled" | "confirmed" | "in-queue" | "completed" | "cancelled";
  queueToken?: string;   // "#42" assigned at check-in
  chiefComplaint: string;
  notes?: string;
  createdAt: string;
}
