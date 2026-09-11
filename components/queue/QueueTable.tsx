"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { QueuePatient } from "@/lib/services/dashboard.service";

function formatWaitTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

const INTAKE_LABELS: Record<string, string> = {
  linked: "Complete",
  pending: "In Progress",
  "not-linked": "Pending",
};

const INTAKE_STYLES: Record<string, string> = {
  linked: "bg-[#ECFDF3] text-[#027A48]",
  pending: "bg-[#FEF0C7] text-[#B54708]",
  "not-linked": "bg-slate-100 text-slate-500",
};

interface QueueTableProps {
  patients: QueuePatient[];
  sortByWait: boolean;
}

export function QueueTable({ patients, sortByWait }: QueueTableProps) {
  const router = useRouter();
  const [callingToken, setCallingToken] = useState<string | null>(null);

  const sorted = sortByWait
    ? [...patients].sort((a, b) => {
        const wa = new Date(a.registeredAt).getTime();
        const wb = new Date(b.registeredAt).getTime();
        return wa - wb;
      })
    : patients;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-[#DCFCE7] text-[#15803D]",
      "bg-[#E0E7FF] text-[#4338CA]",
      "bg-[#F3E8FF] text-[#7E22CE]",
      "bg-[#FEE4E2] text-[#B42318]",
      "bg-[#E0F2FE] text-[#0284C7]",
      "bg-[#FEF9EE] text-[#B54708]",
      "bg-[#F1F5F9] text-slate-600",
      "bg-[#FDF2F8] text-[#BE185D]",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const isPriorityPatient = (patient: QueuePatient) =>
    patient.priority === "priority" || patient.redFlagDetected;

  const handleOpen = (patient: QueuePatient) => {
    if (patient.status === "completed") return;
    const token = patient.token.replace(/^#/, "");
    if (isPriorityPatient(patient)) {
      router.push(`/queue/${token}/priority-review`);
    } else {
      router.push(`/queue/${token}/pre-brief`);
    }
  };

  const handleCall = (patient: QueuePatient) => {
    if (patient.status === "completed") return;
    if (callingToken === patient.token) return;
    setCallingToken(patient.token);
    setTimeout(() => setCallingToken((current) => (current === patient.token ? null : current)), 2000);
  };

  if (sorted.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white">
        <p className="text-sm text-slate-400">No patients match the current filter</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-5 w-16" scope="col">TOKEN</th>
              <th className="py-3 px-4" scope="col">PATIENT</th>
              <th className="py-3 px-4" scope="col">AGE/SEX</th>
              <th className="py-3 px-4" scope="col">CHIEF COMPLAINT</th>
              <th className="py-3 px-4" scope="col">WAIT</th>
              <th className="py-3 px-4" scope="col">AI INTAKE</th>
              <th className="py-3 px-4" scope="col">VITALS</th>
              <th className="py-3 px-5 text-left" scope="col">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {sorted.map((patient) => {
              const priority = isPriorityPatient(patient);
              const isCompleted = patient.status === "completed";

              let rowClass = "hover:bg-slate-50/80 transition-colors";
              if (priority) {
                rowClass = "bg-[#FFF8F7] border-y-2 border-[#D92D20]/80";
              } else if (isCompleted) {
                rowClass = "opacity-80 hover:bg-slate-50/80 transition-colors";
              }

              const tokenColor = priority
                ? "text-[#B42318] font-bold"
                : isCompleted
                  ? "text-slate-400 font-medium"
                  : "text-slate-500 font-medium";

              const nameColor = priority
                ? "font-bold text-slate-900 text-sm"
                : isCompleted
                  ? "font-medium text-slate-600 text-sm"
                  : "font-bold text-slate-900 text-sm";

              const complaintColor = priority
                ? "font-bold text-slate-900"
                : isCompleted
                  ? "text-slate-500 font-medium"
                  : "font-medium text-slate-700";

              const isCalling = callingToken === patient.token;

              return (
                <tr key={patient.id} className={rowClass}>
                  <td className={`py-3.5 px-5 ${tokenColor}`}>
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      priority ? "bg-[#FEE4E2] text-[#B42318]" : "bg-slate-100 text-slate-600"
                    }`}>
                      {patient.token.replace(/^#/, "")}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getAvatarColor(patient.name)}`}>
                        {getInitials(patient.name)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`${nameColor} truncate`}>
                          {patient.name}
                        </span>
                        {priority && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-[#B42318] mt-0.5 tracking-wide">
                            <svg
                              className="w-3 h-3 text-[#B42318] stroke-[2.5]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                              <path d="M12 9v4" />
                              <path d="M12 17h.01" />
                            </svg>
                            <span>RED FLAG DETECTED</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={`py-3.5 px-4 ${isCompleted ? "text-slate-500" : "text-slate-600"} font-medium`}>
                    {patient.age} {patient.gender}
                  </td>
                  <td className={`py-3.5 px-4 ${complaintColor} max-w-xs truncate`}>
                    {patient.chiefComplaint}
                  </td>
                  <td className={`py-3.5 px-4 ${isCompleted ? "text-slate-400" : "text-slate-600"} font-medium`}>
                    {isCompleted ? "Completed" : formatWaitTime(patient.registeredAt)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${INTAKE_STYLES[patient.intakeStatus]}`}
                    >
                      {INTAKE_LABELS[patient.intakeStatus]}
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 ${isCompleted ? "text-slate-500" : "text-slate-600"} font-medium`}>
                    {Object.entries(patient.vitals)
                      .filter(([, v]) => v)
                      .map(([k, v]) => {
                        const label =
                          k === "bp"
                            ? "BP"
                            : k === "pulse"
                              ? "HR"
                              : k === "temperature"
                                ? "Temp"
                                : k === "spo2"
                                  ? "SpO₂"
                                  : k === "pain"
                                    ? "Pain"
                                    : k.toUpperCase();
                        return `${label} ${v}`;
                      })
                      .join(" · ") || "—"}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F0FDF4] text-[#16A34A] text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                          Completed
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpen(patient)}
                            className={`text-xs font-semibold px-4 py-1 rounded-lg transition-colors whitespace-nowrap ${
                              priority
                                ? "bg-[#B42318] hover:bg-[#9E3A2E] text-white shadow-xs"
                                : "bg-[#00594C] hover:bg-[#00473D] text-white"
                            }`}
                          >
                            {priority ? "Emergency Review" : "Open"}
                          </button>
                          <button
                            onClick={() => handleCall(patient)}
                            disabled={isCalling}
                            className={`border text-xs font-medium px-3.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                              isCalling
                                ? "bg-[#00594C] text-white border-[#00594C]"
                                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            {isCalling ? "Calling..." : "Call"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}