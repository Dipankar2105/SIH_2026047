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

export default function PreBriefPage() {
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
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const waitMinutes = useMemo(() => {
    if (!patient) return 0;
    return Math.max(1, Math.floor((now - new Date(patient.registeredAt).getTime()) / 60000));
  }, [now, patient]);

  const handleStartConsultation = () => {
    if (!patient) return;
    setActiveEncounter({
      patientId: patient.id,
      token: patient.token,
      priority: patient.priority,
      startedAt: new Date().toISOString(),
    });
    router.push(`/queue/${token.replace(/^#/, "")}/consultation`);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-clinical-muted">Loading pre-consultation brief...</p>
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

  const vitals = [
    { label: "BP", value: patient.vitals.bp || "—", unit: "mmHg", width: "w-28" },
    { label: "HR", value: patient.vitals.pulse || "—", unit: "bpm", width: "w-24" },
    { label: "SPO₂", value: patient.vitals.spo2 || "—", unit: "", width: "w-20" },
    { label: "TEMP", value: patient.vitals.temperature || "—", unit: "", width: "w-24" },
    { label: "PAIN", value: patient.vitals.pain || "—", unit: "", width: "w-20", accent: true },
  ];

  return (
    <div className="flex flex-col min-h-0">
      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-8 py-5 space-y-4">
        {/* Patient Header Banner */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#E3F2EE] text-[#00594C] font-semibold text-base flex items-center justify-center shrink-0">
                {getInitials(patient.name)}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-slate-800">{patient.name}</h3>
                  <span className="text-xs text-slate-500 font-normal">
                    {patient.age} years · {patient.gender}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-md">
                    Token {patient.token}
                  </span>
                  {patient.abhaConnected && patient.abhaLabel && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium text-[#00594C] bg-[#E8F6F2] border border-[#C6ECE1] rounded-md">
                      <svg className="w-3 h-3 text-[#00594C]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      ABHA Connected · {patient.abhaLabel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {patient.department || "General Medicine"} · {patient.room || "OPD Room 14"} · Waiting {waitMinutes} min
                </p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Ready
              </span>
              <p className="text-[11px] text-slate-400">
                Registered {new Date(patient.registeredAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
              </p>
            </div>
          </div>
        </section>

        {/* Safety Status Alert */}
        <section className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-lg px-4 py-2.5 flex items-center gap-2.5 text-xs text-emerald-700 font-medium">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>No Red Flags Identified · Safety Status Normal</span>
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-12 gap-5 items-start">
          {/* Left Main Content (8 Cols) */}
          <div className="col-span-8 space-y-4">
            {/* Chief Complaint */}
            <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">CHIEF COMPLAINT</h4>
              <div className="text-base font-bold text-slate-800">
                {patient.chiefComplaint}
              </div>
              {patient.onset && patient.duration && (
                <div className="flex items-center gap-6 text-xs text-slate-600 pt-0.5 flex-wrap">
                  <div>
                    <span className="font-medium text-slate-900">Onset:</span> {patient.onset}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">Duration:</span> {patient.duration}
                  </div>
                  {patient.severity && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-slate-900">Severity:</span>
                      <span className="font-bold text-amber-700">{patient.severity}</span>
                    </div>
                  )}
                </div>
              )}
            </article>

            {/* Symptoms & Negatives */}
            <div className="grid grid-cols-2 gap-4">
              {/* Associated Symptoms */}
              <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3">
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ASSOCIATED SYMPTOMS</h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {(patient.associatedSymptoms && patient.associatedSymptoms.length > 0) ? (
                    patient.associatedSymptoms.map((symptom, idx) => (
                      <li key={idx} className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                        <span>{symptom}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">None reported</li>
                  )}
                </ul>
              </article>

              {/* Relevant Negatives */}
              <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3">
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">RELEVANT NEGATIVES</h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {(patient.relevantNegatives && patient.relevantNegatives.length > 0) ? (
                    patient.relevantNegatives.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">None reported</li>
                  )}
                </ul>
              </article>
            </div>

             {/* Current Vitals */}
             <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3">
               <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">CURRENT VITALS</h4>
               <div className="flex items-center gap-3">
                 {vitals.map((vital) => (
                   <div
                     key={vital.label}
                     className={`border rounded-lg p-2.5 ${vital.accent ? "border-amber-200 bg-amber-50/50" : "border-slate-200"} ${vital.width}`}
                   >
                     <p className={`text-[10px] font-semibold tracking-wide ${vital.accent ? "text-amber-700" : "text-slate-400"}`}>
                       {vital.label}
                     </p>
                     <p className={`text-sm font-bold mt-1 ${vital.accent ? "text-amber-800" : "text-slate-800"}`}>
                       {vital.value} {vital.unit && <span className="text-[10px] font-normal text-slate-400">{vital.unit}</span>}
                     </p>
                   </div>
                 ))}
               </div>
             </article>

            {/* Past History Highlights */}
            {patient.pastHistory && (
              <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3">
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">PAST HISTORY HIGHLIGHTS</h4>
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-700">
                  {patient.pastHistory.medicalHistory && (
                    <div>
                      <span className="font-medium text-slate-900">Medical History:</span> {patient.pastHistory.medicalHistory}
                    </div>
                  )}
                  {patient.pastHistory.surgicalHistory && (
                    <div>
                      <span className="font-medium text-slate-900">Surgical History:</span> {patient.pastHistory.surgicalHistory}
                    </div>
                  )}
                  {patient.pastHistory.medications && (
                    <div>
                      <span className="font-medium text-slate-900">Medications:</span> {patient.pastHistory.medications}
                    </div>
                  )}
                  {patient.pastHistory.familyHistory && (
                    <div>
                      <span className="font-medium text-slate-900">Family History:</span> {patient.pastHistory.familyHistory}
                    </div>
                  )}
                </div>
              </article>
            )}
          </div>

          {/* Right Rail (4 Cols) */}
          <aside className="col-span-4 space-y-4">
            {/* Patient History Context */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h4 className="text-xs font-bold text-slate-800 mb-3">Patient History Context</h4>
              <div className="divide-y divide-slate-100 text-xs">
                {patient.pastHistory ? (
                  <>
                    {patient.pastHistory.medicalHistory && (
                      <div className="py-1.5 flex justify-between">
                        <span className="text-slate-400 font-normal">Medical History</span>
                        <span className="text-slate-700 font-medium text-right">{patient.pastHistory.medicalHistory}</span>
                      </div>
                    )}
                    {patient.pastHistory.surgicalHistory && (
                      <div className="py-1.5 flex justify-between">
                        <span className="text-slate-400 font-normal">Surgical History</span>
                        <span className="text-slate-700 font-medium text-right">{patient.pastHistory.surgicalHistory}</span>
                      </div>
                    )}
                    {patient.pastHistory.medications && (
                      <div className="py-1.5 flex justify-between">
                        <span className="text-slate-400 font-normal">Medications</span>
                        <span className="text-slate-700 font-medium text-right">{patient.pastHistory.medications}</span>
                      </div>
                    )}
                    {patient.pastHistory.allergies && (
                      <div className="py-1.5 flex justify-between">
                        <span className="text-slate-400 font-normal">Allergies</span>
                        <span className="text-slate-700 font-medium text-right">{patient.pastHistory.allergies}</span>
                      </div>
                    )}
                    {patient.pastHistory.familyHistory && (
                      <div className="py-1.5 flex justify-between">
                        <span className="text-slate-400 font-normal">Family History</span>
                        <span className="text-slate-700 font-medium text-right">{patient.pastHistory.familyHistory}</span>
                      </div>
                    )}
                    {patient.pastHistory.personalHistory && (
                      <div className="py-1.5 flex justify-between">
                        <span className="text-slate-400 font-normal">Personal History</span>
                        <span className="text-slate-700 font-medium text-right">{patient.pastHistory.personalHistory}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-2 text-slate-400 text-xs">No history available</div>
                )}
              </div>
            </section>

            {/* Allergy Warning */}
            {patient.allergyWarning && (
              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-700 font-bold uppercase tracking-wider text-[11px]">
                  <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>ALLERGY</span>
                </div>
                <p className="font-bold text-slate-800 text-xs">{patient.allergyWarning.allergen}</p>
                <p className="text-slate-600 text-[11px]">Reaction: {patient.allergyWarning.reaction}</p>
              </div>
            )}

            {/* Action CTA Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleStartConsultation}
                className="w-full bg-[#00594C] hover:bg-[#00473D] text-white py-2.5 px-4 rounded-lg font-semibold text-xs transition duration-150 shadow-sm flex items-center justify-center"
              >
                Start Consultation
              </button>
              <button
                onClick={() => router.push("/queue")}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 py-2 px-4 rounded-lg font-medium text-xs transition duration-150"
              >
                Go back to queue
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
