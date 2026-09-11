export type SupportedLanguage = "en" | "hi" | "mr" | "ta" | "te" | "kn" | "bn";

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export type CarePathwayType = "modern" | "ayush";

export interface PatientProfile {
  id: string;
  abhaNumber: string;
  abhaAddress: string;
  fullName: string;
  gender: "male" | "female" | "other";
  dob: string;
  mobileNumber: string;
  bloodGroup?: string;
  isAbhaVerified: boolean;
  hasGivenConsent: boolean;
  preferredLanguage: SupportedLanguage;
}

export interface MobileOtpRequest {
  mobile: string;
}

export interface MobileOtpResponse {
  txnId: string;
  message: string;
}

export interface MobileOtpVerify {
  txn_id: string;
  otp: string;
  patient_id?: string;
}

export interface ConsentItem {
  id: string;
  title: string;
  description: string;
}

export interface ConsentGrantRequest {
  patient_id: string;
  consent_type: string;
  purpose: string;
  data_categories: string[];
}

export interface ConsentStatusResponse {
  patient_id: string;
  consent_type: string;
  status: "granted" | "revoked" | "none";
}

export interface IntakeQuestionItem {
  id: string;
  key: string;
  text: string;
  field: string;
  type: string;
}

export interface IntakeQuestionsResponse {
  language: string;
  questions: IntakeQuestionItem[];
}

export interface IntakeMessageRequest {
  message: string;
  language?: string;
  step?: number;
  session_id?: string;
}

export interface IntakeMessageResponse {
  reply: string;
  is_urgent: boolean;
  triage_priority: "normal" | "urgent" | "emergency";
  next_step: number;
  next_question?: string | null;
  recommended_specialty?: string | null;
}

export type ChatSender = "bot" | "user" | "system";

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  text: string;
  timestamp: string;
  chips?: string[];
  isAudioAvailable?: boolean;
}

export type ChatIntakeStage =
  | "CHIEF_COMPLAINT"
  | "MESSAGE_SENT"
  | "PAIN_LOCATION"
  | "PAIN_CHARACTER"
  | "ASSOCIATED_SYMPTOMS"
  | "FINAL_CONFIRMATION"
  | "EMERGENCY_ALERT";

export type DocumentCategory =
  | "Lab Report"
  | "Prescription"
  | "Scan / X-Ray"
  | "File (History)"
  | "AYUSH File (History)"
  | "Discharge Summary";

export interface HealthRecord {
  id: string;
  title: string;
  category: DocumentCategory;
  provider: string;
  date: string;
  source: "From ABHA" | "Added to AarogyaFlow";
  fileUrl?: string;
  summary?: string;
  fileSize?: string;
}

export interface AppointmentItem {
  id: string;
  department: string;
  hospitalName: string;
  doctorName: string;
  appointmentTime: string;
  tokenNumber: string;
  estimatedWaitMin: number;
  dayCategory: "TODAY" | "TOMORROW" | "UPCOMING";
  dateNumeric?: string;
  status: "waiting" | "in_consultation" | "completed";
}

export interface EmergencyRedFlagAlert {
  patientReportedText: string;
  triggerKeywords: string[];
  severity: "emergency" | "urgent";
  timestamp: string;
}
