"use client";

import { useEffect, useState, useMemo } from "react";
import { dashboardService, QueuePatient } from "@/lib/services/dashboard.service";
import { QueueTable } from "@/components/queue/QueueTable";

type FilterType = "all" | "waiting" | "ready" | "priority" | "completed";

export default function QueuePage() {
  const [patients, setPatients] = useState<QueuePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortByWait, setSortByWait] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await dashboardService.getQueuePatients();
        if (cancelled) return;
        setPatients(data);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load queue");
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const waiting = patients.filter((p) => p.status === "waiting");
    const ready = patients.filter((p) => p.status === "ready");
    const inConsultation = patients.filter((p) => p.status === "in-consultation");
    const completed = patients.filter((p) => p.status === "completed");
    const priority = patients.filter(
      (p) => p.priority === "priority" || p.redFlagDetected
    );

    return {
      total: patients.length,
      waiting: waiting.length,
      inConsultation: inConsultation.length,
      completed: completed.length,
      priority: priority.length,
      ready: ready.length,
    };
  }, [patients]);

  const filteredPatients = useMemo(() => {
    let result = patients;

    if (filter === "priority") {
      result = result.filter(
        (p) => p.priority === "priority" || p.redFlagDetected
      );
    } else if (filter !== "all") {
      result = result.filter((p) => p.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.token.toLowerCase().includes(q) ||
          p.abhaId.toLowerCase().includes(q) ||
          p.chiefComplaint.toLowerCase().includes(q)
      );
    }

    return result;
  }, [patients, filter, search]);

  const onToggleSort = () => setSortByWait((s) => !s);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-400">Loading queue...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-5 w-full mx-auto p-7">
      {/* Title Area */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">
            Patient Queue
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            OPD worklist — {patients.length} patients registered today
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-slate-400">Today</p>
          <p className="text-sm font-semibold text-slate-700">
            {today}
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard label="TOTAL REGISTERED" value={String(metrics.total)} />
        <MetricCard label="WAITING" value={String(metrics.waiting)} accent="text-slate-800" />
        <MetricCard label="IN CONSULTATION" value={String(metrics.inConsultation)} accent="text-slate-800" />
        <MetricCard label="COMPLETED" value={String(metrics.completed)} accent="text-slate-800" />
        <MetricCard label="PRIORITY" value={String(metrics.priority)} accent="text-[#B42318]" isPriority />
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="m21 21-4.34-4.34" />
                <circle cx="11" cy="11" r="8" />
              </svg>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00594C]"
              placeholder="Search patient name, token, ABHA ID..."
            />
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "waiting", "ready", "priority", "completed"] as FilterType[]).map((f) => {
              const count =
                f === "all"
                  ? metrics.total
                  : f === "waiting"
                    ? metrics.waiting
                    : f === "ready"
                      ? metrics.ready
                      : f === "priority"
                        ? metrics.priority
                        : metrics.completed;

              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filter === f
                      ? "bg-[#00594C] text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} ({count})
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={onToggleSort}
          className={`flex items-center gap-1 text-xs font-medium transition-colors ${
            sortByWait ? "text-[#00594C]" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Sort by wait time</span>
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="m5 12 7-7 7 7" />
            <path d="M12 19V5" />
          </svg>
        </button>
      </div>

      {/* Queue Table */}
      <QueueTable
        patients={filteredPatients}
        sortByWait={sortByWait}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  accent,
  isPriority,
}: {
  label: string;
  value: string;
  accent?: string;
  isPriority?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 border shadow-sm flex flex-col justify-between ${
        isPriority
          ? "bg-[#FFF4F2] border-[#FECDCA]"
          : "bg-white border-slate-200"
      }`}
    >
      <span
        className={`text-[11px] font-bold tracking-wider uppercase ${
          isPriority ? "text-[#B42318]" : "text-slate-400"
        }`}
      >
        {label}
      </span>
      <div
        className={`text-2xl font-bold mt-2 ${isPriority ? "text-[#B42318]" : accent ?? "text-slate-800"}`}
      >
        {value}
      </div>
    </div>
  );
}