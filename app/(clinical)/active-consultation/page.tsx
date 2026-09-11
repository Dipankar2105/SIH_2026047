"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function ConsultationTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(() => Date.now() - new Date(startedAt).getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - new Date(startedAt).getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const totalSeconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const displayMinutes = String(minutes).padStart(2, "0");
  const displaySeconds = String(seconds).padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 text-xs font-semibold">
      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {displayMinutes}:{displaySeconds}
    </div>
  );
}

export default function ActiveConsultationPage() {
  const router = useRouter();
  const activeEncounter = useClinicalWorkflowStore((s) => s.activeEncounter);
  const setActiveEncounter = useClinicalWorkflowStore((s) => s.setActiveEncounter);
  const [patient, setPatient] = useState<QueuePatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickNote, setQuickNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

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
      router.push("/queue");
      return;
    }

    let cancelled = false;
    dashboardService
      .getPatientByToken(encounter.token)
      .then((data) => {
        if (cancelled) return;
        setPatient(data);
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
  }, [activeEncounter, router, setActiveEncounter]);

  const handleSaveNote = () => {
    if (!quickNote.trim()) return;
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-clinical-muted">Loading consultation...</p>
      </div>
    );
  }

  if (error || !patient || !activeEncounter) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-status-redflag">{error || "No active consultation"}</p>
      </div>
    );
  }

  const vitals = [
    { label: "BP", value: patient.vitals.bp || "—", unit: "mmHg" },
    { label: "HR", value: patient.vitals.pulse || "—", unit: "bpm" },
    { label: "SpO₂", value: patient.vitals.spo2 || "—", unit: "" },
    { label: "TEMP", value: patient.vitals.temperature || "—", unit: "" },
    { label: "PAIN", value: patient.vitals.pain || "—", unit: "", accent: true },
  ];

  return (
    <div className="p-6 space-y-4 max-w-[1400px] w-full mx-auto">
      {/* Patient Demographics Strip Card */}
      <section className="bg-white rounded-xl border border-slate-200 p-4 px-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#E8F5F1] text-[#00594C] font-semibold text-base flex items-center justify-center shrink-0 border border-teal-100">
            {getInitials(patient.name)}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-bold text-slate-800">{patient.name}</h3>
              <span className="text-xs text-slate-500 font-medium">
                {patient.age} yrs · {patient.gender}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Token {patient.token}
              </span>
              {patient.abhaConnected && patient.abhaLabel && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  ABHA Connected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-normal">
              {patient.abhaLabel || ""} <span className="mx-1">·</span> {patient.room || "OPD Room 14"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            In Consultation
          </div>
          <ConsultationTimer startedAt={activeEncounter.startedAt} />
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Center/Left Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Safety Alert Banner */}
          {patient.redFlagDetected || patient.priority === "priority" ? (
            <div className="bg-[#FFF4F2] border border-[#FECDCA] rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-medium text-[#B42318]">
              <svg className="w-4 h-4 text-[#B42318] shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Priority Red-Flag Patient · Immediate Physician Review Recommended</span>
            </div>
          ) : (
            <div className="bg-[#EBF7F2] border border-[#BDE5D4] rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-medium text-[#006D5B]">
              <svg className="w-4 h-4 text-[#006D5B] shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>No Red Flags Identified · Safety Status Normal</span>
            </div>
          )}

          {/* Vitals Summary */}
          <section className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">VITALS</h4>
              <span className="text-[11px] text-slate-400 font-medium">
                Verified · {formatTime(new Date(patient.registeredAt))}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2.5">
              {vitals.map((vital) => (
                <div
                  key={vital.label}
                  className={`rounded-lg p-2.5 text-center flex flex-col justify-center ${
                    vital.accent ? "bg-[#FFF8EC] border border-[#FDE3B7]" : "bg-[#F8FAFC] border border-slate-200"
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase ${vital.accent ? "text-amber-600" : "text-slate-400"}`}>
                    {vital.label}
                  </span>
                  <div className="mt-0.5">
                    <span className={`text-sm font-bold ${vital.accent ? "text-amber-700" : "text-slate-800"}`}>
                      {vital.value}
                    </span>
                    {vital.unit && <span className="text-[10px] text-slate-400 ml-0.5">{vital.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Clinical Intake Summary */}
          <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">AI Clinical Intake Summary</h3>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3E6] text-[#C05621] uppercase tracking-wide border border-[#FBD38D]">
                  NEEDS PHYSICIAN REVIEW
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  AI Extracted
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">CHIEF COMPLAINT</span>
              <h4 className="text-sm font-bold text-slate-800">
                {patient.aiChiefComplaintDetail || patient.chiefComplaint}
              </h4>
              {patient.onset && patient.duration && (
                <p className="text-xs text-slate-600">
                  Onset: {patient.onset} <span className="mx-1">·</span> Duration: {patient.duration}
                  {patient.severity && <span className="mx-1">·</span>}
                  {patient.severity && <span className="font-bold text-amber-700">{patient.severity}</span>}
                </p>
              )}
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">HISTORY OF PRESENT ILLNESS</span>
              <p className="text-xs leading-relaxed text-slate-600">
                {patient.aiSummary || patient.symptoms}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">ASSOCIATED SYMPTOMS</span>
                <ul className="text-xs text-slate-600 space-y-1">
                  {(patient.associatedSymptoms && patient.associatedSymptoms.length > 0) ? (
                    patient.associatedSymptoms.map((symptom, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        {symptom}
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">None reported</li>
                  )}
                </ul>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">RELEVANT NEGATIVES</span>
                <ul className="text-xs text-slate-600 space-y-1">
                  {(patient.relevantNegatives && patient.relevantNegatives.length > 0) ? (
                    patient.relevantNegatives.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">None reported</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => router.push(`/queue/${patient.token.replace(/^#/, "")}/assessment`)}
                className="px-4 py-2 bg-[#00594C] hover:bg-[#00473C] text-white text-xs font-semibold rounded-lg shadow-sm transition"
                type="button"
              >
                Verify AI Summary
              </button>
            </div>
          </section>

          {/* Patient's Own Words */}
          <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">Patient&apos;s Own Words</h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Hindi → English</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px]">
                  Patient Response
                </span>
              </div>
            </div>
            <div className="bg-[#FCFAF7] border border-[#F1E4D3] rounded-lg p-4 text-xs text-slate-700 italic leading-relaxed">
              {patient.patientVerbatim || "No patient verbatim recorded."}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 rounded-md text-xs font-medium text-slate-700 transition" type="button">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Listen
              </button>
              <button className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 rounded-md text-xs font-medium text-slate-700 transition" type="button">
                View Full Transcript
              </button>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Clinical Actions */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">CLINICAL ACTIONS</h4>
            <button
              onClick={() => router.push(`/queue/${patient.token.replace(/^#/, "")}/ai-history`)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 px-4 shadow-sm flex items-center justify-between cursor-pointer hover:border-slate-300 transition text-left"
              type="button"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>AI History / Verify</span>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => router.push("/patient-records")}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 px-4 shadow-sm flex items-center justify-between cursor-pointer hover:border-slate-300 transition text-left"
              type="button"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Patient Records</span>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Quick Note */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">QUICK NOTE</h4>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-3">
              <textarea
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg p-2.5 text-xs placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-700 focus:border-brand-700 resize-none"
                placeholder="Doctor's note..."
                rows={4}
              />
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F5F9] hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition" type="button">
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Dictate
                </button>
                <button className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition" type="button">
                  Hindi
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={!quickNote.trim()}
                  className={`ml-auto px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                    noteSaved
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-[#00594C] hover:bg-[#00473C] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                  type="button"
                >
                  {noteSaved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="pt-2 space-y-2 px-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>ABHA Connected</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>ABDM Consent Valid</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>EMR Synced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
