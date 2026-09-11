"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { dashboardService, QueuePatient } from "@/lib/services/dashboard.service";
import { useClinicalWorkflowStore } from "@/stores/clinical-workflow.store";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ConsultationCompletedPage() {
  const params = useParams();
  const rawToken = params.token as string;
  const router = useRouter();

  const activeEncounter = useClinicalWorkflowStore((s) => s.activeEncounter);
  const setActiveEncounter = useClinicalWorkflowStore((s) => s.setActiveEncounter);

  const [currentPatient, setCurrentPatient] = useState<QueuePatient | null>(null);
  const [nextPatient, setNextPatient] = useState<QueuePatient | null>(null);
  const [loading, setLoading] = useState(true);

  const targetToken = activeEncounter?.token || rawToken || "#42";
  const normalizedToken = targetToken.startsWith("#") ? targetToken : `#${targetToken}`;

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      dashboardService.getPatientByToken(targetToken),
      dashboardService.getQueuePatients(),
    ])
      .then(([patientData, allPatients]) => {
        if (cancelled) return;

        // Current patient setup
        const p = patientData || {
          id: `p-${targetToken}`,
          token: normalizedToken,
          name: "Rahul S.",
          age: 34,
          gender: "M",
          abhaId: "ABHA-2345-6789-0123-4567",
          intakeStatus: "linked" as const,
          chiefComplaint: "Abdominal pain & cramping",
          symptoms: "Lower abdominal pain",
          vitals: { bp: "122/80", pulse: "76" },
          priority: "normal" as const,
          redFlagDetected: false,
          status: "completed" as const,
          registeredAt: new Date().toISOString(),
          abhaConnected: true,
          abhaLabel: "rahul34@abdm",
          room: "OPD Room 14",
        };
        setCurrentPatient(p);

        // Find next waiting / ready patient in queue
        const next = allPatients.find(
          (item) => item.token !== normalizedToken && item.status !== "completed"
        );

        setNextPatient(
          next || {
            id: "p3",
            token: "#43",
            name: "Meera Patel",
            age: 52,
            gender: "F",
            abhaId: "ABHA-3456-7890-1234-5678",
            intakeStatus: "linked",
            chiefComplaint: "Bilateral knee pain, stiffness",
            symptoms: "Pain in both knees, morning stiffness",
            vitals: { bp: "138/86" },
            priority: "normal",
            redFlagDetected: false,
            status: "waiting",
            registeredAt: new Date().toISOString(),
          }
        );
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [targetToken, normalizedToken]);

  const handleCallNextPatient = () => {
    if (!nextPatient) {
      router.push("/queue");
      return;
    }

    // 1. Mark current patient completed in sessionStorage / store
    try {
      if (currentPatient) {
        setCurrentPatient((prev) => (prev ? { ...prev, status: "completed" } : null));
      }
      window.sessionStorage.setItem(`completed_${normalizedToken}`, "true");

      // 2. Clear old active doctor workspace clinical data to enforce privacy
      window.sessionStorage.removeItem(`assessment_${normalizedToken}`);
      window.sessionStorage.removeItem(`investigations_${normalizedToken}`);
      window.sessionStorage.removeItem(`prescription_${normalizedToken}`);
      window.sessionStorage.removeItem(`ai_history_${normalizedToken}`);
    } catch {
      // ignore
    }

    // 3. Set next patient as the active encounter in store & sessionStorage
    const nextTokenClean = nextPatient.token.replace(/^#/, "");
    const nextEncounter = {
      patientId: nextPatient.id,
      token: nextPatient.token,
      priority: nextPatient.priority || "normal",
      startedAt: new Date().toISOString(),
    };

    setActiveEncounter(nextEncounter);
    try {
      window.sessionStorage.setItem("activeEncounter", JSON.stringify(nextEncounter));
    } catch {
      // ignore
    }

    // 4. Navigate to next patient's fresh consultation context
    router.push(`/queue/${nextTokenClean}/consultation`);
  };

  const handleReturnToQueue = () => {
    try {
      window.sessionStorage.setItem(`completed_${normalizedToken}`, "true");
    } catch {
      // ignore
    }
    router.push("/queue");
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F4F6F8]">
        <p className="text-sm text-slate-400">Loading completed consultation...</p>
      </div>
    );
  }

  const patientObj = currentPatient || {
    token: normalizedToken,
    name: "Rahul S.",
    age: 34,
    gender: "M",
    abhaLabel: "rahul34@abdm",
  };

  const nextObj = nextPatient || {
    token: "#43",
    name: "Meera Patel",
    age: 52,
    gender: "F",
    chiefComplaint: "Bilateral knee pain · AI Intake Complete",
  };

  const formattedGender = patientObj.gender === "M" ? "M" : patientObj.gender === "F" ? "F" : patientObj.gender;

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#F4F6F8] text-slate-800 antialiased overflow-y-auto">
      {/* Header Bar */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <h2 className="text-base font-bold text-slate-800">Consultation Completed</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </span>
            <input
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00594C] focus:border-[#00594C]"
              placeholder="Search by ABHA ID or name..."
              type="text"
            />
          </div>
          <span className="text-xs font-medium text-slate-600">10:42 AM</span>
          <button aria-label="Notifications" className="relative p-1 text-slate-500 hover:text-slate-700 transition-colors" type="button">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
          </button>
          <div className="w-7 h-7 rounded-full bg-[#D1E5E1] text-[#00594C] text-[11px] font-bold flex items-center justify-center ml-1">
            DS
          </div>
        </div>
      </header>

      {/* Main Dashboard Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Success Banner */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#00594C] text-white flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Consultation Completed Successfully</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {patientObj.name} · Token {patientObj.token} · 9 Sep 2026 · 10:42 AM · Consultation duration: 22 min
              </p>
            </div>
          </div>
          <div className="text-right pl-4">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Encounter ID</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5 tracking-tight font-sans">ENC-4291</p>
          </div>
        </section>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Summary + Investigations */}
          <div className="lg:col-span-7 space-y-6">
            {/* Encounter Summary Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">Encounter Summary</h3>
              </div>
              <div className="p-5 grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-[11px] font-medium text-slate-400">Patient</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {patientObj.name} · {patientObj.age} {formattedGender} · Token {patientObj.token}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400">Physician</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">Dr. A. Sharma · OPD Room 14</p>
                </div>
                <div className="col-span-2 border-t border-slate-100 pt-3">
                  <div className="grid grid-cols-2 gap-x-6">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400">Diagnosis</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">Acute Gastroenteritis (K52.9)</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-400">AI History</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">10/10 sections verified</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 border-t border-slate-100 pt-3">
                  <div className="grid grid-cols-2 gap-x-6">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400">Medications</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">3 prescribed</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-400">Investigations</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">4 ordered</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 border-t border-slate-100 pt-3">
                  <div className="grid grid-cols-2 gap-x-6">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400">Follow-up</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">3–5 days</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-400">Consultation Type</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">Modern Medicine · OPD</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Investigations Ordered Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">Investigations Ordered</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { num: 1, name: "CBC (Complete Blood Count)" },
                  { num: 2, name: "Stool Occult Blood / H. pylori Ag" },
                  { num: 3, name: "USG Whole Abdomen" },
                  { num: 4, name: "Serum Amylase & Lipase" },
                ].map((item) => (
                  <div key={item.num} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-semibold border border-slate-200">
                        {item.num}
                      </span>
                      <span className="text-xs font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                      • Pending
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Dispatch + Next Patient Ready */}
          <div className="lg:col-span-5 space-y-6">
            {/* Post-Consultation Dispatch Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">Post-Consultation Dispatch</h3>
              </div>
              <div className="p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#E5F4F0] text-[#00594C] flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">Prescription Signed</p>
                      <p className="text-[10px] text-slate-400 font-medium">Rx #AF-2026-0942 · Dr. A. Sharma</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#00594C] bg-[#E5F4F0] px-2 py-0.5 rounded-full">Signed</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#E5F4F0] text-[#00594C] flex items-center justify-center">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">Patient Communication</p>
                      <p className="text-[10px] text-slate-400 font-medium">SMS + AarogyaFlow App notification sent</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#00594C] bg-[#E5F4F0] px-2 py-0.5 rounded-full">Dispatched</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#E5F4F0] text-[#00594C] flex items-center justify-center">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">ABDM / Health Record</p>
                      <p className="text-[10px] text-slate-400 font-medium">Synced to {patientObj.abhaLabel || "patient@abdm"} · Consent valid</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#00594C] bg-[#E5F4F0] px-2 py-0.5 rounded-full">Synced</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#E5F4F0] text-[#00594C] flex items-center justify-center">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">Hospital EMR</p>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight">City Government Hospital · Encounter ID:<br />ENC-4291</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#00594C] bg-[#E5F4F0] px-2 py-0.5 rounded-full self-center">Synced</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#E5F4F0] text-[#00594C] flex items-center justify-center">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" strokeWidth={2} />
                        <line strokeWidth={2} x1="8" x2="16" y1="12" y2="12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">Pharmacy Queue</p>
                      <p className="text-[10px] text-slate-400 font-medium">City Hospital Pharmacy · Queue #17</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#00594C] bg-[#E5F4F0] px-2 py-0.5 rounded-full">Dispatched</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="bg-slate-50/90 rounded-lg p-2.5 border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Record Integrity</p>
                    <p className="text-[10px] text-slate-600 font-mono mt-1 tracking-tight">
                      SHA-256: a3f9d2e1... · ABDM-certified · Tamper-evident
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Patient Ready Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="bg-[#00594C] px-5 py-2.5">
                <span className="text-[11px] font-bold tracking-wider text-white uppercase">Next Patient Ready</span>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#D1E5E1] text-[#00594C] font-bold flex items-center justify-center text-xs shrink-0">
                    {getInitials(nextObj.name)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{nextObj.name}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {nextObj.age} {nextObj.gender === "M" ? "M" : nextObj.gender === "F" ? "F" : nextObj.gender} · Token {nextObj.token} · Waiting 40 min
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {nextObj.chiefComplaint}
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCallNextPatient}
                    className="w-full py-2 px-4 rounded-lg bg-[#00594C] hover:bg-teal-850 text-white text-xs font-semibold shadow-sm transition-colors text-center cursor-pointer"
                    type="button"
                  >
                    Call Next Patient
                  </button>
                  <button
                    onClick={handleReturnToQueue}
                    className="w-full py-2 px-4 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors text-center cursor-pointer"
                    type="button"
                  >
                    Return to Queue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
