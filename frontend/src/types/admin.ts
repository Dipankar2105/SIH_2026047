export type DoctorStatus = "FREE" | "BUSY" | "HOLIDAY";

export type AlertPriority = "P1-HIGH" | "P2-MEDIUM";

export type AlertStatus = "UNASSIGNED" | "ACTIVE" | "RESOLVED";

export type QueuePriority = "RED FLAG" | "URGENT" | "ROUTINE";

export type QueueStatus = "waiting" | "in_consultation" | "completed" | "cancelled";

export interface HospitalDashboard {
  hospital_id: string;
  hospital_name: string;
  fleet_status: Record<string, number>;
  queue_stats: Record<string, number>;
  daily_analytics: Record<string, number | null>;
}

export interface BackendDoctor {
  id: string;
  hospital_id: string;
  name: string;
  specialization: string;
  qualification?: string | null;
  phone?: string | null;
  email?: string | null;
  bio?: string | null;
  previously_visited?: boolean;
  last_visit_date?: string | null;
  status?: DoctorStatus | string | null;
  room?: string | null;
}

export interface AdminDoctor {
  id: string;
  name: string;
  department: string;
  status: DoctorStatus;
  currentPatient: string;
  note: string;
  room: string;
}

export interface BackendRedFlag {
  id: string;
  session_id: string;
  flag_type: string;
  description?: string | null;
  severity: string;
  triggered: boolean;
}

export interface AdminAlert {
  id: string;
  redFlagId: string;
  appointmentId: string;
  patientName: string;
  age: number;
  sex: "M" | "F" | "OTHER";
  token: string;
  priority: AlertPriority;
  status: AlertStatus;
  description: string;
  concern: string;
  time: string;
  department: string;
  assignedStaff?: string;
}

export interface MedicalStaff {
  id: string;
  name: string;
  role: "Nurse" | "Compounder" | "Clinical Support";
  available: boolean;
}

export interface BackendQueueItem {
  appointment_id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  hospital_id: string;
  queue_position: number;
  status: QueueStatus;
  created_at: string;
}

export interface AdminQueueItem {
  appointmentId: string;
  token: string;
  patientName: string;
  department: string;
  doctorName: string;
  priority: QueuePriority;
  status: QueueStatus;
  waitMinutes: number;
  room: string;
  redFlag: boolean;
}

export const HOSPITAL_ID = "123e4567-e89b-12d3-a456-426614174000";

export const ADMIN_SESSION_KEY = "aarogyaflow_admin_session";
export const MOCK_ADMIN_TOKEN = "mock-admin-token";

export interface HospitalOption {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
}

export interface AdminSession {
  hospital_id: string;
  hospital_name: string;
  receptionist_name: string;
  token: string;
}

export const FALLBACK_HOSPITALS: HospitalOption[] = [
  {
    id: HOSPITAL_ID,
    name: "All India Institute of Ayurveda (AIIA)",
    city: "New Delhi",
    state: "Delhi",
  },
];

function isValidAdminSession(value: unknown): value is AdminSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<AdminSession>;
  return Boolean(
    session.hospital_id &&
      session.hospital_name &&
      session.receptionist_name &&
      session.token
  );
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidAdminSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveAdminSession(session: Omit<AdminSession, "token"> & { token?: string }) {
  const adminSession: AdminSession = {
    hospital_id: session.hospital_id,
    hospital_name: session.hospital_name,
    receptionist_name: session.receptionist_name,
    token: session.token || MOCK_ADMIN_TOKEN,
  };
  window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminSession));
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function getAdminHospitalId() {
  return getAdminSession()?.hospital_id || HOSPITAL_ID;
}

