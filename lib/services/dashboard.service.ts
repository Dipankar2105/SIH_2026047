export interface DashboardMetrics {
  totalToday: number;
  waiting: number;
  inConsultation: number;
  completed: number;
  averageWaitMinutes: number;
}

export interface QueuePatient {
  id: string;
  token: string;
  name: string;
  age: number;
  gender: string;
  abhaId: string;
  intakeStatus: "linked" | "pending" | "not-linked";
  chiefComplaint: string;
  symptoms: string;
  vitals: {
    bp?: string;
    pulse?: string;
    temperature?: string;
    spo2?: string;
    pain?: string;
  };
  priority: "normal" | "priority";
  redFlagDetected: boolean;
  status: "waiting" | "ready" | "in-consultation" | "completed";
  registeredAt: string;
  doctorNotes?: string;
  abhaConnected?: boolean;
  abhaLabel?: string;
  department?: string;
  room?: string;
  onset?: string;
  duration?: string;
  severity?: string;
  associatedSymptoms?: string[];
  relevantNegatives?: string[];
  pastHistory?: {
    medicalHistory?: string;
    surgicalHistory?: string;
    medications?: string;
    allergies?: string;
    familyHistory?: string;
    personalHistory?: string;
  };
  allergyWarning?: {
    allergen: string;
    reaction: string;
  };
  aiSummary?: string;
  aiChiefComplaintDetail?: string;
  patientVerbatim?: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  priorityAlert: QueuePatient | null;
  nextPatient: QueuePatient | null;
  recentPatients: QueuePatient[];
}

export interface PatientAssessment {
  token: string;
  clinicalNotes: string;
  primaryDiagnosis: {
    label: string;
    icd10: string;
    status: "confirmed" | "ai-suggestion";
    note: string;
  } | null;
  secondaryDiagnoses: Array<{
    label: string;
    icd10: string;
    status: "confirmed" | "ai-suggestion";
    note: string;
  }>;
  dismissedDiagnoses: string[];
  updatedAt: string;
}

export interface DashboardService {
  getDashboardData: () => Promise<DashboardData>;
  getPatientByToken: (token: string) => Promise<QueuePatient | null>;
  getQueuePatients: () => Promise<QueuePatient[]>;
  saveAssessment: (assessment: PatientAssessment) => Promise<boolean>;
  getAssessment: (token: string) => Promise<PatientAssessment | null>;
}

const today = new Date();

