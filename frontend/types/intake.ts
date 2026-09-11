/** Intake question/answer types */

export type QuestionType = "text" | "number" | "single_choice" | "multi_choice" | "scale" | "yes_no" | "voice";

export interface IntakeQuestion {
  questionId: string;
  sessionId: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  category?: string;
  followUpOf?: string;
  sequence: number;
}

export interface IntakeAnswer {
  questionId: string;
  answer: string | string[] | number | boolean;
  answeredAt: string;
}

export interface IntakeSession {
  sessionId: string;
  patientId: string;
  appointmentId?: string;
  status: "active" | "completed" | "abandoned";
  currentQuestion: IntakeQuestion | null;
  answeredCount: number;
  startedAt: string;
  completedAt?: string;
}

export interface IntakeSubmitRequest {
  sessionId: string;
  questionId: string;
  answer: string | string[] | number | boolean;
}

export interface IntakeNextResponse {
  sessionId: string;
  nextQuestion: IntakeQuestion | null;
  completed: boolean;
  safetyFlagRaised: boolean;
}