export const FALLBACK_DOCTORS: AdminDoctor[] = [
  {
    id: "doctor-ananya",
    name: "Dr. Ananya Sharma",
    department: "Cardiology",
    status: "FREE",
    currentPatient: "Ravi Verma",
    note: "Ready for next token",
    room: "OPD 11",
  },
  {
    id: "doctor-meera",
    name: "Dr. Meera Iyer",
    department: "Pediatrics",
    status: "FREE",
    currentPatient: "Aarav Patel",
    note: "Available after 10:45 AM",
    room: "OPD 7",
  },
  {
    id: "doctor-karan",
    name: "Dr. Karan Singh",
    department: "Orthopedics",
    status: "FREE",
    currentPatient: "Sneha Rao",
    note: "Walk-in slot open",
    room: "OPD 4",
  },
  {
    id: "doctor-neha",
    name: "Dr. Neha Gupta",
    department: "ENT",
    status: "FREE",
    currentPatient: "Meenal Shah",
    note: "Ready for next token",
    room: "OPD 9",
  },
  {
    id: "doctor-sanjay",
    name: "Dr. Sanjay Patil",
    department: "General Medicine",
    status: "FREE",
    currentPatient: "Vikram Jadhav",
    note: "Available now",
    room: "OPD 2",
  },
  {
    id: "doctor-priya",
    name: "Dr. Priya Desai",
    department: "Dermatology",
    status: "FREE",
    currentPatient: "Pooja Kulkarni",
    note: "Next slot in 5 min",
    room: "OPD 12",
  },
  {
    id: "doctor-vikram",
    name: "Dr. Vikram Rao",
    department: "General Medicine",
    status: "BUSY",
    currentPatient: "Suresh Menon",
    note: "Consultation in progress",
    room: "OPD 1",
  },
  {
    id: "doctor-sunita",
    name: "Dr. Sunita Kulkarni",
    department: "Gynecology",
    status: "BUSY",
    currentPatient: "Anjali Nair",
    note: "Expected 12 min",
    room: "OPD 5",
  },
  {
    id: "doctor-arvind",
    name: "Dr. Arvind Joshi",
    department: "Neurology",
    status: "BUSY",
    currentPatient: "Prakash Sawant",
    note: "Assessment ongoing",
    room: "OPD 8",
  },
  {
    id: "doctor-ramesh",
    name: "Dr. Ramesh Nair",
    department: "Pulmonology",
    status: "BUSY",
    currentPatient: "Deepak Shetty",
    note: "Expected 8 min",
    room: "OPD 6",
  },
  {
    id: "doctor-kavita",
    name: "Dr. Kavita Reddy",
    department: "Radiology",
    status: "HOLIDAY",
    currentPatient: "On leave",
    note: "Returns tomorrow",
    room: "Diagnostic Block",
  },
  {
    id: "doctor-manoj",
    name: "Dr. Manoj Mehta",
    department: "Psychiatry",
    status: "HOLIDAY",
    currentPatient: "On leave",
    note: "Scheduled off today",
    room: "Behavioral Health",
  },
];

