"use client";

import { QueuePatient } from "@/lib/services/dashboard.service";

export function IntakeBadge({ status }: { status: QueuePatient["intakeStatus"] }) {
  const config = {
    linked: {
      label: "ABHA Linked",
      className: "bg-status-ready-bg text-status-ready border-status-ready-border",
    },
    pending: {
      label: "Intake Pending",
      className: "bg-status-amber-bg text-status-amber border-status-amber-border",
    },
    "not-linked": {
      label: "Not Linked",
      className: "bg-clinical-hover text-clinical-muted border-clinical-border",
    },
  }[status];

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
