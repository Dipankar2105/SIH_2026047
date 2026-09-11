/**
 * usePatient — Patient Web
 * React hook for patient profile and current appointment state.
 */
import { useState, useEffect, useCallback } from "react";
import { patientStore } from "../store/patient-store";
import { identityService } from "../services/api/identity";
import { appointmentService } from "../services/api/hospital";

export function usePatient() {
  const [state, setState] = useState(patientStore.getState());

  useEffect(() => {
    return patientStore.subscribe(() => setState(patientStore.getState()));
  }, []);

  const loadProfile = useCallback(async () => {
    patientStore.setLoading(true);
    try {
      const profile = await identityService.getProfile();
      patientStore.setProfile(profile);
      return profile;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load profile";
      patientStore.setError(msg);
    } finally {
      patientStore.setLoading(false);
    }
  }, []);

  const loadAppointments = useCallback(async (patientId: string) => {
    patientStore.setLoading(true);
    try {
      return await appointmentService.listAppointments(patientId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load appointments";
      patientStore.setError(msg);
      return [];
    } finally {
      patientStore.setLoading(false);
    }
  }, []);

  return {
    ...state,
    loadProfile,
    loadAppointments,
  };
}
