import { create } from "zustand";

export interface Patient {
  id: string;
  token: string;
  name: string;
  age: number;
  gender: string;
  abhaId: string;
  chiefComplaint: string;
  priority: "normal" | "priority";
  status: "waiting" | "in-consultation" | "completed";
  registeredAt: string;
  doctorNotes?: string;
}

export interface ActiveEncounter {
  patientId: string;
  token: string;
  priority: "normal" | "priority";
  startedAt: string;
}

interface ClinicalWorkflowState {
  activeEncounter: ActiveEncounter | null;
  setActiveEncounter: (encounter: ActiveEncounter | null) => void;
  clearActiveEncounter: () => void;
}

export const useClinicalWorkflowStore = create<ClinicalWorkflowState>((set) => ({
  activeEncounter: null,
  setActiveEncounter: (activeEncounter) => set({ activeEncounter }),
  clearActiveEncounter: () => set({ activeEncounter: null }),
}));