export const FALLBACK_ALERTS: AdminAlert[] = [
  {
    id: "alert-1042",
    redFlagId: "red-flag-1042",
    appointmentId: "11111111-1111-1111-1111-111111111111",
    patientName: "Aarti Deshpande",
    age: 58,
    sex: "F",
    token: "A-1042",
    priority: "P1-HIGH",
    status: "UNASSIGNED",
    description: "Patient-reported severe chest discomfort with shortness of breath during intake.",
    concern: "Patient-reported severe chest discomfort with shortness of breath. Symptoms began 40 minutes ago and are accompanied by sweating and mild dizziness.",
    time: "4 min ago",
    department: "Emergency",
  },
  {
    id: "alert-1039",
    redFlagId: "red-flag-1039",
    appointmentId: "22222222-2222-2222-2222-222222222222",
    patientName: "Mohan Rao",
    age: 64,
    sex: "M",
    token: "A-1039",
    priority: "P1-HIGH",
    status: "ACTIVE",
    description: "Sudden left-sided weakness and difficulty speaking reported at kiosk check-in.",
    concern: "Sudden left-sided weakness, facial droop, and difficulty speaking. Last known normal approximately 90 minutes ago.",
    time: "11 min ago",
    department: "Neurology",
    assignedStaff: "Nurse Meera",
  },
  {
    id: "alert-1035",
    redFlagId: "red-flag-1035",
    appointmentId: "33333333-3333-3333-3333-333333333333",
    patientName: "Sunita Pawar",
    age: 47,
    sex: "F",
    token: "A-1035",
    priority: "P2-MEDIUM",
    status: "UNASSIGNED",
    description: "Persistent abdominal pain with vomiting for the past six hours.",
    concern: "Persistent abdominal pain with repeated vomiting. Pain is localized to the upper abdomen and rated 7 out of 10.",
    time: "18 min ago",
    department: "General Medicine",
  },
  {
    id: "alert-1031",
    redFlagId: "red-flag-1031",
    appointmentId: "44444444-4444-4444-4444-444444444444",
    patientName: "Ramesh Kumar",
    age: 72,
    sex: "M",
    token: "A-1031",
    priority: "P1-HIGH",
    status: "ACTIVE",
    description: "Severe breathlessness and persistent cough reported during clinical intake.",
    concern: "Severe breathlessness at rest with persistent cough and bluish lips. Oxygen saturation reading was below the safe threshold.",
    time: "24 min ago",
    department: "Pulmonology",
    assignedStaff: "Clinical Support Dinesh",
  },
  {
    id: "alert-1028",
    redFlagId: "red-flag-1028",
    appointmentId: "55555555-5555-5555-5555-555555555555",
    patientName: "Laxmi Shah",
    age: 39,
    sex: "F",
    token: "A-1028",
    priority: "P2-MEDIUM",
    status: "ACTIVE",
    description: "High fever with neck stiffness and sensitivity to light.",
    concern: "High fever with neck stiffness, headache, and sensitivity to light. Symptoms have worsened over the last 24 hours.",
    time: "31 min ago",
    department: "Infectious Disease",
    assignedStaff: "Compounder Raj",
  },
  {
    id: "alert-1024",
    redFlagId: "red-flag-1024",
    appointmentId: "66666666-6666-6666-6666-666666666666",
    patientName: "Anil Mehta",
    age: 55,
    sex: "M",
    token: "A-1024",
    priority: "P2-MEDIUM",
    status: "UNASSIGNED",
    description: " Chest pain on exertion with a history of uncontrolled diabetes.",
    concern: "Chest tightness on exertion that improves with rest. Patient has a history of diabetes and hypertension.",
    time: "38 min ago",
    department: "Cardiology",
  },
  {
    id: "alert-1021",
    redFlagId: "red-flag-1021",
    appointmentId: "77777777-7777-7777-7777-777777777777",
    patientName: "Pooja Jain",
    age: 29,
    sex: "F",
    token: "A-1021",
    priority: "P2-MEDIUM",
    status: "ACTIVE",
    description: "Severe allergic reaction with facial swelling after medication.",
    concern: "Facial swelling, hives, and throat tightness after taking a new medication. Symptoms started 20 minutes ago.",
    time: "46 min ago",
    department: "Emergency",
    assignedStaff: "Nurse Meera",
  },
  {
    id: "alert-1018",
    redFlagId: "red-flag-1018",
    appointmentId: "88888888-8888-8888-8888-888888888888",
    patientName: "Vijay Singh",
    age: 61,
    sex: "M",
    token: "A-1018",
    priority: "P1-HIGH",
    status: "RESOLVED",
    description: "Uncontrolled bleeding from a forearm laceration.",
    concern: "Uncontrolled bleeding from a forearm laceration. Bleeding was controlled after immediate clinical support.",
    time: "52 min ago",
    department: "Emergency",
    assignedStaff: "Clinical Support Dinesh",
  },
  {
    id: "alert-1014",
    redFlagId: "red-flag-1014",
    appointmentId: "99999999-9999-9999-9999-999999999999",
    patientName: "Kavita Joshi",
    age: 43,
    sex: "F",
    token: "A-1014",
    priority: "P2-MEDIUM",
    status: "RESOLVED",
    description: "Persistent vomiting with signs of dehydration.",
    concern: "Persistent vomiting with dizziness and dry mouth. Oral rehydration and assessment were completed.",
    time: "1 hr ago",
    department: "General Medicine",
    assignedStaff: "Compounder Raj",
  },
];

