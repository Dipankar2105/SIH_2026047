/**
 * useIntake — Patient Web
 * React hook for managing the intake question/answer flow.
 */
import { useState, useEffect, useCallback } from "react";
import { intakeStore } from "../store/intake-store";
import { intakeService } from "../services/api/intake";
import { safetyService } from "../services/api/safety";
import type { IntakeAnswer } from "../types/intake";

export function useIntake(patientId: string, appointmentId?: string) {
  const [state, setState] = useState(intakeStore.getState());

  useEffect(() => {
    return intakeStore.subscribe(() => setState(intakeStore.getState()));
  }, []);

  const startSession = useCallback(async (language?: string) => {
    intakeStore.setLoading(true);
    intakeStore.setError(null);
    try {
      const session = await intakeService.startSession({ patientId, appointmentId, language });
      intakeStore.setSession(session);
      return session;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start intake";
      intakeStore.setError(msg);
      throw err;
    } finally {
      intakeStore.setLoading(false);
    }
  }, [patientId, appointmentId]);

  const submitAnswer = useCallback(
    async (questionId: string, answer: string | string[] | number | boolean) => {
      if (!state.sessionId) throw new Error("No active intake session");
      intakeStore.setLoading(true);
      try {
        const result = await intakeService.submitAnswer({
          sessionId: state.sessionId,
          questionId,
          answer,
        });

        const answerRecord: IntakeAnswer = {
          questionId,
          answer,
          answeredAt: new Date().toISOString(),
        };
        intakeStore.addAnswer(answerRecord);

        if (result.safetyFlagRaised) {
          intakeStore.setSafetyFlag(true);
        }

        if (result.completed) {
          intakeStore.setComplete(true);
          intakeStore.setCurrentQuestion(null);
          // Trigger safety evaluation
          if (state.sessionId) {
            try {
              const safety = await safetyService.getSafetyEvaluation(state.sessionId);
              intakeStore.setSafetyFlag(safety.redFlagDetected);
            } catch { /* non-fatal */ }
          }
        } else {
          intakeStore.setCurrentQuestion(result.nextQuestion);
        }

        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to submit answer";
        intakeStore.setError(msg);
        throw err;
      } finally {
        intakeStore.setLoading(false);
      }
    },
    [state.sessionId]
  );

  const resetIntake = useCallback(() => {
    intakeStore.reset();
  }, []);

  return {
    ...state,
    startSession,
    submitAnswer,
    resetIntake,
  };
}
