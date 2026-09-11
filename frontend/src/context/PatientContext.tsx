"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  PatientProfile,
  SupportedLanguage,
  CarePathwayType,
  HealthRecord,
  AppointmentItem,
  EmergencyRedFlagAlert,
} from "@/types/patient";
import {
  DEFAULT_PATIENT_PROFILE,
  INITIAL_HEALTH_RECORDS,
  INITIAL_APPOINTMENTS,
} from "@/data/patientMockData";

interface PatientContextType {
  patient: PatientProfile;
  setPatient: React.Dispatch<React.SetStateAction<PatientProfile>>;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  selectedPathway: CarePathwayType;
  setSelectedPathway: (pathway: CarePathwayType) => void;
  redFlagAlert: EmergencyRedFlagAlert | null;
  setRedFlagAlert: (alert: EmergencyRedFlagAlert | null) => void;
  assignedToken: string;
  setAssignedToken: (token: string) => void;
  estimatedWaitMinutes: number;
  setEstimatedWaitMinutes: (min: number) => void;
  uploadedDocument: { name: string; category: string } | null;
  setUploadedDocument: (doc: { name: string; category: string } | null) => void;
  healthRecords: HealthRecord[];
  addHealthRecord: (rec: HealthRecord) => void;
  appointments: AppointmentItem[];
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<PatientProfile>(DEFAULT_PATIENT_PROFILE);
  const [language, setLanguageState] = useState<SupportedLanguage>("en");
  const [selectedPathway, setSelectedPathway] = useState<CarePathwayType>("modern");
  const [redFlagAlert, setRedFlagAlert] = useState<EmergencyRedFlagAlert | null>(null);
  const [assignedToken, setAssignedToken] = useState<string>("42");
  const [estimatedWaitMinutes, setEstimatedWaitMinutes] = useState<number>(15);
  const [uploadedDocument, setUploadedDocument] = useState<{ name: string; category: string } | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(INITIAL_HEALTH_RECORDS);
  const [appointments] = useState<AppointmentItem[]>(INITIAL_APPOINTMENTS);

  // Sync language with localStorage for persistence
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("aarogya_lang") as SupportedLanguage;
      if (savedLang && ["en", "hi", "mr", "ta", "te", "kn", "bn"].includes(savedLang)) {
        setLanguageState(savedLang);
      }
    } catch {
      // LocalStorage unavailable
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("aarogya_lang", lang);
    } catch {
      // ignore
    }
  };

  const addHealthRecord = (rec: HealthRecord) => {
    setHealthRecords((prev) => [rec, ...prev]);
  };

  return (
    <PatientContext.Provider
      value={{
        patient,
        setPatient,
        language,
        setLanguage,
        selectedPathway,
        setSelectedPathway,
        redFlagAlert,
        setRedFlagAlert,
        assignedToken,
        setAssignedToken,
        estimatedWaitMinutes,
        setEstimatedWaitMinutes,
        uploadedDocument,
        setUploadedDocument,
        healthRecords,
        addHealthRecord,
        appointments,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatient must be used within a PatientProvider");
  }
  return context;
}
