"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { dashboardService, QueuePatient } from "@/lib/services/dashboard.service";
import { useClinicalWorkflowStore } from "@/stores/clinical-workflow.store";

interface HistorySection {
  id: string;
  title: string;
  source: "PATIENT RESPONSE" | "AI Extracted";
  status: "verified" | "needs-review";
  verifiedBy?: string;
  verifiedAt?: string;
  content: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

const INITIAL_SECTIONS: HistorySection[] = [
  {
    id: "sec-1",
    title: "Chief Complaint",
    source: "PATIENT RESPONSE",
    status: "verified",
    verifiedBy: "Dr. Sharma",
    verifiedAt: "10:18 AM",
    content:
      "Abdominal pain and cramping — onset yesterday evening after outside food. Pain intensity 6/10, burning in character, periumbilical location.",
  },
  {
    id: "sec-2",
    title: "Present Illness",
    source: "AI Extracted",
    status: "needs-review",
    content:
      "34-year-old male with abdominal pain and cramping since yesterday evening. Aggravated after outside food. Pain rated 6/10, burning with cramping, located in the periumbilical region. Associated with mild nausea and one episode of non-bilious, non-projectile vomiting in the night. Mild abdominal bloating present. No fever, no loose stools, no blood in stools. No radiation to chest or back.",
  },
  {
    id: "sec-3",
    title: "Past Medical History",
    source: "PATIENT RESPONSE",
    status: "verified",
    verifiedBy: "Dr. Sharma",
    verifiedAt: "10:19 AM",
    content: "No significant past medical history. No known chronic conditions. No previous hospitalizations.",
  },
  {
    id: "sec-4",
    title: "Past Surgical History",
    source: "PATIENT RESPONSE",
    status: "verified",
    verifiedBy: "Dr. Sharma",
    verifiedAt: "10:19 AM",
    content: "Appendectomy — 2018 (City Hospital, Mumbai). No other surgeries.",
  },
  {
    id: "sec-5",
    title: "Medication History",
    source: "PATIENT RESPONSE",
    status: "verified",
    verifiedBy: "Dr. Sharma",
    verifiedAt: "10:20 AM",
    content: "No current medications. No OTC medications taken in the past 7 days.",
  },
  {
    id: "sec-6",
    title: "Allergies & Reactions",
    source: "PATIENT RESPONSE",
    status: "verified",
    verifiedBy: "Dr. Sharma",
    verifiedAt: "10:21 AM",
    content: "Penicillin — mild skin rash (patient-reported). No known food or environmental allergies.",
  },
  {
    id: "sec-7",
    title: "Family History",
    source: "PATIENT RESPONSE",
    status: "verified",
    verifiedBy: "Dr. Sharma",
    verifiedAt: "10:21 AM",
    content: "Father: Ischemic Heart Disease (IHD), Hypertension. Mother: Type 2 Diabetes Mellitus.",
  },
  {
    id: "sec-8",
    title: "Personal & Social History",
    source: "PATIENT RESPONSE",
    status: "needs-review",
    content: "Non-smoker. Occasional social alcohol. Diet: non-vegetarian. Sedentary desk job.",
  },
  {
    id: "sec-9",
    title: "Review of Systems (ROS)",
    source: "AI Extracted",
    status: "needs-review",
    content:
      "GI: Positive for epigastric/periumbilical pain, nausea, vomiting. Negative for dysphagia, heartburn, jaundice, diarrhea, constipation. Cardiac: Negative for chest pain, palpitations, orthopnea. Respiratory: Negative for cough, dyspnea.",
  },
  {
    id: "sec-10",
    title: "Vitals Summary",
    source: "PATIENT RESPONSE",
    status: "verified",
    verifiedBy: "Dr. Sharma",
    verifiedAt: "10:22 AM",
    content: "BP: 122/80 mmHg, Pulse: 76 bpm, Temp: 98.4°F, SpO2: 98% on room air, Pain: 6/10.",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AIHistoryPage() {
  const params = useParams();
  const rawToken = params.token as string;
  const router = useRouter();
  const activeEncounter = useClinicalWorkflowStore((s) => s.activeEncounter);

  const [patient, setPatient] = useState<QueuePatient | null>(null);
  const [loading, setLoading] = useState(true);

  const targetToken = activeEncounter?.token || rawToken || "#42";
  const normalizedToken = targetToken.startsWith("#") ? targetToken : `#${targetToken}`;

  const [sections, setSections] = useState<HistorySection[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = window.sessionStorage.getItem(`ai_history_${normalizedToken}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_SECTIONS;
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
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

  useEffect(() => {
    if (!rawToken) {
      router.push("/queue");
      return;
    }

    let encounter = activeEncounter;
    if (!encounter) {
      try {
        const stored = window.sessionStorage.getItem("activeEncounter");
        if (stored) {
          encounter = JSON.parse(stored);
        }
      } catch {
        // ignore
      }
    }

    let cancelled = false;
    const tokenToFetch = encounter?.token || rawToken;

function buildInitialSectionsForPatient(p: QueuePatient): HistorySection[] {
  return [
    {
      id: "sec-1",
      title: "Chief Complaint",
      source: "PATIENT RESPONSE",
      status: "verified",
      verifiedBy: "Dr. Sharma",
      verifiedAt: "10:18 AM",
      content: p.aiChiefComplaintDetail || p.chiefComplaint,
    },
    {
      id: "sec-2",
      title: "Present Illness",
      source: "AI Extracted",
      status: "needs-review",
      content: p.aiSummary || p.symptoms,
    },
    {
      id: "sec-3",
      title: "Past Medical History",
      source: "PATIENT RESPONSE",
      status: "verified",
      verifiedBy: "Dr. Sharma",
      verifiedAt: "10:19 AM",
      content: p.pastHistory?.medicalHistory || "No significant past medical history.",
    },
    {
      id: "sec-4",
      title: "Past Surgical History",
      source: "PATIENT RESPONSE",
      status: "verified",
      verifiedBy: "Dr. Sharma",
      verifiedAt: "10:19 AM",
      content: p.pastHistory?.surgicalHistory || "No past surgical history.",
    },
    {
      id: "sec-5",
      title: "Medication History",
      source: "PATIENT RESPONSE",
      status: "verified",
      verifiedBy: "Dr. Sharma",
      verifiedAt: "10:20 AM",
      content: p.pastHistory?.medications || "No current medications.",
    },
    {
      id: "sec-6",
      title: "Allergies & Reactions",
      source: "PATIENT RESPONSE",
      status: "verified",
      verifiedBy: "Dr. Sharma",
      verifiedAt: "10:21 AM",
      content: p.pastHistory?.allergies || (p.allergyWarning ? `${p.allergyWarning.allergen} — ${p.allergyWarning.reaction}` : "No known allergies."),
    },
    {
      id: "sec-7",
      title: "Family History",
      source: "PATIENT RESPONSE",
      status: "verified",
      verifiedBy: "Dr. Sharma",
      verifiedAt: "10:21 AM",
      content: p.pastHistory?.familyHistory || "No family history recorded.",
    },
    {
      id: "sec-8",
      title: "Personal & Social History",
      source: "PATIENT RESPONSE",
      status: "needs-review",
      content: p.pastHistory?.personalHistory || "Non-smoker. Routine lifestyle.",
    },
    {
      id: "sec-9",
      title: "Review of Systems (ROS)",
      source: "AI Extracted",
      status: "needs-review",
      content: `Systemic review positive for ${p.chiefComplaint}. Negative for chest pain or acute respiratory distress.`,
    },
    {
      id: "sec-10",
      title: "Vitals Summary",
      source: "PATIENT RESPONSE",
      status: "verified",
      verifiedBy: "Dr. Sharma",
      verifiedAt: "10:22 AM",
      content: `BP: ${p.vitals.bp || "—"}, HR: ${p.vitals.pulse || "—"}, Temp: ${p.vitals.temperature || "—"}, SpO2: ${p.vitals.spo2 || "—"}.`,
    },
  ];
}

    dashboardService
      .getPatientByToken(tokenToFetch)
      .then((data) => {
        if (cancelled) return;
        const targetPatient = data || {
          id: `p-${tokenToFetch}`,
          token: tokenToFetch.startsWith("#") ? tokenToFetch : `#${tokenToFetch}`,
          name: "Patient",
          age: 30,
          gender: "M",
          abhaId: "ABHA-1234",
          intakeStatus: "linked" as const,
          chiefComplaint: "Routine OPD Visit",
          symptoms: "Mild discomfort",
          vitals: { bp: "120/80", pulse: "72" },
          priority: "normal" as const,
          redFlagDetected: false,
          status: "in-consultation" as const,
          registeredAt: new Date().toISOString(),
        };

        setPatient(targetPatient);

        // Check if custom stored sections exist for this patient
        const storedKey = `ai_history_${targetPatient.token}`;
        try {
          const stored = window.sessionStorage.getItem(storedKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSections(parsed);
              setLoading(false);
              return;
            }
          }
        } catch {}

        setSections(buildInitialSectionsForPatient(targetPatient));
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        const formattedToken = tokenToFetch.startsWith("#") ? tokenToFetch : `#${tokenToFetch}`;
        setPatient({
          id: `p-${tokenToFetch}`,
          token: formattedToken,
          name: "Rahul S.",
          age: 34,
          gender: "M",
          abhaId: "ABHA-2345-6789-0123-4567",
          intakeStatus: "linked",
          chiefComplaint: "Abdominal pain & cramping",
          symptoms: "Lower abdominal pain",
          vitals: { bp: "122/80", pulse: "76" },
          priority: "normal",
          redFlagDetected: false,
          status: "in-consultation",
          registeredAt: new Date().toISOString(),
          abhaConnected: true,
          abhaLabel: "rahul34@abdm",
          room: "OPD Room 14",
        });
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [rawToken, activeEncounter, router]);

  const saveToStorage = (updatedSections: HistorySection[]) => {
    try {
      window.sessionStorage.setItem(`ai_history_${normalizedToken}`, JSON.stringify(updatedSections));
    } catch {
      // ignore
    }
  };

  const handleAcceptAndVerify = (id: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const updated = sections.map((sec) => {
      if (sec.id === id) {
        return {
          ...sec,
          status: "verified" as const,
          verifiedBy: "Dr. Sharma",
          verifiedAt: timeStr,
        };
      }
      return sec;
    });
    setSections(updated);
    saveToStorage(updated);
    addToast("Section verified by physician", "success");
  };

  const handleUnverify = (id: string) => {
    const updated = sections.map((sec) => {
      if (sec.id === id) {
        return {
          ...sec,
          status: "needs-review" as const,
          verifiedBy: undefined,
          verifiedAt: undefined,
        };
      }
      return sec;
    });
    setSections(updated);
    saveToStorage(updated);
    addToast("Section set to Needs Physician Review", "info");
  };

  const startEditing = (sec: HistorySection) => {
    setEditingId(sec.id);
    setEditText(sec.content);
  };

  const saveEdit = (id: string) => {
    const updated = sections.map((sec) => {
      if (sec.id === id) {
        return { ...sec, content: editText };
      }
      return sec;
    });
    setSections(updated);
    saveToStorage(updated);
    setEditingId(null);
    addToast("Section text updated", "success");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const deleteSection = (id: string) => {
    const updated = sections.filter((sec) => sec.id !== id);
    setSections(updated);
    saveToStorage(updated);
    addToast("Section removed", "info");
  };

  const handleBackToConsultation = () => {
    const cleanToken = rawToken.replace(/^#/, "");
    router.push(`/queue/${cleanToken}/consultation`);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm text-slate-400">Loading AI history verification...</p>
      </div>
    );
  }

  const currentPatient = patient || {
    token: rawToken.startsWith("#") ? rawToken : `#${rawToken}`,
    name: "Rahul S.",
    age: 34,
    gender: "M",
    abhaId: "ABHA-2345-6789-0123-4567",
    abhaConnected: true,
    abhaLabel: "rahul34@abdm",
    room: "OPD Room 14",
  };

  const verifiedCount = sections.filter((s) => s.status === "verified").length;
  const totalCount = sections.length;
  const progressPercent = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#F8FAFC] text-slate-800 antialiased">
      {/* Toast Notifications */}
      <div className="fixed top-20 right-8 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 min-w-[280px] ${
              t.type === "success"
                ? "bg-[#00594C] text-white"
                : t.type === "error"
                ? "bg-red-600 text-white"
                : "bg-slate-800 text-white"
            }`}
          >
            <span>{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="ml-auto opacity-70 hover:opacity-100 text-base leading-none"
              type="button"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Header Bar */}
      <header className="h-13 py-2.5 px-6 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors"
            title="Back"
            type="button"
          >
            <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight">AI Clinical History · Verification</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" />
              </svg>
            </span>
            <input
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#F1F5F9] border-none rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
              placeholder="Search by ABHA ID or name..."
              type="text"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">10:42 AM</span>
          <button className="relative text-slate-500 hover:text-slate-700" type="button">
            <svg className="w-4 h-4 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          <div className="w-7 h-7 rounded-full bg-[#D4ECE7] text-[#00594C] flex items-center justify-center font-bold text-xs">
            DS
          </div>
        </div>
      </header>

      {/* Patient Context Strip */}
      <section className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#D7EFEA] text-[#00594C] flex items-center justify-center font-bold text-sm">
            {getInitials(currentPatient.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">{currentPatient.name}</span>
              <span className="text-xs text-slate-500">
                {currentPatient.age} yrs · {currentPatient.gender === "M" ? "Male" : currentPatient.gender === "F" ? "Female" : currentPatient.gender}
              </span>
              <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                Token {currentPatient.token.startsWith("#") ? currentPatient.token : `#${currentPatient.token}`}
              </span>
              {currentPatient.abhaConnected && (
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-100">
                  <svg className="w-3 h-3 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  ABHA Connected
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              {currentPatient.abhaLabel || currentPatient.abhaId || "rahul34@abdm"}{" "}
              <span className="text-slate-300">·</span>{" "}
              <span className="font-sans">{currentPatient.room || "OPD Room 14"}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          In Consultation
        </div>
      </section>

      {/* Progress & Notification Bar */}
      <section className="px-6 py-2.5 flex items-center justify-between flex-shrink-0 text-xs gap-4">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">
            Physician Verification: <strong className="text-slate-800 font-semibold">{verifiedCount}/{totalCount} sections</strong> verified
          </span>
          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#00594C] rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-normal">
            <svg className="w-3.5 h-3.5 text-amber-600 stroke-[2] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            AI-generated content requires physician review before clinical use
          </div>
          <button
            onClick={handleBackToConsultation}
            className="bg-[#00594C] hover:bg-[#00473D] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            type="button"
          >
            Back to Active Consultancy
            <span className="text-slate-300">→</span>
          </button>
        </div>
      </section>

      {/* Verification Sections Workspace */}
      <main className="flex-1 overflow-y-auto px-6 py-2 space-y-3 w-full min-h-0">
        {sections.map((sec) => {
          const isVerified = sec.status === "verified";
          const isEditing = editingId === sec.id;

          return (
            <article
              key={sec.id}
              className={`bg-white rounded-lg p-4 shadow-sm transition-colors ${
                isVerified ? "border border-slate-200" : "border-2 border-amber-200/90"
              }`}
            >
              {/* Header inside card */}
              <div
                className={`flex items-center justify-between pb-2 mb-2 border-b ${
                  isVerified ? "border-slate-100" : "border-amber-100"
                }`}
              >
                <h3 className="font-bold text-slate-800 text-xs tracking-tight">{sec.title}</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold tracking-wide ${
                      sec.source === "AI Extracted"
                        ? "text-amber-700 bg-amber-50/80 px-1.5 py-0.5 rounded"
                        : "text-slate-500 uppercase"
                    }`}
                  >
                    {sec.source}
                  </span>
                  {isVerified ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-tight">
                      PHYSICIAN VERIFIED{" "}
                      <span className="font-normal text-emerald-600">
                        · {sec.verifiedBy || "Dr. Sharma"} · {sec.verifiedAt || "10:18 AM"}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-tight">
                      NEEDS PHYSICIAN REVIEW
                    </span>
                  )}
                </div>
              </div>

              {/* Content / Edit View */}
              {isEditing ? (
                <div className="space-y-2 mt-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00594C] focus:border-[#00594C] resize-none"
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => saveEdit(sec.id)}
                      className="px-3 py-1 text-xs font-semibold text-white bg-[#00594C] hover:bg-[#00473D] rounded shadow-sm transition-colors"
                      type="button"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">{sec.content}</p>

                  {/* Actions */}
                  <div className="mt-3.5 flex items-center gap-2">
                    {!isVerified && (
                      <button
                        onClick={() => handleAcceptAndVerify(sec.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#00594C] hover:bg-[#00473D] rounded shadow-sm transition-colors cursor-pointer"
                        type="button"
                      >
                        <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Accept & Verify
                      </button>
                    )}

                    <button
                      onClick={() => startEditing(sec)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                      type="button"
                    >
                      <svg className="w-3 h-3 text-slate-400 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Edit
                    </button>

                    {isVerified ? (
                      <button
                        onClick={() => handleUnverify(sec.id)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                        type="button"
                      >
                        Unverify
                      </button>
                    ) : (
                      <button
                        onClick={() => deleteSection(sec.id)}
                        className="px-2 py-1.5 text-xs text-rose-500 bg-white border border-rose-200 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Delete section"
                        type="button"
                      >
                        <svg className="w-3.5 h-3.5 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </>
              )}
            </article>
          );
        })}
      </main>
    </div>
  );
}
