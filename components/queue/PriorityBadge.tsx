"use client";

import { QueuePatient } from "@/lib/services/dashboard.service";

export function PriorityBadge({ patient }: { patient: QueuePatient }) {
  if (patient.priority !== "priority") return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-status-redflag-bg px-2 py-0.5 text-[11px] font-semibold text-status-redflag border border-status-redflag-border">
      <span className="h-1.5 w-1.5 rounded-full bg-status-redflag animate-pulse" />
      Priority
    </span>
  );
}
