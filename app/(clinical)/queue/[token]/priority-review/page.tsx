"use client";

import { useEffect, useState, useMemo } from "react";
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

export default function PriorityReviewPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  const setActiveEncounter = useClinicalWorkflowStore((s) => s.setActiveEncounter);

  const [patient, setPatient] = useState<QueuePatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    dashboardService
      .getPatientByToken(token)
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
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const waitMinutes = useMemo(() => {
    if (!patient) return 0;
    return Math.max(1, Math.floor((now - new Date(patient.registeredAt).getTime()) / 60000));
  }, [now, patient]);

  const handleOpenConsultation = () => {
    if (!patient) return;
    setActiveEncounter({
      patientId: patient.id,
      token: patient.token,
      priority: patient.priority,
      startedAt: new Date().toISOString(),
    });
    router.push("/active-consultation");
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-clinical-muted">Loading priority review...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-status-redflag">{error || "Patient not found"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0">
      {/* Priority Alert Banner */}
      <div className="bg-[#B84A39] text-white px-6 py-2.5 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-white shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <span className="text-xs font-bold tracking-wider uppercase">
            PRIORITY 1 — IMMEDIATE CLINICAL REVIEW REQUIRED
          </span>
        </div>
        <div className="text-[11px] font-normal text-red-100 opacity-95">
          Flagged at {new Date(patient.registeredAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} · {waitMinutes} min ago
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-12 gap-5 max-w-[1400px]">
          {/* LEFT / CENTER COLUMN (8 cols) */}
          <div className="col-span-8 flex flex-col gap-4">
            {/* Patient Summary Card */}
            <section className="bg-white rounded-xl border-2 border-[#BC473A]/80 shadow-sm p-4 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-[#FCEBE7] text-[#A63A2A] font-bold text-base flex items-center justify-center shrink-0">
                    {getInitials(patient.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                        {patient.name}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        {patient.age} years · {patient.gender}
                      </span>
                      <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                        Token {patient.token}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      OPD Room 14 · Modern Medicine · Waiting {waitMinutes} min
                    </p>
                  </div>
                </div>
                {/* Alert Status Box */}
                <div className="border border-red-200 bg-red-50/40 rounded-lg px-4 py-1.5 text-center min-w-[120px]">
                  <span className="text-[9px] font-bold tracking-wider uppercase text-red-800 block">
                    ALERT STATUS
                  </span>
                  <span className="text-base font-extrabold text-[#A63A2A] leading-tight block">
                    Active
                  </span>
                  <span className="text-[10px] text-slate-400 block">Not yet reviewed</span>
                </div>
              </div>

              {/* Safety Disclaimer */}
              <div className="mt-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-2.5 flex items-start gap-2 text-amber-900">
                <svg
                  className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <p className="text-[11px] leading-relaxed">
                  <span className="font-bold">Safety Alert — Not a Diagnosis:</span> This alert is
                  based on patient-reported symptoms captured during AI-assisted intake. It is a
                  safety escalation mechanism, not a clinical assessment. Physician review is required
                  before any clinical decision.
                </p>
              </div>
            </section>

            {/* Patient-Reported Trigger Section */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="mb-3">
                <h4 className="text-sm font-bold text-slate-800">Patient-Reported Trigger</h4>
                <p className="text-[11px] text-slate-400">
                  Captured during AI-assisted intake — Patient&apos;s own words
                </p>
              </div>

              {/* Quote Card */}
              <div className="border border-red-200 bg-[#FFFDFD] rounded-lg p-3 relative">
                <div className="text-[10px] font-medium text-slate-400 mb-1">
                  Hindi → English · Patient Voice
                </div>
                <p className="text-xs text-slate-700 italic font-medium leading-relaxed">
                  &ldquo;{patient.patientVerbatim || patient.symptoms || patient.chiefComplaint}&rdquo;
                </p>
              </div>

              {/* Reported Symptoms Tags */}
              <div className="mt-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  REPORTED SYMPTOMS
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(patient.associatedSymptoms && patient.associatedSymptoms.length > 0
                    ? patient.associatedSymptoms
                    : (patient.symptoms || patient.chiefComplaint).split(",").map((s) => s.trim())
                  ).map((sym, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-[#FFF5F4] border border-[#F6C6C2] text-[#9E3829] font-medium">
                      {sym}
                    </span>
                  ))}
                </div>
              </div>

              {/* Available Vitals */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  AVAILABLE VITALS (KIOSK — UNVERIFIED)
                </span>
                <div className="grid grid-cols-4 gap-2.5">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-left">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">HR</span>
                    <div className="text-base font-bold text-slate-800 mt-0.5">
                      94 <span className="text-[11px] font-normal text-slate-500">bpm</span>
                    </div>
                  </div>
                  <div className="bg-[#FFF8F6] border border-[#F8D2CC] rounded-lg p-2.5 text-left">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">BP</span>
                    <div className="text-base font-bold text-[#A63A2A] mt-0.5">148/92</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-left">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">SPO₂</span>
                    <div className="text-base font-bold text-slate-800 mt-0.5">96%</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-left">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">TEMP</span>
                    <div className="text-base font-bold text-slate-800 mt-0.5">98.6°F</div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic mt-2.5">
                  * Vitals require physician verification. Not yet confirmed.
                </p>
              </div>
            </section>

            {/* Bottom Actions Row */}
            <section className="flex items-center gap-2 mt-1">
              <button
                onClick={handleOpenConsultation}
                className="flex-1 bg-[#00594C] hover:bg-[#00473D] text-white font-semibold py-2.5 px-4 rounded-lg text-xs tracking-wide shadow-sm transition"
              >
                Open Patient Consultation
              </button>
              <button
                onClick={() => router.push("/queue")}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium py-2.5 px-4 rounded-lg text-xs transition"
              >
                Review Full History
              </button>
              <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium py-2.5 px-4 rounded-lg text-xs inline-flex items-center gap-1.5 transition">
                <svg
                  className="w-3.5 h-3.5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <span>Escalate / Contact Staff</span>
              </button>
              <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium py-2.5 px-4 rounded-lg text-xs transition">
                Mark Reviewed
              </button>
            </section>
          </div>

          {/* RIGHT COLUMN (4 cols) */}
          <div className="col-span-4 flex flex-col gap-4">
            {/* Alert Timeline Card */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h4 className="text-xs font-bold text-slate-800 mb-3">Alert Timeline</h4>
              <div className="space-y-3.5 relative pl-1 text-[11px]">
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 mt-1 shrink-0" />
                  <div>
                    <span className="text-slate-400 font-medium">
                      {new Date(patient.registeredAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                    <p className="text-slate-700 leading-snug">Red flag detected during patient intake</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-teal-600 mt-1 shrink-0" />
                  <div>
                    <span className="text-slate-400 font-medium">
                      {new Date(new Date(patient.registeredAt).getTime() + 60000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                    <p className="text-slate-700 leading-snug">
                      Alert sent to OPD duty doctor (Dr. Sharma)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-teal-600 mt-1 shrink-0" />
                  <div>
                    <span className="text-slate-400 font-medium">
                      {new Date(new Date(patient.registeredAt).getTime() + 4 * 60000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                    <p className="text-slate-700 leading-snug">
                      Queue priority auto-escalated to Priority 1
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600 mt-1 shrink-0" />
                  <div>
                    <span className="text-slate-400 font-medium">Now</span>
                    <p className="text-slate-700 leading-snug">Awaiting physician review</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Patient History Context Card */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h4 className="text-xs font-bold text-slate-800 mb-3">Patient History Context</h4>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-400 font-normal">Known DM</span>
                  <span className="text-slate-700 font-medium text-right">Type 2 Diabetes (10 yr)</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-400 font-normal">Known HTN</span>
                  <span className="text-slate-700 font-medium text-right">Hypertension (6 yr)</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-400 font-normal">Medications</span>
                  <span className="text-slate-700 font-medium text-right leading-tight max-w-[180px]">
                    Metformin 500mg, Amlodipine 5mg
                  </span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-400 font-normal">Last Consult</span>
                  <span className="text-slate-700 font-medium text-right">12 Jun 2026 — OPD</span>
                </div>
                <div className="py-1.5 flex justify-between items-center">
                  <span className="text-slate-400 font-normal">ABHA</span>
                  <span className="text-teal-800 font-medium text-right">Connected · Record available</span>
                </div>
              </div>
            </section>

            {/* Physician Note Box */}
            <section className="bg-[#FEF9EE] border border-[#FDE68A] rounded-xl p-3.5 shadow-sm">
              <h5 className="text-xs font-bold text-amber-900 mb-1.5">Physician Note</h5>
              <p className="text-[11px] text-amber-900 leading-relaxed font-normal">
                This alert does not constitute a diagnosis. The physician must clinically assess the
                patient and make an independent determination. Emergency protocols remain
                physician-controlled.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
