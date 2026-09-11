/**
 * useKioskSession — Patient Web
 * React hook managing the kiosk multi-step flow:
 *   Identity → Consent → Intake → Safety → Documents → Queue
 */
import { useState, useEffect, useCallback } from "react";
import { kioskStore, type KioskStep } from "../store/kiosk-store";
import { identityService } from "../services/api/identity";
import { intakeService } from "../services/api/intake";
import { safetyService } from "../services/api/safety";
import { appointmentService } from "../services/api/hospital";

export function useKioskSession() {
  const [state, setState] = useState(kioskStore.getState());

  useEffect(() => {
    return kioskStore.subscribe(() => setState(kioskStore.getState()));
  }, []);

  const identifyPatient = useCallback(async (abhaId: string) => {
    kioskStore.setLoading(true);
    kioskStore.setError(null);
    try {
      const profile = await identityService.getProfile();
      kioskStore.setPatient(profile.patientId, abhaId);
      kioskStore.setStep("consent");
    } catch (err) {
      kioskStore.setError(err instanceof Error ? err.message : "Identity verification failed");
    } finally {
      kioskStore.setLoading(false);
    }
  }, []);

  const giveConsent = useCallback(() => {
    kioskStore.giveConsent();
    kioskStore.setStep("intake");
  }, []);

  const startIntake = useCallback(async (language?: string) => {
    const { patientId, appointmentId } = kioskStore.getState();
    if (!patientId) return;
    kioskStore.setLoading(true);
    try {
      const session = await intakeService.startSession({ patientId, appointmentId: appointmentId || undefined, language });
      kioskStore.setIntakeSession(session.sessionId);
    } catch (err) {
      kioskStore.setError(err instanceof Error ? err.message : "Failed to start intake");
    } finally {
      kioskStore.setLoading(false);
    }
  }, []);

  const completeIntake = useCallback(async () => {
    const { intakeSessionId, patientId } = kioskStore.getState();
    if (!intakeSessionId || !patientId) return;
    kioskStore.setLoading(true);
    try {
      const safety = await safetyService.getSafetyEvaluation(intakeSessionId);
      kioskStore.setSafetyResult(safety);
      kioskStore.setStep("safety");
    } catch (err) {
      kioskStore.setError(err instanceof Error ? err.message : "Safety check failed");
    } finally {
      kioskStore.setLoading(false);
    }
  }, []);

  const proceedToDocuments = useCallback(() => {
    kioskStore.setStep("documents");
  }, []);

  const registerInQueue = useCallback(async (hospitalId: string) => {
    const { patientId, appointmentId } = kioskStore.getState();
    if (!patientId) return;
    kioskStore.setLoading(true);
    try {
      const result = await appointmentService.registerInQueue({
        patientId,
        appointmentId: appointmentId || undefined,
        hospitalId,
        chiefComplaint: "Patient arriving at kiosk",
      });
      kioskStore.setQueueToken(result.queueToken);
      kioskStore.setStep("queue-registered");
    } catch (err) {
      kioskStore.setError(err instanceof Error ? err.message : "Queue registration failed");
    } finally {
      kioskStore.setLoading(false);
    }
  }, []);

  const goToStep = useCallback((step: KioskStep) => {
    kioskStore.setStep(step);
  }, []);

  const reset = useCallback(() => {
    kioskStore.reset();
  }, []);

  return {
    ...state,
    identifyPatient,
    giveConsent,
    startIntake,
    completeIntake,
    proceedToDocuments,
    registerInQueue,
    goToStep,
    reset,
  };
}
