import { Patient, Doctor, Appointment } from "@/types";

export const MOCK_PATIENT: Patient = {
  id: "p-101",
  abhaNumber: "91-4491-0021-3312",
  abhaAddress: "sunita.sharma@abdm",
  fullName: "Sunita Sharma",
  gender: "female",
  dob: "1988-04-12",
  mobileNumber: "9876543210",
  bloodGroup: "B+",
};

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Rajesh Varma",
    specialty: "Kayachikitsa (General Medicine)",
    department: "OPD 1",
    cabin: "Cabin 102",
    isAvailable: true,
  },
  {
    id: "doc-2",
    name: "Dr. Priya Deshmukh",
    specialty: "Panchakarma",
    department: "OPD 2",
    cabin: "Cabin 105",
    isAvailable: true,
  },
  {
    id: "doc-3",
    name: "Dr. Arvind Hegde",
    specialty: "Shalya Tantra (Surgery & Ortho)",
    department: "OPD 3",
    cabin: "Cabin 108",
    isAvailable: false,
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-1",
    tokenNumber: "TK-101",
    patientId: "p-101",
    patientName: "Sunita Sharma",
    doctorId: "doc-1",
    doctorName: "Dr. Rajesh Varma",
    scheduledTime: "10:30 AM",
    status: "in_waiting",
    priority: "normal",
    chiefComplaint: "Mild fever and sore throat for 2 days",
  },
  {
    id: "apt-2",
    tokenNumber: "TK-102",
    patientId: "p-102",
    patientName: "Ramesh Patil",
    doctorId: "doc-1",
    doctorName: "Dr. Rajesh Varma",
    scheduledTime: "10:45 AM",
    status: "in_waiting",
    priority: "critical",
    chiefComplaint: "Acute chest discomfort and shortness of breath",
  },
  {
    id: "apt-3",
    tokenNumber: "TK-103",
    patientId: "p-103",
    patientName: "Ananya Iyer",
    doctorId: "doc-2",
    doctorName: "Dr. Priya Deshmukh",
    scheduledTime: "11:00 AM",
    status: "scheduled",
    priority: "urgent",
    chiefComplaint: "Severe chronic knee inflammation and joint stiffness",
  },
];
