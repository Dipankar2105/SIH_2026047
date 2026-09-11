/**
 * Intake Service — Patient Web
 *
 * Endpoints (FastAPI):
 *   POST /intake/session/start              — start intake session for a patient/appointment
 *   POST /intake/answer                     — submit answer, get next question
 *   GET  /intake/session/{sessionId}        — get current session status
 *   GET  /intake/session/{sessionId}/summary — completed intake summary
 *
 * Backend is authoritative for:
 *   - question ordering and adaptive progression
 *   - safety/red flag detection
 *
 * Frontend never duplicates clinical logic.
 */

import { patientApiClient, IS_MOCK } from "./client";
import type {
  IntakeSession,
  IntakeQuestion,
  IntakeSubmitRequest,
  IntakeNextResponse,
} from "../../types/intake";

// ─── Mock data ─────────────────────────────────────────────────────────────

const MOCK_QUESTIONS: IntakeQuestion[] = [
  {
    questionId: "q1",
    sessionId: "mock-session",
    text: "What is your main complaint today?",
    type: "text",
    required: true,
    category: "chief_complaint",
    sequence: 1,
  },
  {
    questionId: "q2",
    sessionId: "mock-session",
    text: "How long have you been experiencing this?",
    type: "single_choice",
    options: ["Less than a day", "1-3 days", "4-7 days", "More than a week"],
    required: true,
    category: "duration",
    sequence: 2,
  },
  {
    questionId: "q3",
    sessionId: "mock-session",
    text: "How would you rate your pain on a scale of 1-10?",
    type: "scale",
    required: true,
    category: "severity",
    sequence: 3,
  },
  {
    questionId: "q4",
    sessionId: "mock-session",
    text: "Do you have any of the following symptoms?",
    type: "multi_choice",
    options: ["Fever", "Nausea/Vomiting", "Breathlessness", "Chest pain", "Dizziness", "None of the above"],
    required: false,
    category: "associated_symptoms",
    sequence: 4,
  },
  {
    questionId: "q5",
    sessionId: "mock-session",
    text: "Do you have any known allergies?",
    type: "yes_no",
    required: true,
    category: "allergies",
    sequence: 5,
  },
];

let mockQuestionIdx = 0;

// ─── Service ───────────────────────────────────────────────────────────────

export const intakeService = {
  /**
   * Start a new intake session.
   * Real: POST /intake/session/start
   */
  async startSession(data: {
    patientId: string;
    appointmentId?: string;
    language?: string;
  }): Promise<IntakeSession> {
    if (IS_MOCK) {
      mockQuestionIdx = 0;
      const session: IntakeSession = {
        sessionId: `mock-session-${Date.now()}`,
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        status: "active",
        currentQuestion: MOCK_QUESTIONS[0],
        answeredCount: 0,
        startedAt: new Date().toISOString(),
      };
      if (typeof window !== "undefined") {
        sessionStorage.setItem("intake_session_id", session.sessionId);
        sessionStorage.setItem("intake_session", JSON.stringify(session));
      }
      return new Promise((resolve) => setTimeout(() => resolve(session), 300));
    }

    const session = await patientApiClient.post<IntakeSession>("/intake/session/start", data);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("intake_session_id", session.sessionId);
      sessionStorage.setItem("intake_session", JSON.stringify(session));
    }
    return session;
  },

  /**
   * Submit an answer and get the next question.
   * Real: POST /intake/answer
   * Backend returns next question (adaptive) and whether safety flag raised.
   */
  async submitAnswer(request: IntakeSubmitRequest): Promise<IntakeNextResponse> {
    if (IS_MOCK) {
      mockQuestionIdx++;
      const nextQuestion = MOCK_QUESTIONS[mockQuestionIdx] ?? null;
      const completed = mockQuestionIdx >= MOCK_QUESTIONS.length;

      // Mock red-flag detection: if answer contains "chest pain"
      const answerStr = String(request.answer).toLowerCase();
      const safetyFlagRaised =
        answerStr.includes("chest pain") || answerStr.includes("breathlessness");

      return new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              sessionId: request.sessionId,
              nextQuestion,
              completed,
              safetyFlagRaised,
            }),
          200
        )
      );
    }

    return await patientApiClient.post<IntakeNextResponse>("/intake/answer", request);
  },

  /**
   * Get current session status.
   * Real: GET /intake/session/{sessionId}
   */
  async getSession(sessionId: string): Promise<IntakeSession | null> {
    if (IS_MOCK) {
      if (typeof window !== "undefined") {
        try {
          const stored = sessionStorage.getItem("intake_session");
          if (stored) return JSON.parse(stored) as IntakeSession;
        } catch { /* continue */ }
      }
      return null;
    }

    try {
      return await patientApiClient.get<IntakeSession>(`/intake/session/${sessionId}`);
    } catch (err) {
      console.warn("Failed to get intake session:", err);
      return null;
    }
  },

  /**
   * Get the locally stored session ID.
   */
  getLocalSessionId(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("intake_session_id");
  },

  /**
   * Get intake summary (after completion).
   * Real: GET /intake/session/{sessionId}/summary
   */
  async getSessionSummary(sessionId: string): Promise<{ chiefComplaint: string; symptomsSummary: string } | null> {
    if (IS_MOCK) {
      return new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              chiefComplaint: "General symptoms",
              symptomsSummary:
                "Patient reports symptoms of moderate intensity lasting 1-3 days. Associated with fever and nausea.",
            }),
          300
        )
      );
    }

    try {
      return await patientApiClient.get<{ chiefComplaint: string; symptomsSummary: string }>(
        `/intake/session/${sessionId}/summary`
      );
    } catch (err) {
      console.warn("Failed to get intake summary:", err);
      return null;
    }
  },
};
