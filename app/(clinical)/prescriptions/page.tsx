"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { dashboardService, QueuePatient } from "@/lib/services/dashboard.service";
import { useClinicalWorkflowStore } from "@/stores/clinical-workflow.store";

interface PrescribedMedication {
  id: string;
  name: string;
  generic: string;
  dose: string;
  frequency: string;
  timing: string;
  duration: string;
  route: string;
  instructions: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function PrescriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeEncounter = useClinicalWorkflowStore((s) => s.activeEncounter);

  const [patient, setPatient] = useState<QueuePatient | null>(null);
  const [loading, setLoading] = useState(true);

  // Workflow mode: 'builder' | 'review' | 'signed'
  const [mode, setMode] = useState<"builder" | "review" | "signed">("builder");

  // Medication search state
  const [searchQuery, setSearchQuery] = useState("");

  // Prescribed medications list
  const [medications, setMedications] = useState<PrescribedMedication[]>([
    {
      id: "med-1",
      name: "Ondansetron",
      generic: "Ondansetron HCl",
      dose: "4 mg",
      frequency: "TDS",
      timing: "30 min before meals",
      duration: "3 days",
      route: "Oral",
      instructions: "Take if nausea is severe",
    },
    {
      id: "med-2",
      name: "Pantoprazole",
      generic: "Pantoprazole sodium",
      dose: "40 mg",
      frequency: "OD",
      timing: "Before breakfast",
      duration: "7 days",
      route: "Oral",
      instructions: "Take on empty stomach",
    },
    {
      id: "med-3",
      name: "ORS (Oral Rehydration Salt)",
      generic: "Electrolyte solution",
      dose: "200 mL",
      frequency: "After each loose stool / Q2H",
      timing: "As needed",
      duration: "Till symptoms resolve",
      route: "Oral",
      instructions: "Dissolve 1 sachet in 1 litre of clean water",
    },
  ]);

  // Dietary, Warning & Follow-up notes
  const [dietaryAdvice, setDietaryAdvice] = useState(
    "Bland diet — rice, curd, bananas. Avoid spicy and oily food for 5–7 days. Stay hydrated. Avoid outside food during recovery."
  );
  const [warningSigns, setWarningSigns] = useState(
    "Return immediately if: severe worsening of pain, blood in stools, persistent vomiting (unable to retain fluids), high fever, or signs of dehydration."
  );
  const [followUpDays, setFollowUpDays] = useState("3–5 days");

  // Toasts state
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
    let token = searchParams.get("token");
    if (!token && activeEncounter) {
      token = activeEncounter.token;
    }
    if (!token && typeof window !== "undefined") {
      try {
        const stored = window.sessionStorage.getItem("activeEncounter");
        if (stored) {
          const enc = JSON.parse(stored);
          token = enc.token;
        }
      } catch {
        // ignore parse error
      }
    }
    if (!token) {
      token = "#42"; // Default patient context
    }

