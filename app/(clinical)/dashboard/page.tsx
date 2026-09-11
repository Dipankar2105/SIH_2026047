"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  dashboardService,
  QueuePatient,
} from "@/lib/services/dashboard.service";
import { useClinicalWorkflowStore } from "@/stores/clinical-workflow.store";

function formatWaitMinutes(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  return Math.max(1, minutes);
}

function formatTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function NextPatientCard({ patient }: { patient: QueuePatient }) {
  const router = useRouter();
  const setActiveEncounter = useClinicalWorkflowStore(
    (s) => s.setActiveEncounter
  );

  const handleAction = (action: "consultation" | "emergency" | "call" | "brief") => {
    setActiveEncounter({
      patientId: patient.id,
      token: patient.token,
      priority: patient.priority,
      startedAt: new Date().toISOString(),
    });

    if (action === "emergency") {
      router.push(`/queue/${patient.token}/priority-review`);
    } else if (action === "call") {
      router.push(`/queue/${patient.token}/pre-brief`);
    } else if (action === "brief") {
      router.push(`/queue/${patient.token}/pre-brief`);
    } else {
      router.push(`/queue/${patient.token}/pre-brief`);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-slate-900 uppercase">Next Patient</span>
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ready
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">AI Intake Complete</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#E6F4F1] text-[#00594C]">
            ✓ READY
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#E6F4F1] text-[#00594C] font-bold text-sm flex items-center justify-center shrink-0">
            {patient.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="text-lg font-bold text-slate-900 leading-none">{patient.name}</h4>
              <span className="text-xs text-slate-500 font-medium">{patient.age} years · {patient.gender}</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">Token #{patient.token}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#E6F4F1] text-[#00594C] border border-emerald-200">
                ✓ ABHA Connected
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {patient.abhaId} · Waiting {formatWaitMinutes(patient.registeredAt)} min · Modern Medicine
            </p>
          </div>
        </div>

        <div className="bg-[#F8FAFC] border border-slate-100 rounded-lg p-3.5">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">Chief Complaint</span>
          <p className="text-sm font-semibold text-slate-900 mt-1">{patient.chiefComplaint}</p>
          <p className="text-xs text-slate-600 mt-1">{patient.symptoms}</p>
        </div>

        <div>
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-2">Vitals</span>
          <div className="grid grid-cols-5 gap-2.5">
            {patient.vitals.bp && (
              <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block">BP</span>
                <div className="text-xs font-bold text-slate-800 mt-0.5">{patient.vitals.bp} <span className="text-[10px] font-normal text-slate-400">mmHg</span></div>
              </div>
            )}
            {patient.vitals.pulse && (
              <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block">HR</span>
                <div className="text-xs font-bold text-slate-800 mt-0.5">{patient.vitals.pulse} <span className="text-[10px] font-normal text-slate-400">bpm</span></div>
              </div>
            )}
            {patient.vitals.spo2 && (
              <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block">SpO₂</span>
                <div className="text-xs font-bold text-slate-800 mt-0.5">{patient.vitals.spo2}</div>
              </div>
            )}
            {patient.vitals.temperature && (
              <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block">TEMP</span>
                <div className="text-xs font-bold text-slate-800 mt-0.5">{patient.vitals.temperature}°F</div>
              </div>
            )}
            {patient.vitals.pain && (
              <div className="bg-[#FFF8E6] rounded-lg p-2 border border-amber-200">
                <span className="text-[10px] text-amber-700 font-semibold block">PAIN</span>
                <div className="text-xs font-bold text-amber-900 mt-0.5">{patient.vitals.pain}</div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={() => handleAction("consultation")}
            className="px-4 py-2 bg-[#00594C] hover:bg-[#00473D] text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <span>Start Consultation</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => handleAction("call")}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Call Next Patient</span>
          </button>
          <button
            onClick={() => handleAction("brief")}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            View Brief
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#E6F4F1] text-[#00594C] border border-emerald-200">
            ✓ ABDM Connected
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#E6F4F1] text-[#00594C] border border-emerald-200">
            ✓ EMR Synced
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#E6F4F1] text-[#00594C] border border-emerald-200">
            ✓ Consent Valid
          </span>
        </div>
      </div>
    </div>
  );
}

function QueueRow({ patient }: { patient: QueuePatient }) {
  const isPriority = patient.priority === "priority" || patient.redFlagDetected;
  const isCompleted = patient.status === "completed";

  let rowClass = "py-3 flex items-center justify-between";
  if (isPriority) {
    rowClass += " border-l-4 border-l-[#F04438] pl-2 -ml-2 bg-[#FFF4F2]";
  } else if (isCompleted) {
    rowClass += " opacity-80";
  }

  const tokenBg = isPriority
    ? "bg-rose-100 text-[#B42318]"
    : "bg-slate-100 text-slate-600";

  const nameColor = isPriority
    ? "text-slate-900 font-bold text-sm"
    : isCompleted
    ? "text-slate-600 font-medium text-sm"
    : "text-slate-900 font-bold text-sm";

  const complaintColor = isPriority
    ? "text-[#B42318] font-medium"
    : isCompleted
    ? "text-slate-500"
    : "text-slate-700 font-medium";

  const waitText = isCompleted ? "Completed" : formatTime(patient.registeredAt);
  const waitColor = isCompleted ? "text-slate-400" : "text-slate-400";

  const statusBadge = isPriority
    ? (
      <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 justify-end mt-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Priority
      </span>
    ) : isCompleted
    ? (
      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 justify-end mt-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Completed
      </span>
    ) : (
      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 justify-end mt-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ready
      </span>
    );

  return (
    <div key={patient.id} className={rowClass}>
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${tokenBg}`}>
          {patient.token.replace(/^#/, "")}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h5 className={`${nameColor} leading-tight`}>{patient.name}</h5>
            {isPriority && (
              <svg
                className="w-3.5 h-3.5 inline text-amber-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <p className={`text-[11px] mt-0.5 ${complaintColor}`}>
            {patient.age} {patient.gender} · {patient.chiefComplaint}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className={`text-[11px] font-medium block ${waitColor}`}>{waitText}</span>
        {statusBadge}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const setActiveEncounter = useClinicalWorkflowStore(
    (s) => s.setActiveEncounter
  );
  const [metrics, setMetrics] = useState<{
    totalToday: number;
    waiting: number;
    inConsultation: number;
    completed: number;
    averageWaitMinutes: number;
  } | null>(null);
  const [priorityAlert, setPriorityAlert] = useState<QueuePatient | null>(null);
  const [nextPatient, setNextPatient] = useState<QueuePatient | null>(null);
  const [recentPatients, setRecentPatients] = useState<QueuePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    let cancelled = false;

    dashboardService
      .getDashboardData()
      .then((data) => {
        if (cancelled) return;
        setMetrics(data.metrics);
        setPriorityAlert(data.priorityAlert);
        setNextPatient(data.nextPatient);
        setRecentPatients(data.recentPatients);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-clinical-muted">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-status-redflag">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Greeting / Date */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
          {greeting}, Dr. Sharma
        </h3>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          OPD 14 · City Hospital ·{" "}
          {new Date().toLocaleDateString("en-IN", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Priority Alert */}
      {priorityAlert && (
        <div className="bg-[#FFF4F2] border border-[#FECDCA] rounded-xl p-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-[#B42318] tracking-tight uppercase">
                Priority Alert · Token #{priorityAlert.token} — {priorityAlert.name} ({priorityAlert.age} {priorityAlert.gender})
              </div>
              <p className="text-xs text-[#7A271A] mt-0.5">
                {priorityAlert.chiefComplaint} · Flagged during intake · Safety review required
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveEncounter({
                  patientId: priorityAlert.id,
                  token: priorityAlert.token,
                  priority: priorityAlert.priority,
                  startedAt: new Date().toISOString(),
                });
                router.push(`/queue/${priorityAlert.token}/priority-review`);
              }}
              className="px-3.5 py-1.5 border border-[#FDA29B] bg-white text-[#B42318] text-xs font-semibold rounded-lg hover:bg-rose-50 transition-colors shadow-sm"
            >
              Emergency Review
            </button>
            <button
              onClick={() => {
                setActiveEncounter({
                  patientId: priorityAlert.id,
                  token: priorityAlert.token,
                  priority: priorityAlert.priority,
                  startedAt: new Date().toISOString(),
                });
                router.push(`/queue/${priorityAlert.token}/pre-brief`);
              }}
              className="px-3.5 py-1.5 bg-[#00594C] text-white text-xs font-semibold rounded-lg hover:bg-[#00473D] transition-colors shadow-sm"
            >
              Start Consultation
            </button>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Today&apos;s Appointments</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 leading-none">{metrics?.totalToday ?? 0}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">{metrics?.completed ?? 0} completed</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Waiting</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#00594C] leading-none">{metrics?.waiting ?? 0}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Next: Token #{nextPatient?.token ?? "—"}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">In Consultation</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 leading-none">{metrics?.inConsultation ?? 0}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">OPD 14</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Avg Wait Time</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 leading-none">{metrics?.averageWaitMinutes ?? 0} min</span>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <span>↓</span> from 31 min
          </p>
        </div>
      </div>

      {/* Two-column lower section: Next Patient ≈ 2/3, Queue ≈ 1/3 */}
      <div className="grid grid-cols-12 gap-5 items-start">
        {/* Next Patient */}
        <div className="col-span-12 lg:col-span-8 min-h-0">
          {nextPatient ? (
            <NextPatientCard patient={nextPatient} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-400">No patients waiting</p>
            </div>
          )}
        </div>

        {/* Today's Queue */}
        <div className="col-span-12 lg:col-span-4 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 leading-none">
              Today&apos;s Queue
            </h4>
            <button
              onClick={() => router.push("/queue")}
              className="text-xs font-semibold text-[#00594C] hover:underline transition-colors"
            >
              View All
            </button>
          </div>
          <div className="mt-3 flex-1 divide-y divide-slate-100">
            {recentPatients.length === 0 && (
              <p className="text-sm text-slate-400">No queue activity yet</p>
            )}
            {recentPatients.map((patient) => (
              <QueueRow key={patient.id} patient={patient} />
            ))}
          </div>
          <div className="pt-4">
            <button
              onClick={() => router.push("/queue")}
              className="w-full py-2 px-3 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
            >
              <span>Open Full Queue</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}