function makeDate(hours: number, minutes: number) {
  const d = new Date(today);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

const TEMPORARY_PATIENTS: QueuePatient[] = [
  {
    id: "p1",
    token: "#44",
    name: "Amit Verma",
    age: 58,
    gender: "M",
    abhaId: "ABHA-1234-5678-9012-3456",
    intakeStatus: "pending",
    chiefComplaint: "Acute chest discomfort, SOB",
    symptoms: "Sudden onset chest pain, radiating to left arm, sweating, breathlessness",
    vitals: { pulse: "94" },
    priority: "priority",
    redFlagDetected: true,
    status: "waiting",
    registeredAt: makeDate(9, 0),
    doctorNotes: "History of hypertension. ECG advised.",
  },
  {
    id: "p2",
    token: "#42",
    name: "Rahul S.",
    age: 34,
    gender: "M",
    abhaId: "ABHA-2345-6789-0123-4567",
    intakeStatus: "linked",
    chiefComplaint: "Abdominal pain & cramping",
    symptoms: "Lower abdominal pain with cramping, no nausea",
    vitals: { bp: "122/80", pulse: "76", spo2: "98%", temperature: "98.4°F", pain: "6/10" },
    priority: "normal",
    redFlagDetected: false,
    status: "waiting",
    registeredAt: makeDate(9, 15),
    abhaConnected: true,
    abhaLabel: "rahul34@abdm",
    department: "Modern Medicine",
    room: "OPD Room 14",
    onset: "Yesterday evening",
    duration: "~14 hours",
    severity: "6/10",
    associatedSymptoms: [
      "Mild nausea",
      "One episode of non-billous vomiting",
      "Mild abdominal bloating",
    ],
    relevantNegatives: [
      "No fever",
      "No loose stools",
      "No radiating chest pain",
      "No urinary symptoms",
    ],
    pastHistory: {
      medicalHistory: "No significant past history",
      surgicalHistory: "Appendectomy (2018)",
      medications: "None currently",
      allergies: "Penicillin — rash",
      familyHistory: "Father: IHD",
      personalHistory: "Non-smoker, occasional alcohol",
    },
    allergyWarning: {
      allergen: "Penicillin",
      reaction: "Rash · Patient-reported",
    },
    aiSummary:
      "Patient is a 34-year-old male presenting with abdominal pain and cramping that began yesterday evening after consuming outside food. Pain is rated 6/10, described as burning in the center with cramping. Associated with mild nausea and one episode of non-bilious vomiting. Mild bloating present. No fever, no loose stools.",
    aiChiefComplaintDetail:
      "Onset: Yesterday evening after outside food · Character: burning, cramping · Location: periumbilical",
    patientVerbatim:
      "I felt intense cramping after eating outside food yesterday evening. It burns slightly in the center. I felt sick to my stomach and vomited once in the night. The stomach is slightly swollen also.",
  },
  {
    id: "p3",
    token: "#43",
    name: "Meera Patel",
    age: 52,
    gender: "F",
    abhaId: "ABHA-3456-7890-1234-5678",
    intakeStatus: "linked",
    chiefComplaint: "Bilateral knee pain, stiffness",
    symptoms: "Pain in both knees, morning stiffness, difficulty climbing stairs",
    vitals: { bp: "138/86" },
    priority: "normal",
    redFlagDetected: false,
    status: "waiting",
    registeredAt: makeDate(9, 30),
  },
  {
    id: "p4",
    token: "#45",
    name: "Sunita Roy",
    age: 29,
    gender: "F",
    abhaId: "ABHA-4567-8901-2345-6789",
    intakeStatus: "pending",
    chiefComplaint: "Fever with cough, 3 days",
    symptoms: "Fever 101.2°F, dry cough, throat pain, body ache",
    vitals: { temperature: "101.2°F" },
    priority: "normal",
    redFlagDetected: false,
    status: "waiting",
    registeredAt: makeDate(9, 45),
  },
  {
    id: "p5",
    token: "#46",
    name: "Deepak Joshi",
    age: 67,
    gender: "M",
    abhaId: "ABHA-5678-9012-3456-7890",
    intakeStatus: "pending",
    chiefComplaint: "Exertional breathlessness",
    symptoms: "Shortness of breath on walking, chest tightness on exertion",
    vitals: { spo2: "94%" },
    priority: "normal",
    redFlagDetected: false,
    status: "waiting",
    registeredAt: makeDate(10, 0),
  },
  {
    id: "p6",
    token: "#40",
    name: "Priya Menon",
    age: 38,
    gender: "F",
    abhaId: "ABHA-6789-0123-4567-8901",
    intakeStatus: "linked",
    chiefComplaint: "Migraine headache",
    symptoms: "Severe unilateral headache with photophobia",
    vitals: { bp: "118/76" },
    priority: "normal",
    redFlagDetected: false,
    status: "completed",
    registeredAt: makeDate(8, 0),
    doctorNotes: "Prescribed naproxen. Follow-up in 2 weeks.",
  },
  {
    id: "p7",
    token: "#41",
    name: "Vijay Kumar",
    age: 45,
    gender: "M",
    abhaId: "ABHA-7890-1234-5678-9012",
    intakeStatus: "linked",
    chiefComplaint: "Type 2 DM follow-up",
    symptoms: "Routine follow-up for diabetes management",
    vitals: { bp: "135/85" },
    priority: "normal",
    redFlagDetected: false,
    status: "completed",
    registeredAt: makeDate(8, 30),
    doctorNotes: "HbA1c 7.8. Continue metformin.",
  },
  {
    id: "p8",
    token: "#47",
    name: "Anita Desai",
    age: 41,
    gender: "F",
    abhaId: "ABHA-8901-2345-6789-0123",
    intakeStatus: "linked",
    chiefComplaint: "Thyroid dysfunction follow-up",
    symptoms: "Fatigue, weight gain, cold intolerance",
    vitals: { bp: "128/82" },
    priority: "normal",
    redFlagDetected: false,
    status: "ready",
    registeredAt: makeDate(10, 15),
  },
  {
    id: "p9",
    token: "#04",
    name: "Priya Sharma",
    age: 45,
    gender: "F",
    abhaId: "ABHA-9012-3456-7890-1234",
    intakeStatus: "pending",
    chiefComplaint: "Severe abdominal pain, vomiting",
    symptoms: "Acute abdominal pain with vomiting, patient appears distressed",
    vitals: { bp: "145/95", pulse: "108" },
    priority: "priority",
    redFlagDetected: true,
    status: "waiting",
    registeredAt: makeDate(10, 30),
    doctorNotes: "Possible surgical emergency. Surgical review advised.",
  },
];

for (let i = 10; i <= 24; i++) {
  const isInConsultation = i === 18;
  const isCompleted = i >= 19;
  const isPriority = i === 10;
  const status: QueuePatient["status"] = isInConsultation
    ? "in-consultation"
    : isCompleted
      ? "completed"
      : "waiting";

  TEMPORARY_PATIENTS.push({
    id: `p${i}`,
    token: `#${String(i).padStart(2, "0")}`,
    name: [
      "Kavita Joshi",
      "Rahul Verma",
      "Anjali Mehta",
      "Vikram Patel",
      "Sneha Reddy",
      "Arjun Singh",
      "Pooja Nair",
      "Ramesh Iyer",
      "Divya Kapoor",
    ][i - 9] || `Patient ${i}`,
    age: 25 + (i % 40),
    gender: i % 3 === 0 ? "F" : "M",
    abhaId: `ABHA-${String(1000 + i).padStart(4, "0")}-5678-9012-3456`,
    intakeStatus: i % 4 === 0 ? "pending" : "linked",
    chiefComplaint: [
      "General checkup",
      "Skin rash and itching",
      "Joint pain",
      "Follow-up visit",
      "Fever and body ache",
      "Chest tightness",
      "Abdominal discomfort",
      "Respiratory infection",
      "Migraine",
    ][i - 9] || "Routine OPD visit",
    symptoms: "Patient reports symptoms for routine evaluation",
    vitals: {
      bp: `${110 + (i % 30)}/${70 + (i % 20)}`,
    },
    priority: isPriority ? "priority" : "normal",
    redFlagDetected: isPriority,
    status,
    registeredAt: makeDate(7 + (i % 12), (i * 7) % 60),
    doctorNotes: isCompleted ? "Follow-up scheduled." : undefined,
  });
}

export const dashboardService = {
  getDashboardData(): Promise<DashboardData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const waiting = TEMPORARY_PATIENTS.filter((p) => p.status === "waiting");
        const inConsultation = TEMPORARY_PATIENTS.filter(
          (p) => p.status === "in-consultation"
        );
        const completed = TEMPORARY_PATIENTS.filter(
          (p) => p.status === "completed"
        );
        const priorityPatients = waiting.filter(
          (p) => p.priority === "priority" || p.redFlagDetected
        );

        const nextPatient =
          TEMPORARY_PATIENTS.find((p) => p.token === "#42") ??
          waiting[0] ??
          null;
        const priorityAlert = priorityPatients[0] ?? null;

        resolve({
          metrics: {
            totalToday: TEMPORARY_PATIENTS.length,
            waiting: waiting.length,
            inConsultation: inConsultation.length,
            completed: completed.length,
            averageWaitMinutes: 22,
          },
          priorityAlert,
          nextPatient,
          recentPatients: [...inConsultation, ...completed].slice(0, 6),
        });
      }, 400);
    });
  },

  getPatientByToken(token: string): Promise<QueuePatient | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const normalized = token.startsWith("#") ? token : `#${token}`;
        resolve(TEMPORARY_PATIENTS.find((p) => p.token === normalized) ?? null);
      }, 200);
    });
  },

  getQueuePatients(): Promise<QueuePatient[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...TEMPORARY_PATIENTS]);
      }, 300);
    });
  },

  saveAssessment(assessment: PatientAssessment): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const normalized = assessment.token.startsWith("#") ? assessment.token : `#${assessment.token}`;
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(`assessment_${normalized}`, JSON.stringify(assessment));
          }
          // Also update doctorNotes on matching TEMPORARY_PATIENTS entry if present
          const p = TEMPORARY_PATIENTS.find((item) => item.token === normalized);
          if (p) {
            p.doctorNotes = assessment.clinicalNotes;
          }
          resolve(true);
        } catch (err) {
          reject(err);
        }
      }, 200);
    });
  },

  getAssessment(token: string): Promise<PatientAssessment | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const normalized = token.startsWith("#") ? token : `#${token}`;
        if (typeof window !== "undefined") {
          try {
            const stored = window.sessionStorage.getItem(`assessment_${normalized}`);
            if (stored) {
              resolve(JSON.parse(stored));
              return;
            }
          } catch {}
        }
        resolve(null);
      }, 150);
    });
  },
};
