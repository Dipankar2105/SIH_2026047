/**
 * Constants — Patient Web
 */

export const APP_NAME = "AarogyaFlow";
export const APP_TAGLINE = "Intelligent, multilingual healthcare at your fingertips";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export const IS_MOCK_API =
  process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
];

// Document type labels
export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  lab_report: "Lab Report",
  prescription: "Prescription",
  discharge_summary: "Discharge Summary",
  imaging: "Imaging / Scan",
  insurance: "Insurance Document",
  other: "Other",
};

// Intake question type labels
export const QUESTION_TYPE_LABELS: Record<string, string> = {
  text: "Text",
  number: "Number",
  single_choice: "Single Choice",
  multi_choice: "Multiple Choice",
  scale: "Rating Scale",
  yes_no: "Yes / No",
  voice: "Voice",
};