    let cancelled = false;
    dashboardService
      .getPatientByToken(token)
      .then((data) => {
        if (cancelled) return;
        const targetPatient = data || {
          id: `p-${token}`,
          token: token.startsWith("#") ? token : `#${token}`,
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

        // Dynamic initial medications & advice from sessionStorage or patient complaint
        const normToken = targetPatient.token.startsWith("#") ? targetPatient.token : `#${targetPatient.token}`;
        const storedKey = `prescription_${normToken}`;
        try {
          const storedRx = window.sessionStorage.getItem(storedKey);
          if (storedRx) {
            const parsed = JSON.parse(storedRx);
            if (parsed.medications && Array.isArray(parsed.medications)) {
              setMedications(parsed.medications);
              if (parsed.dietaryAdvice) setDietaryAdvice(parsed.dietaryAdvice);
              if (parsed.warningSigns) setWarningSigns(parsed.warningSigns);
              if (parsed.followUpDays) setFollowUpDays(parsed.followUpDays);
              setLoading(false);
              return;
            }
          }
        } catch {}

        // Complaint-based default prescription
        const complaint = (targetPatient.chiefComplaint || "").toLowerCase();
        if (complaint.includes("knee") || complaint.includes("joint")) {
          setMedications([
            { id: "med-1", name: "Paracetamol", generic: "Acetaminophen", dose: "650 mg", frequency: "TDS", timing: "After meals", duration: "5 days", route: "Oral", instructions: "Take after food for pain" },
            { id: "med-2", name: "Diclofenac Gel", generic: "Diclofenac topical", dose: "1 tube", frequency: "BD", timing: "Local application", duration: "7 days", route: "Topical", instructions: "Apply gently over joint" },
          ]);
        } else if (complaint.includes("fever") || complaint.includes("cough")) {
          setMedications([
            { id: "med-1", name: "Paracetamol", generic: "Acetaminophen", dose: "500 mg", frequency: "TDS", timing: "After meals", duration: "3 days", route: "Oral", instructions: "For fever > 100°F" },
            { id: "med-2", name: "Levocetirizine", generic: "Levocetirizine HCl", dose: "5 mg", frequency: "HS", timing: "At bedtime", duration: "5 days", route: "Oral", instructions: "May cause drowsiness" },
          ]);
        } else if (complaint.includes("chest") || complaint.includes("sob") || complaint.includes("breath")) {
          setMedications([
            { id: "med-1", name: "Aspirin", generic: "Acetylsalicylic acid", dose: "75 mg", frequency: "OD", timing: "After breakfast", duration: "30 days", route: "Oral", instructions: "Take with water" },
            { id: "med-2", name: "Atorvastatin", generic: "Atorvastatin calcium", dose: "20 mg", frequency: "HS", timing: "At bedtime", duration: "30 days", route: "Oral", instructions: "Take regularly" },
          ]);
        } else {
          setMedications([
            { id: "med-1", name: "Ondansetron", generic: "Ondansetron HCl", dose: "4 mg", frequency: "TDS", timing: "30 min before meals", duration: "3 days", route: "Oral", instructions: "Take if nausea is severe" },
            { id: "med-2", name: "Pantoprazole", generic: "Pantoprazole sodium", dose: "40 mg", frequency: "OD", timing: "Before breakfast", duration: "7 days", route: "Oral", instructions: "Take on empty stomach" },
            { id: "med-3", name: "ORS (Oral Rehydration Salt)", generic: "Electrolyte solution", dose: "200 mL", frequency: "After each loose stool", timing: "As needed", duration: "Till symptoms resolve", route: "Oral", instructions: "Dissolve 1 sachet in 1 litre clean water" },
          ]);
        }

        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, activeEncounter]);

  const medIdRef = useRef(10);

  // Actions
  const handleAddMedication = (medName?: string) => {
    const nameToAdd = medName || searchQuery.trim();
    if (!nameToAdd) return;

    medIdRef.current += 1;
    const newMed: PrescribedMedication = {
      id: `med-${medIdRef.current}`,
      name: nameToAdd.replace(/^\+\s*/, ""),
      generic: "Generic Formula",
      dose: "500 mg",
      frequency: "BD",
      timing: "After meals",
      duration: "5 days",
      route: "Oral",
      instructions: "Take with water",
    };

    setMedications((prev) => [...prev, newMed]);
    setSearchQuery("");
    addToast(`Added "${newMed.name}" to prescription`, "success");
  };

  const handleRemoveMedication = (id: string) => {
    const med = medications.find((m) => m.id === id);
    setMedications((prev) => prev.filter((m) => m.id !== id));
    addToast(`Removed "${med?.name || "Medication"}"`, "info");
  };

  const handleFinalizeAndSign = () => {
    setMode("signed");
    const currentToken = patient?.token || activeEncounter?.token || "#42";
    const normToken = currentToken.startsWith("#") ? currentToken : `#${currentToken}`;
    const cleanToken = currentToken.replace(/^#/, "");

    try {
      window.sessionStorage.setItem(
        `prescription_${normToken}`,
        JSON.stringify({
          medications,
          dietaryAdvice,
          warningSigns,
          followUpDays,
          signedAt: new Date().toISOString(),
        })
      );
    } catch {
      // ignore
    }

    addToast("Prescription signed and synced to ABDM Health Record & EMR", "success");

    setTimeout(() => {
      router.push(`/queue/${cleanToken}/completed`);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <p className="text-sm text-slate-400">Loading prescription...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 bg-[#eef2f6] -m-8 p-6 min-h-screen text-[13px] text-slate-700 relative">
      {/* Toast Notifications Container */}
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

      {/* Top Header Mode Switcher Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          {mode !== "builder" && (
            <button
              onClick={() => setMode("builder")}
              className="p-1 text-slate-500 hover:text-slate-800 transition"
              title="Back to Prescription Builder"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </button>
          )}
          <h2 className="text-sm font-bold text-slate-800">
            {mode === "builder"
              ? "Prescription Builder"
              : mode === "review"
              ? "Prescription Review & Sign"
              : "Prescription Signed & Completed"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("builder")}
            className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
              mode === "builder"
                ? "bg-[#00594c] text-white border-[#00594c]"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
            type="button"
          >
            Builder
          </button>
          <button
            onClick={() => setMode("review")}
            className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
              mode === "review" || mode === "signed"
                ? "bg-[#00594c] text-white border-[#00594c]"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
            type="button"
          >
            Review &amp; Sign
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: PRESCRIPTION BUILDER */}
      {mode === "builder" && (
        <div className="max-w-[1340px] mx-auto flex gap-5 items-start">
          {/* Main Left/Center Column */}
          <div className="flex-1 space-y-4 min-w-0">
            {/* Patient Info Banner */}
            <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#e3f4f1] text-[#00594C] font-semibold text-sm flex items-center justify-center shrink-0">
                    {getInitials(patient?.name || "Rahul S.")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[15px] font-bold text-slate-900">{patient?.name || "Rahul S."}</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {patient?.age || 34} yrs · {patient?.gender === "M" ? "Male" : "Female"}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium border border-slate-200">
                        Token {patient?.token || "#42"}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-medium border border-emerald-200 flex items-center gap-1">
                        <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
                        </svg>
                        ABHA Connected
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span>{patient?.abhaLabel || "rahul34@abdm"}</span>
                      <span>·</span>
                      <span>{patient?.room || "OPD Room 14"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full border border-emerald-100 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  In Consultation
                </div>
              </div>
            </section>

            {/* Diagnosis Linked Banner */}
            <div className="bg-[#f2faf7] border border-[#c4eade] rounded-lg px-4 py-2.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
                </svg>
                <span>Diagnosis: <span className="font-normal text-emerald-800">Acute Gastroenteritis (ICD K52.9) · Dr. A. Sharma</span></span>
              </div>
              <div className="text-xs text-slate-400">
                Allergy alert: <span className="text-slate-500 font-medium">{patient?.allergyWarning?.allergen || "Penicillin"}</span>
              </div>
            </div>

            {/* Medication Search Section */}
            <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13.5px] font-semibold text-slate-800">Medication Search</h2>
                <span className="text-[11px] text-slate-400">Quick prescribe · salt lookup</span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddMedication()}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 placeholder-slate-400"
                    placeholder="Search medicine, salt / generic name, or brand..."
                    type="text"
                  />
                </div>
                <button
                  onClick={() => handleAddMedication()}
                  className="bg-[#00594c] hover:bg-teal-800 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
                  type="button"
                >
                  <span>+</span> Add
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {["+ Paracetamol 500mg", "+ Metronidazole 400mg", "+ Domperidone 10mg", "+ Loperamide 2mg", "+ Ranitidine 150mg"].map((med) => (
                  <button
                    key={med}
                    onClick={() => handleAddMedication(med)}
                    className="text-[11px] font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded border border-slate-200 transition-colors"
                    type="button"
                  >
                    {med}
                  </button>
                ))}
              </div>
            </section>

            {/* Prescribed Medications Table */}
            <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h2 className="text-[13.5px] font-semibold text-slate-800">Prescribed Medications ({medications.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase bg-slate-50/50 border-b border-slate-100">
                      <th className="py-2.5 px-4 font-semibold">MEDICINE</th>
                      <th className="py-2.5 px-3 font-semibold">SALT / GENERIC</th>
                      <th className="py-2.5 px-3 font-semibold">DOSE</th>
                      <th className="py-2.5 px-3 font-semibold">FREQUENCY</th>
                      <th className="py-2.5 px-3 font-semibold">TIMING</th>
                      <th className="py-2.5 px-3 font-semibold">DURATION</th>
                      <th className="py-2.5 px-3 font-semibold">ROUTE</th>
                      <th className="py-2.5 px-4 font-semibold text-right">INSTRUCTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11.5px] text-slate-600">
                    {medications.map((med) => (
                      <tr key={med.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{med.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">Rx</div>
                        </td>
                        <td className="py-3 px-3 text-slate-500">{med.generic}</td>
                        <td className="py-3 px-3 font-bold text-slate-800">{med.dose}</td>
                        <td className="py-3 px-3 text-slate-600 font-medium">{med.frequency}</td>
                        <td className="py-3 px-3 text-slate-500">{med.timing}</td>
                        <td className="py-3 px-3 text-slate-500">{med.duration}</td>
                        <td className="py-3 px-3 text-slate-500">{med.route}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-slate-500 max-w-[130px] leading-tight text-left">{med.instructions}</span>
                            <button
                              onClick={() => handleRemoveMedication(med.id)}
                              className="text-red-400 hover:text-red-600 p-0.5 transition-colors"
                              title="Delete medication"
                              type="button"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Advice & Warning Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                <h3 className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider mb-2">DIETARY &amp; LIFESTYLE ADVICE</h3>
                <textarea
                  value={dietaryAdvice}
                  onChange={(e) => setDietaryAdvice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-600 leading-relaxed resize-none focus:outline-none focus:bg-white focus:border-teal-600"
                  rows={3}
                />
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                <h3 className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider mb-2">EMERGENCY WARNING SIGNS</h3>
                <textarea
                  value={warningSigns}
                  onChange={(e) => setWarningSigns(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-600 leading-relaxed resize-none focus:outline-none focus:bg-white focus:border-teal-600"
                  rows={3}
                />
              </div>
            </div>

            {/* Follow-Up Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider mb-3">FOLLOW-UP</div>
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                <span>Revisit after</span>
                <input
                  type="text"
                  value={followUpDays}
                  onChange={(e) => setFollowUpDays(e.target.value)}
                  className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-slate-800 text-sm shadow-xs max-w-[110px] text-center"
                />
                <span className="text-slate-500">if not improving</span>
              </div>
            </div>
          </div>

          {/* Right Side Status Panel */}
          <aside className="w-80 bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-5 flex-shrink-0">
            <h2 className="text-sm font-bold text-slate-800">Prescription Status</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <div className="text-emerald-600 mt-0.5">
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Medications</p>
                  <p className="text-xs text-slate-500 font-medium">{medications.length} added</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="text-emerald-600 mt-0.5">
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Diagnosis linked</p>
                  <p className="text-xs text-slate-500">Acute Gastroenteritis</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="text-emerald-600 mt-0.5">
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Allergy check</p>
                  <p className="text-xs text-slate-500">Penicillin flag active</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="text-emerald-600 mt-0.5">
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">ABDM Validation</p>
                  <p className="text-xs text-slate-500">Ready</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="text-amber-600 mt-0.5">
                  <svg className="w-3.5 h-3.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Digital Signature</p>
                  <p className="text-xs text-slate-500">Pending</p>
                </div>
              </div>
            </div>

            <div className="bg-[#f0fdf9] border border-teal-200/80 rounded-lg p-3 flex items-start gap-2.5">
              <div className="text-teal-700 mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-teal-900">ABDM Ready</p>
                <p className="text-[11px] text-teal-700 mt-0.5">Prescription will sync to health record</p>
              </div>
            </div>

            <button
              onClick={() => setMode("review")}
              className="w-full bg-[#00594c] hover:bg-teal-800 text-white font-semibold text-xs py-2.5 px-4 rounded-md shadow-sm transition-colors text-center"
              type="button"
            >
              Review &amp; Sign Prescription
            </button>
          </aside>
        </div>
      )}

      {/* VIEW MODE 2 & 3: PRESCRIPTION REVIEW & SIGN / SIGNED */}
      {(mode === "review" || mode === "signed") && (
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 items-start">
          {/* Prescription Document Sheet */}
          <section className="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#00594C] text-white p-6 pb-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">AarogyaFlow Clinical Edition</h3>
                  <p className="text-xs text-teal-100/90 mt-1 font-normal">City Government Hospital, Jaipur · OPD Department</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-teal-100/80">Rx <span className="text-white font-medium">#AF-2026-0942</span></p>
                  <p className="text-xs text-teal-100/90 mt-1">9 Sep 2026</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-6 pb-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">Patient</span>
                  <h4 className="text-base font-bold text-slate-900">{patient?.name || "Rahul S."}</h4>
                  <p className="text-xs text-slate-600">{patient?.age || 34} years · Male · DOB: 12 Mar 1992</p>
                  <p className="text-xs text-slate-600">ABHA: <span className="font-mono text-slate-700">{patient?.abhaLabel || "rahul34@abdm"}</span></p>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 bg-[#E8F5E9] text-[#1E7E34] text-[11px] font-medium px-2 py-0.5 rounded border border-[#C3E6CB]">
                      <svg className="w-3 h-3 text-[#1E7E34]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
                      </svg>
                      ABHA Verified
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">Prescribing Physician</span>
                  <h4 className="text-base font-bold text-slate-900">Dr. A. Sharma</h4>
                  <p className="text-xs text-slate-600">MBBS, MD (General Medicine)</p>
                  <p className="text-xs text-slate-600">NMC Reg: MH-12345 · City Hospital OPD 14</p>
                </div>
              </div>

              {/* Diagnosis Box */}
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1.5">Diagnosis</span>
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-slate-900">Acute Gastroenteritis</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">ICD-10: K52.9</p>
                </div>
              </div>

              {/* Rx Medications */}
              <div>
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block mb-3">Rx — Medications</span>
                <div className="space-y-3.5">
                  {medications.map((med, idx) => (
                    <div key={med.id}>
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-[#00594C]">{idx + 1}.</span>
                          <h5 className="font-bold text-slate-900 text-sm">{med.name} {med.dose}</h5>
                        </div>
                        <p className="text-slate-600 pl-4">{med.frequency} · {med.timing} · {med.duration} · {med.route}</p>
                        {med.instructions && (
                          <p className="text-slate-500 italic pl-4 text-[11px]">{med.instructions}</p>
                        )}
                      </div>
                      {idx < medications.length - 1 && <div className="border-t border-slate-100 my-2" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice & Warning */}
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1">Dietary Advice</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{dietaryAdvice}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1">Follow-up</span>
                  <p className="text-xs text-slate-600 leading-relaxed">Review in {followUpDays} if symptoms not improving or worsening.</p>
                </div>
              </div>

              <div className="bg-[#FEF9EE] border border-[#FDE68A] rounded-lg p-3 text-xs text-[#92400E]">
                <span className="font-bold block mb-0.5">Emergency Warning Signs</span>
                <p className="text-[11px] text-[#A16207] leading-normal">{warningSigns}</p>
              </div>
            </div>
          </section>

          {/* Action Sidebar */}
          <aside className="col-span-12 lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h4 className="font-semibold text-slate-900 text-sm mb-3.5">Pre-Sign Checklist</h4>
              <ul className="space-y-2.5 text-xs">
                {[
                  "Patient identity confirmed",
                  "Diagnosis correctly listed",
                  "Allergy check passed (Penicillin)",
                  "Medication dosages verified",
                  "Instructions included",
                  "Follow-up specified",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 text-amber-700 font-medium pt-0.5">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      mode === "signed" ? "bg-emerald-100 text-emerald-600" : "border border-slate-300"
                    }`}
                  >
                    {mode === "signed" && (
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
                      </svg>
                    )}
                  </span>
                  <span>{mode === "signed" ? "Digital signature completed" : "Digital signature pending"}</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h4 className="font-semibold text-slate-900 text-sm mb-3">On Signing</h4>
              <div className="space-y-3 text-xs">
                {[
                  { title: "ABDM Health Record", status: mode === "signed" ? "Synced" : "Will sync" },
                  { title: "Hospital EMR", status: mode === "signed" ? "Synced" : "Will sync" },
                  { title: "Patient (SMS + App)", status: mode === "signed" ? "Dispatched" : "Will dispatch" },
                  { title: "Pharmacy Queue", status: mode === "signed" ? "Dispatched" : "Will dispatch" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">{item.title}</span>
                    <span className={mode === "signed" ? "text-emerald-600 font-semibold text-[11px]" : "text-slate-400 text-[11px]"}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {mode !== "signed" ? (
                <button
                  onClick={handleFinalizeAndSign}
                  className="w-full bg-[#00594C] hover:bg-[#00473D] text-white py-3 rounded-lg text-sm font-semibold tracking-wide transition shadow-sm flex items-center justify-center gap-2"
                  type="button"
                >
                  Finalize &amp; Sign Prescription
                </button>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center space-y-2">
                  <div className="text-emerald-800 font-bold text-sm">✓ Prescription Signed &amp; Dispatched</div>
                  <button
                    onClick={() => router.push("/queue")}
                    className="w-full bg-[#00594C] text-white py-2 rounded text-xs font-semibold"
                    type="button"
                  >
                    Return to Patient Queue
                  </button>
                </div>
              )}

              <button
                onClick={() => setMode("builder")}
                className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                type="button"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
                Edit Prescription
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default function PrescriptionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Prescription...</div>}>
      <PrescriptionContent />
    </Suspense>
  );
}
