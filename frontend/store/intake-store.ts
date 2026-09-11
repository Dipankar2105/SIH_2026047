/**
 * Intake Store — Patient Web
 * Tracks the state of the current intake session across the intake flow.
 */

import type { IntakeSession, IntakeQuestion, IntakeAnswer } from "../types/intake";

export interface IntakeState {
  sessionId: string | null;
  session: IntakeSession | null;
  currentQuestion: IntakeQuestion | null;
  answers: IntakeAnswer[];
  isLoading: boolean;
  isComplete: boolean;
  safetyFlagRaised: boolean;
  error: string | null;
}

const STATE: IntakeState = {
  sessionId: null,
  session: null,
  currentQuestion: null,
  answers: [],
  isLoading: false,
  isComplete: false,
  safetyFlagRaised: false,
  error: null,
};

const listeners = new Set<() => void>();
function notify() { listeners.forEach((fn) => fn()); }

export const intakeStore = {
  getState(): IntakeState { return { ...STATE, answers: [...STATE.answers] }; },

  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  setSession(session: IntakeSession): void {
    STATE.session = session;
    STATE.sessionId = session.sessionId;
    STATE.currentQuestion = session.currentQuestion;
    STATE.answers = [];
    STATE.isComplete = false;
    STATE.safetyFlagRaised = false;
    notify();
  },

  setCurrentQuestion(question: IntakeQuestion | null): void {
    STATE.currentQuestion = question;
    notify();
  },

  addAnswer(answer: IntakeAnswer): void {
    STATE.answers.push(answer);
    notify();
  },

  setComplete(flag: boolean): void {
    STATE.isComplete = flag;
    notify();
  },

  setSafetyFlag(flag: boolean): void {
    STATE.safetyFlagRaised = flag;
    notify();
  },

  setLoading(loading: boolean): void {
    STATE.isLoading = loading;
    notify();
  },

  setError(error: string | null): void {
    STATE.error = error;
    notify();
  },

  reset(): void {
    STATE.sessionId = null;
    STATE.session = null;
    STATE.currentQuestion = null;
    STATE.answers = [];
    STATE.isLoading = false;
    STATE.isComplete = false;
    STATE.safetyFlagRaised = false;
    STATE.error = null;
    notify();
  },
};
