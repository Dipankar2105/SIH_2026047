"use client";

import { useRouter } from "next/navigation";
import { QueuePatient } from "@/lib/services/dashboard.service";
import { useClinicalWorkflowStore } from "@/stores/clinical-workflow.store";
import { IntakeBadge } from "./IntakeBadge";
import { PriorityBadge } from "./PriorityBadge";

function formatWaitTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function QueueRow({ patient }: { patient: QueuePatient }) {
  const router = useRouter();
  const setActiveEncounter = useClinicalWorkflowStore(
    (s) => s.setActiveEncounter
  );

  const handleOpen = () => {
    setActiveEncounter({
      patientId: patient.id,
      token: patient.token,
      priority: patient.priority,
      startedAt: new Date().toISOString(),
    });

    if (patient.priority === "priority") {
      router.push(`/queue/${patient.token}/priority-review`);
    } else {
      router.push(`/queue/${patient.token}/pre-brief`);
    }
  };

  const actionLabel = patient.priority === "priority" ? "Review" : "Open";

  return (
    <div className="flex items-center justify-between rounded-[var(--radius-clinical-md)] border border-clinical-border bg-clinical-surface px-4 py-3 hover:border-brand-700/30 hover:shadow-[var(--shadow-clinical-sm)] transition-colors">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
          {patient.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-clinical-text truncate">
              {patient.name}
            </p>
            <PriorityBadge patient={patient} />
            <IntakeBadge status={patient.intakeStatus} />
          </div>
          <p className="text-[11px] text-clinical-muted truncate mt-0.5">
            Token {patient.token} · {patient.age} yrs · {patient.gender} · {patient.chiefComplaint}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <div className="text-right">
          <p className="text-xs text-clinical-muted">Waiting</p>
          <p className="text-sm font-semibold text-clinical-text">{formatWaitTime(patient.registeredAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-clinical-muted">Status</p>
          <p className="text-sm font-semibold text-clinical-text capitalize">{patient.status.replace("-", " ")}</p>
        </div>
        <button
          onClick={handleOpen}
          className="rounded-[var(--radius-pill)] bg-brand-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-800 active:bg-brand-900 transition-colors shadow-[var(--shadow-clinical-sm)]"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
