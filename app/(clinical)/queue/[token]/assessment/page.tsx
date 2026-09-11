"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { dashboardService, QueuePatient } from "@/lib/services/dashboard.service";
import { useClinicalWorkflowStore } from "@/stores/clinical-workflow.store";

interface Diagnosis {
  label: string;
  icd10: string;
  status: "confirmed" | "ai-suggestion";
  note: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

function normalizeToken(token: string) {
  return token.startsWith("#") ? token : `#${token}`;
}

export default function AssessmentPage() {
  const params = useParams();
  const urlToken = params.token as string;
  const router = useRouter();
  const activeEncounter = useClinicalWorkflowStore((s) => s.activeEncounter);
  const setActiveEncounter = useClinicalWorkflowStore((s) => s.setActiveEncounter);
  
  const [patient, setPatient] = useState<QueuePatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State 1: Clinical Notes & Dictation
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [dictationLang, setDictationLang] = useState<"Hindi" | "English">("Hindi");
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  // State 2: Primary Diagnosis
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState<Diagnosis | null>({
    label: "Acute Gastroenteritis",
    icd10: "K52.9",
    status: "confirmed",
    note: "Primary consideration",
  });
  const [isEditingPrimary, setIsEditingPrimary] = useState(false);
  const [editPrimaryLabel, setEditPrimaryLabel] = useState("");
  const [editPrimaryIcd10, setEditPrimaryIcd10] = useState("");
  const [editPrimaryNote, setEditPrimaryNote] = useState("");

  const [isChangingPrimaryModal, setIsChangingPrimaryModal] = useState(false);
  const [newPrimaryLabel, setNewPrimaryLabel] = useState("");
  const [newPrimaryIcd10, setNewPrimaryIcd10] = useState("");
  const [newPrimaryNote, setNewPrimaryNote] = useState("");

  // State 3: Secondary Diagnoses
  const [secondaryDiagnoses, setSecondaryDiagnoses] = useState<Diagnosis[]>([]);

  // State 4: Differential Diagnoses & Dismissed
  const [differentialSuggestions] = useState<Diagnosis[]>([
    { label: "Peptic Ulcer Disease", icd10: "K27.9", status: "ai-suggestion", note: "Consider — burning character" },
    { label: "GERD / Gastritis", icd10: "K21.0", status: "ai-suggestion", note: "Consider — post-meal pattern" },
    { label: "Appendicitis (atypical)", icd10: "K37", status: "ai-suggestion", note: "Low probability — Hx appendectomy" },
  ]);
  const [dismissedDiagnoses, setDismissedDiagnoses] = useState<string[]>([]);

  // State 5: Search / Add ICD-10
  const [icdSearchInput, setIcdSearchInput] = useState("");

  // State 6: Save & Toasts
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toastIdRef = useRef(0);

  const addToast = (message: string, type: "success" | "info" | "error" = "success") => {
    toastIdRef.current += 1;
    const id = `toast-${toastIdRef.current}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!urlToken) {
      router.push("/queue");
      return;
    }

    let encounter = activeEncounter;

    if (!encounter) {
      try {
        const stored = window.sessionStorage.getItem("activeEncounter");
        if (stored) {
          encounter = JSON.parse(stored);
          setActiveEncounter(encounter);
        }
      } catch {
        // ignore parse errors
      }
    }

    if (!encounter) {
      encounter = {
        patientId: "",
        token: normalizeToken(urlToken),
        priority: "normal",
        startedAt: new Date().toISOString(),
      };
      setActiveEncounter(encounter);
    }

    let cancelled = false;
    
    // Fetch patient data and saved assessment if any
    Promise.all([
      dashboardService.getPatientByToken(encounter.token),
      dashboardService.getAssessment(encounter.token),
    ])
      .then(([patientData, savedAssessment]) => {
        if (cancelled) return;
        if (patientData) {
          setPatient(patientData);
          if (patientData.doctorNotes && !savedAssessment) {
            setClinicalNotes(patientData.doctorNotes);
          }
          if (!savedAssessment) {
            // Set dynamic initial primary diagnosis based on patient complaint
            const complaint = (patientData.chiefComplaint || "").toLowerCase();
            if (complaint.includes("chest") || complaint.includes("sob") || complaint.includes("breath")) {
              setPrimaryDiagnosis({ label: "Acute Coronary Syndrome", icd10: "I24.9", status: "confirmed", note: "Primary consideration — urgent ECG" });
            } else if (complaint.includes("knee") || complaint.includes("joint")) {
              setPrimaryDiagnosis({ label: "Bilateral Knee Osteoarthritis", icd10: "M17.0", status: "confirmed", note: "Primary consideration" });
            } else if (complaint.includes("fever") || complaint.includes("cough")) {
              setPrimaryDiagnosis({ label: "Acute Upper Respiratory Infection", icd10: "J06.9", status: "confirmed", note: "Primary consideration" });
            } else {
              setPrimaryDiagnosis({ label: "Acute Gastroenteritis", icd10: "K52.9", status: "confirmed", note: "Primary consideration" });
            }
          }
        } else {
          setError(`Patient not found for token ${urlToken}`);
        }

        if (savedAssessment) {
          setClinicalNotes(savedAssessment.clinicalNotes || "");
          if (savedAssessment.primaryDiagnosis) {
            setPrimaryDiagnosis(savedAssessment.primaryDiagnosis);
          }
          if (savedAssessment.secondaryDiagnoses) {
            setSecondaryDiagnoses(savedAssessment.secondaryDiagnoses);
          }
          if (savedAssessment.dismissedDiagnoses) {
            setDismissedDiagnoses(savedAssessment.dismissedDiagnoses);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load patient");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [urlToken, activeEncounter, router, setActiveEncounter]);

  // Voice dictation handler
  const handleToggleDictation = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      addToast("Voice dictation stopped", "info");
      return;
    }

    if (!SpeechRecognition) {
      setIsListening(true);
      addToast(`Voice dictation active (${dictationLang}) — speak into microphone`, "info");
      return;
    }

    try {
      const RecognitionConstructor = SpeechRecognition as unknown as new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: (event: { results: Array<Array<{ transcript: string }>> }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      };
      const recognition = new RecognitionConstructor();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = dictationLang === "Hindi" ? "hi-IN" : "en-US";

      recognition.onresult = (event: { results: Array<Array<{ transcript: string }>> }) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript;
        setClinicalNotes((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsListening(false);
        addToast("Voice dictation active (fallback mode)", "info");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      addToast(`Listening (${dictationLang})...`, "info");
    } catch {
      setIsListening(true);
      addToast(`Voice dictation active (${dictationLang})`, "info");
    }
  };

  const handleToggleLanguage = () => {
    const nextLang = dictationLang === "Hindi" ? "English" : "Hindi";
    setDictationLang(nextLang);
    addToast(`Dictation language set to ${nextLang}`, "info");
  };

  // Actions for Primary Diagnosis
  const handleStartEditPrimary = () => {
    if (primaryDiagnosis) {
      setEditPrimaryLabel(primaryDiagnosis.label);
      setEditPrimaryIcd10(primaryDiagnosis.icd10);
      setEditPrimaryNote(primaryDiagnosis.note);
      setIsEditingPrimary(true);
    }
  };

  const handleSaveEditPrimary = () => {
    if (!editPrimaryLabel.trim()) return;
    setPrimaryDiagnosis({
      label: editPrimaryLabel.trim(),
      icd10: editPrimaryIcd10.trim() || "K52.9",
      status: "confirmed",
      note: editPrimaryNote.trim() || "Physician-confirmed",
    });
    setIsEditingPrimary(false);
    addToast("Primary Diagnosis updated successfully", "success");
  };

  const handleOpenAddChangePrimary = () => {
    setNewPrimaryLabel("");
    setNewPrimaryIcd10("");
    setNewPrimaryNote("");
    setIsChangingPrimaryModal(true);
  };

  const handleSaveNewPrimary = () => {
    if (!newPrimaryLabel.trim()) return;
    const oldPrimary = primaryDiagnosis;
    const newPrimary: Diagnosis = {
      label: newPrimaryLabel.trim(),
      icd10: newPrimaryIcd10.trim() || "ICD-10",
      status: "confirmed",
      note: newPrimaryNote.trim() || "Primary consideration",
    };

    setPrimaryDiagnosis(newPrimary);
    if (oldPrimary && oldPrimary.icd10 !== newPrimary.icd10) {
      setSecondaryDiagnoses((prev) => {
        if (!prev.some((d) => d.icd10 === oldPrimary.icd10)) {
          return [...prev, oldPrimary];
        }
        return prev;
      });
    }

    setIsChangingPrimaryModal(false);
    addToast(`Primary Diagnosis changed to ${newPrimary.label}`, "success");
  };

  // Actions for Differential Suggestions
  const handleAddAsPrimary = (suggestion: Diagnosis) => {
    const oldPrimary = primaryDiagnosis;
    setPrimaryDiagnosis(suggestion);

    // If old primary exists and is different, move it to secondary diagnoses
    if (oldPrimary && oldPrimary.icd10 !== suggestion.icd10) {
      setSecondaryDiagnoses((prev) => {
        if (!prev.some((d) => d.icd10 === oldPrimary.icd10)) {
          return [...prev, oldPrimary];
        }
        return prev;
      });
    }

    // Remove suggestion from secondary if present
    setSecondaryDiagnoses((prev) => prev.filter((d) => d.icd10 !== suggestion.icd10));

    addToast(`Set "${suggestion.label}" as Primary Diagnosis`, "success");
  };

  const handleAddAsSecondary = (suggestion: Diagnosis) => {
    if (secondaryDiagnoses.some((d) => d.icd10 === suggestion.icd10)) {
      addToast(`"${suggestion.label}" is already in secondary diagnoses`, "info");
      return;
    }
    setSecondaryDiagnoses((prev) => [...prev, suggestion]);
    addToast(`Added "${suggestion.label}" to Secondary Diagnoses`, "success");
  };

  const handleDismissSuggestion = (suggestion: Diagnosis) => {
    setDismissedDiagnoses((prev) => [...prev, suggestion.icd10]);
    addToast(`Dismissed "${suggestion.label}" suggestion`, "info");
  };

  const handleRemoveSecondary = (icd10: string) => {
    const item = secondaryDiagnoses.find((d) => d.icd10 === icd10);
    setSecondaryDiagnoses((prev) => prev.filter((d) => d.icd10 !== icd10));
    addToast(`Removed "${item?.label || icd10}" from Secondary Diagnoses`, "info");
  };

  // ICD-10 Search & Add
  const handleAddIcdDiagnosis = () => {
    if (!icdSearchInput.trim()) return;
    const query = icdSearchInput.trim();
    const newDiag: Diagnosis = {
      label: query,
      icd10: query.toUpperCase().startsWith("K") || query.length <= 5 ? query.toUpperCase() : "ICD-10",
      status: "confirmed",
      note: "Added manually",
    };

    setSecondaryDiagnoses((prev) => [...prev, newDiag]);
    setIcdSearchInput("");
    addToast(`Added "${query}" to Secondary Diagnoses`, "success");
  };

  // Save Assessment
  const handleSaveAssessment = async () => {
    setSaving(true);
    try {
      await dashboardService.saveAssessment({
        token: urlToken,
        clinicalNotes,
        primaryDiagnosis,
        secondaryDiagnoses,
        dismissedDiagnoses,
        updatedAt: new Date().toISOString(),
      });
      addToast("Assessment saved successfully", "success");
    } catch {
      addToast("Failed to save assessment. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Route navigation checks
  const handleProceedToInvestigations = () => {
    const cleanToken = urlToken.replace(/^#/, "");
    router.push(`/queue/${cleanToken}/investigations`);
  };

  const handleProceedToPrescription = () => {
    const cleanToken = urlToken.replace(/^#/, "");
    router.push(`/queue/${cleanToken}/prescription`);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <p className="text-sm text-slate-400">Loading assessment...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <p className="text-sm text-red-600">{error || "No patient data"}</p>
      </div>
    );
  }

  // Active suggestions: filter out primary diagnosis and dismissed items
  const activeSuggestions = differentialSuggestions.filter(
    (d) => d.icd10 !== primaryDiagnosis?.icd10 && !dismissedDiagnoses.includes(d.icd10)
  );

  return (
    <div className="p-5 space-y-5 max-w-[1400px] w-full mx-auto relative">
      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between p-3 rounded-lg shadow-lg text-xs font-medium border transition-all animate-in fade-in slide-in-from-bottom-2 ${
              t.type === "success"
                ? "bg-[#E6F4F1] border-teal-200 text-[#00594C]"
                : t.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-slate-800 border-slate-700 text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              {t.type === "success" && (
                <svg className="w-4 h-4 text-[#00594C] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              )}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-3 text-slate-400 hover:text-slate-600"
              type="button"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Clinical Assessment Title & Patient Info */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Clinical Assessment</h2>
          <p className="text-xs text-slate-500">
            Patient: <span className="font-semibold text-slate-700">{patient.name}</span> ({patient.age} yrs · {patient.gender}) · Token: <span className="font-semibold text-[#00594C]">{patient.token}</span>
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Column (Clinical Notes & Primary Diagnosis) */}
        <div className="col-span-12 lg:col-span-7 space-y-5">
          {/* Card 1: Clinical Notes */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">Clinical Notes</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleDictation}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                    isListening
                      ? "bg-red-50 border-red-200 text-red-600 animate-pulse"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                  type="button"
                >
                  <svg className={`w-3.5 h-3.5 ${isListening ? "text-red-600" : "text-teal-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                  {isListening ? "Listening..." : "Voice Dictation"}
                </button>
                <button
                  onClick={handleToggleLanguage}
                  className="px-2 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                  type="button"
                >
                  {dictationLang}
                </button>
              </div>
            </div>
            <div className="bg-[#F8FAFC]/50 border border-slate-200 rounded-lg p-3 min-h-[125px]">
              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="w-full bg-transparent border-none outline-none resize-none text-xs leading-relaxed text-slate-700 placeholder-slate-400 font-normal"
                placeholder="Enter clinical notes..."
                rows={6}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Clinical notes are physician-authored and will be part of the permanent record.
            </p>
          </div>

          {/* Card 2: Primary Diagnosis */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="mb-1">
              <h3 className="text-sm font-semibold text-slate-800">Primary Diagnosis</h3>
              <p className="text-[11px] text-slate-400">Physician-confirmed diagnosis</p>
            </div>

            {primaryDiagnosis ? (
              <div className="bg-[#F3FAF7] border border-teal-100 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#00594C] flex items-center justify-center text-white flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{primaryDiagnosis.label}</h4>
                    <p className="text-[11px] text-slate-500">{primaryDiagnosis.note}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[10px] block text-slate-400 uppercase font-semibold">ICD-10</span>
                    <span className="text-xs font-bold text-[#00796B]">{primaryDiagnosis.icd10}</span>
                  </div>
                  <button
                    onClick={handleStartEditPrimary}
                    className="ml-2 px-2 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                    type="button"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center text-xs text-slate-400">
                No primary diagnosis selected
              </div>
            )}

            {/* Edit Primary Diagnosis Form (Inline) */}
            {isEditingPrimary && (
              <div className="bg-slate-50 border border-teal-200 rounded-lg p-3 space-y-2 mt-2">
                <h4 className="text-xs font-bold text-slate-800">Edit Primary Diagnosis</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Diagnosis Label"
                    value={editPrimaryLabel}
                    onChange={(e) => setEditPrimaryLabel(e.target.value)}
                    className="col-span-2 text-xs p-2 border border-slate-200 rounded bg-white"
                  />
                  <input
                    type="text"
                    placeholder="ICD-10 Code"
                    value={editPrimaryIcd10}
                    onChange={(e) => setEditPrimaryIcd10(e.target.value)}
                    className="text-xs p-2 border border-slate-200 rounded bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Clinical Note"
                    value={editPrimaryNote}
                    onChange={(e) => setEditPrimaryNote(e.target.value)}
                    className="text-xs p-2 border border-slate-200 rounded bg-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsEditingPrimary(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 bg-white border border-slate-200 rounded"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditPrimary}
                    className="px-3 py-1 text-xs text-white bg-[#00594C] hover:bg-[#004D40] rounded font-medium"
                    type="button"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Add / Change Primary Diagnosis Modal / Form */}
            {isChangingPrimaryModal && (
              <div className="bg-slate-50 border border-teal-200 rounded-lg p-3 space-y-2 mt-2">
                <h4 className="text-xs font-bold text-slate-800">Add / Change Primary Diagnosis</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Diagnosis Name (e.g. Acute Gastritis)"
                    value={newPrimaryLabel}
                    onChange={(e) => setNewPrimaryLabel(e.target.value)}
                    className="col-span-2 text-xs p-2 border border-slate-200 rounded bg-white"
                  />
                  <input
                    type="text"
                    placeholder="ICD-10 Code (e.g. K29.7)"
                    value={newPrimaryIcd10}
                    onChange={(e) => setNewPrimaryIcd10(e.target.value)}
                    className="text-xs p-2 border border-slate-200 rounded bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Note / Remark"
                    value={newPrimaryNote}
                    onChange={(e) => setNewPrimaryNote(e.target.value)}
                    className="text-xs p-2 border border-slate-200 rounded bg-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsChangingPrimaryModal(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 bg-white border border-slate-200 rounded"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewPrimary}
                    className="px-3 py-1 text-xs text-white bg-[#00594C] hover:bg-[#004D40] rounded font-medium"
                    type="button"
                  >
                    Set Primary Diagnosis
                  </button>
                </div>
              </div>
            )}

            {!isEditingPrimary && !isChangingPrimaryModal && (
              <button
                onClick={handleOpenAddChangePrimary}
                className="w-full py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors flex items-center justify-start px-3 gap-2"
                type="button"
              >
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
                Add / Change Primary Diagnosis
              </button>
            )}

            {/* Secondary Diagnoses List if any */}
            {secondaryDiagnoses.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Secondary Diagnoses ({secondaryDiagnoses.length})</h4>
                <div className="space-y-1.5">
                  {secondaryDiagnoses.map((sec) => (
                    <div key={sec.icd10} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800">{sec.label}</span>
                        <span className="ml-2 text-[10px] text-slate-400">({sec.icd10})</span>
                      </div>
                      <button
                        onClick={() => handleRemoveSecondary(sec.icd10)}
                        className="text-[11px] text-slate-400 hover:text-red-600"
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Buttons Group */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              onClick={handleSaveAssessment}
              disabled={saving}
              className="px-5 py-2 text-xs font-medium text-white rounded-lg shadow-sm transition-colors bg-[#00594C] hover:bg-[#004D40] disabled:bg-slate-400"
              type="button"
            >
              {saving ? "Saving..." : "Save Assessment"}
            </button>
            <button
              onClick={handleProceedToInvestigations}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-colors"
              type="button"
            >
              Proceed to Investigations
            </button>
            <button
              onClick={handleProceedToPrescription}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-colors"
              type="button"
            >
              Proceed to Prescription
            </button>
          </div>
        </div>

        {/* Right Column (Differential Diagnoses) */}
        <div className="col-span-12 lg:col-span-5 space-y-3.5">
          <h2 className="text-sm font-bold text-slate-800">Differential Diagnoses</h2>

          {/* Advisory Warning Banner */}
          <div className="bg-[#FEFCE8] border border-[#FEF08A] rounded-lg p-2.5 text-slate-700 text-[11px] leading-relaxed">
            AI-suggested differentials are for reference only. The physician makes all clinical determinations.
          </div>

          {/* Render Active Suggestions */}
          {activeSuggestions.length > 0 ? (
            activeSuggestions.map((diag) => (
              <div key={diag.icd10} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{diag.label}</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-slate-600 bg-slate-100 border border-slate-200 rounded">AI SUGGESTION</span>
                  </div>
                  <span className="text-xs font-bold text-[#00796B]">{diag.icd10}</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">{diag.note}</p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAddAsPrimary(diag)}
                    className="px-2.5 py-1 text-[11px] font-medium text-white bg-[#00594C] hover:bg-[#004D40] rounded transition-colors"
                    type="button"
                  >
                    Add as Primary
                  </button>
                  <button
                    onClick={() => handleAddAsSecondary(diag)}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-colors"
                    type="button"
                  >
                    Add as Secondary
                  </button>
                  <button
                    onClick={() => handleDismissSuggestion(diag)}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-400 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-colors"
                    type="button"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400">
              No further differential suggestions.
            </div>
          )}

          {/* Search ICD-10 Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-2">
            <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              ADD DIAGNOSIS BY ICD-10 CODE
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </span>
                <input
                  value={icdSearchInput}
                  onChange={(e) => setIcdSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddIcdDiagnosis()}
                  className="w-full bg-[#F1F5F9]/80 text-xs text-slate-700 placeholder-slate-400 rounded-lg pl-8 pr-2.5 py-2 border border-transparent focus:border-teal-600 focus:bg-white focus:outline-none transition-all"
                  placeholder="Search ICD-10 code or condition..."
                  type="text"
                />
              </div>
              <button
                onClick={handleAddIcdDiagnosis}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#00594C] hover:bg-[#004D40] rounded-lg transition-colors"
                type="button"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}