export const MEDICAL_STAFF: MedicalStaff[] = [
  { id: "staff-meera", name: "Nurse Meera", role: "Nurse", available: true },
  { id: "staff-raj", name: "Compounder Raj", role: "Compounder", available: true },
  { id: "staff-dinesh", name: "Clinical Support Dinesh", role: "Clinical Support", available: true },
];

export const FALLBACK_QUEUE: AdminQueueItem[] = [
  {
    appointmentId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    token: "A-1042",
    patientName: "Aarti Deshpande",
    department: "Emergency",
    doctorName: "Dr. Ananya Sharma",
    priority: "RED FLAG",
    status: "waiting",
    waitMinutes: 0,
    room: "Emergency Bay 1",
    redFlag: true,
  },
  {
    appointmentId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    token: "A-1039",
    patientName: "Mohan Rao",
    department: "Neurology",
    doctorName: "Dr. Arvind Joshi",
    priority: "RED FLAG",
    status: "in_consultation",
    waitMinutes: 0,
    room: "OPD 8",
    redFlag: true,
  },
  {
    appointmentId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    token: "A-1035",
    patientName: "Sunita Pawar",
    department: "General Medicine",
    doctorName: "Dr. Vikram Rao",
    priority: "URGENT",
    status: "waiting",
    waitMinutes: 6,
    room: "OPD 1",
    redFlag: false,
  },
  {
    appointmentId: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    token: "A-1031",
    patientName: "Ramesh Kumar",
    department: "Pulmonology",
    doctorName: "Dr. Ramesh Nair",
    priority: "RED FLAG",
    status: "waiting",
    waitMinutes: 2,
    room: "OPD 6",
    redFlag: true,
  },
  {
    appointmentId: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    token: "A-1028",
    patientName: "Laxmi Shah",
    department: "Infectious Disease",
    doctorName: "Dr. Sanjay Patil",
    priority: "URGENT",
    status: "waiting",
    waitMinutes: 11,
    room: "OPD 2",
    redFlag: false,
  },
  {
    appointmentId: "ffffffff-ffff-ffff-ffff-ffffffffffff",
    token: "A-1024",
    patientName: "Anil Mehta",
    department: "Cardiology",
    doctorName: "Dr. Ananya Sharma",
    priority: "URGENT",
    status: "waiting",
    waitMinutes: 14,
    room: "OPD 11",
    redFlag: false,
  },
  {
    appointmentId: "12121212-1212-1212-1212-121212121212",
    token: "A-1021",
    patientName: "Pooja Jain",
    department: "Emergency",
    doctorName: "Dr. Ananya Sharma",
    priority: "URGENT",
    status: "in_consultation",
    waitMinutes: 0,
    room: "Emergency Bay 2",
    redFlag: false,
  },
  {
    appointmentId: "13131313-1313-1313-1313-131313131313",
    token: "A-1018",
    patientName: "Vijay Singh",
    department: "Emergency",
    doctorName: "Dr. Ananya Sharma",
    priority: "ROUTINE",
    status: "completed",
    waitMinutes: 0,
    room: "Emergency Bay 1",
    redFlag: false,
  },
  {
    appointmentId: "14141414-1414-1414-1414-141414141414",
    token: "A-1014",
    patientName: "Kavita Joshi",
    department: "General Medicine",
    doctorName: "Dr. Vikram Rao",
    priority: "ROUTINE",
    status: "completed",
    waitMinutes: 0,
    room: "OPD 1",
    redFlag: false,
  },
  {
    appointmentId: "15151515-1515-1515-1515-151515151515",
    token: "A-1011",
    patientName: "Nikhil Patil",
    department: "Orthopedics",
    doctorName: "Dr. Karan Singh",
    priority: "ROUTINE",
    status: "waiting",
    waitMinutes: 22,
    room: "OPD 4",
    redFlag: false,
  },
];
