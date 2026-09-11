/**
 * useAppointment — Patient Web
 * React hook for appointment booking and management.
 */
import { useState, useCallback } from "react";
import { patientStore } from "../store/patient-store";
import { appointmentService } from "../services/api/hospital";
import type { AppointmentRequest, Appointment } from "../types/appointment";

interface AppointmentHookState {
  isLoading: boolean;
  error: string | null;
  appointment: Appointment | null;
  appointments: Appointment[];
}

export function useAppointment() {
  const [state, setState] = useState<AppointmentHookState>({
    isLoading: false,
    error: null,
    appointment: appointmentService.getLocalAppointment(),
    appointments: [],
  });

  const bookAppointment = useCallback(async (request: AppointmentRequest) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const appt = await appointmentService.bookAppointment(request);
      patientStore.setAppointment(appt);
      setState((s) => ({ ...s, isLoading: false, appointment: appt }));
      return appt;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Booking failed";
      setState((s) => ({ ...s, isLoading: false, error: msg }));
      throw err; // DO NOT fake success in real mode
    }
  }, []);

  const loadAppointments = useCallback(async (patientId: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const list = await appointmentService.listAppointments(patientId);
      setState((s) => ({ ...s, isLoading: false, appointments: list }));
      return list;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load appointments";
      setState((s) => ({ ...s, isLoading: false, error: msg }));
      return [];
    }
  }, []);

  const registerInQueue = useCallback(
    async (data: { patientId: string; appointmentId?: string; hospitalId: string; chiefComplaint: string }) => {
      setState((s) => ({ ...s, isLoading: true, error: null }));
      try {
        const result = await appointmentService.registerInQueue(data);
        patientStore.setQueueToken(result.queueToken);
        setState((s) => ({ ...s, isLoading: false }));
        return result.queueToken;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Queue registration failed";
        setState((s) => ({ ...s, isLoading: false, error: msg }));
        throw err;
      }
    },
    []
  );

  return {
    ...state,
    bookAppointment,
    loadAppointments,
    registerInQueue,
  };
}
