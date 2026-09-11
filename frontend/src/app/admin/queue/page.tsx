"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  RefreshCw,
  Search,
  Timer,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { loadLiveQueue, updateQueueStatus } from "@/lib/api/admin";
import { getAdminSession } from "@/types/admin";
import { cn } from "@/lib/utils";
import type { AdminQueueItem, QueuePriority, QueueStatus } from "@/types/admin";

function priorityBadge(priority: QueuePriority) {
  const styles = {
    "RED FLAG": "bg-[#FDECEC] text-[#C94C4C] border-[#F3C5C5]",
    URGENT: "bg-[#FFF4E5] text-[#B66A00] border-[#F5D9AE]",
    ROUTINE: "bg-[#F1F4F7] text-[#69758A] border-[#DCE2E9]",
  };
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold tracking-wide", styles[priority])}><span className={cn("h-1.5 w-1.5 rounded-full", priority === "RED FLAG" ? "bg-[#E5484D] animate-pulse" : priority === "URGENT" ? "bg-[#E89B19]" : "bg-[#9AA6B5]")} />{priority}</span>;
}

function statusBadge(status: QueueStatus) {
  const styles = {
    waiting: "bg-[#FFF4E5] text-[#B66A00] border-[#F5D9AE]",
    in_consultation: "bg-[#E8F7EF] text-[#087E6A] border-[#BCE7D5]",
    completed: "bg-[#F1F4F7] text-[#69758A] border-[#DCE2E9]",
    cancelled: "bg-[#FDECEC] text-[#C94C4C] border-[#F3C5C5]",
  };
  const labels: Record<QueueStatus, string> = {
    waiting: "Waiting",
    in_consultation: "In consultation",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold", styles[status])}><span className={cn("h-1.5 w-1.5 rounded-full", status === "in_consultation" ? "bg-[#12A87E]" : status === "waiting" ? "bg-[#E89B19]" : "bg-[#9AA6B5]")} />{labels[status]}</span>;
}

function QueueStat({ label, value, detail, tone }: { label: string; value: number | string; detail: string; tone: "green" | "orange" | "red" | "gray" }) {
  const tones = {
    green: "bg-[#E8F7EF] text-[#087E6A]",
    orange: "bg-[#FFF4E5] text-[#B66A00]",
    red: "bg-[#FDECEC] text-[#C94C4C]",
    gray: "bg-[#F1F4F7] text-[#69758A]",
  };
  return (
    <Card className="!rounded-2xl !p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8490A2]">{label}</p>
          <p className="mt-1.5 text-[25px] font-extrabold leading-none text-[#172033]">{value}</p>
          <p className="mt-1.5 text-[10px] font-medium text-[#8490A2]">{detail}</p>
        </div>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tones[tone])}>
          {tone === "red" ? <BellRing className="h-4 w-4" /> : tone === "orange" ? <Clock3 className="h-4 w-4" /> : tone === "green" ? <CheckCircle2 className="h-4 w-4" /> : <Users className="h-4 w-4" />}
        </div>
      </div>
    </Card>
  );
}

export default function AdminQueuePage() {
  const session = getAdminSession();
  const [queue, setQueue] = useState<AdminQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await loadLiveQueue(session?.hospital_id);
      setQueue(data);
      setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const sortedQueue = useMemo(() => {
    const priorityRank: Record<QueuePriority, number> = { "RED FLAG": 0, URGENT: 1, ROUTINE: 2 };
    return [...queue].sort((a, b) => {
      const priorityDifference = priorityRank[a.priority] - priorityRank[b.priority];
      if (priorityDifference !== 0) return priorityDifference;
      const tokenA = Number(a.token.replace(/\D/g, "")) || 0;
      const tokenB = Number(b.token.replace(/\D/g, "")) || 0;
      return tokenA - tokenB;
    });
  }, [queue]);

  const filteredQueue = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sortedQueue.filter((item) => {
      const matchesSearch = !query || `${item.token} ${item.patientName} ${item.department} ${item.doctorName}`.toLowerCase().includes(query);
      const matchesStatus = status === "ALL" || item.status === status;
      const matchesPriority = priority === "ALL" || item.priority === priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [sortedQueue, search, status, priority]);

  const counts = useMemo(
    () => ({
      waiting: queue.filter((item) => item.status === "waiting").length,
      consultation: queue.filter((item) => item.status === "in_consultation").length,
      redFlags: queue.filter((item) => item.priority === "RED FLAG").length,
      completed: queue.filter((item) => item.status === "completed").length,
    }),
    [queue]
  );

  const handleStatusChange = async (item: AdminQueueItem, nextStatus: QueueStatus) => {
    setActionLoading(item.appointmentId);
    try {
      const success = await updateQueueStatus(item.appointmentId, nextStatus);
      setQueue((current) => current.map((queueItem) => queueItem.appointmentId === item.appointmentId ? { ...queueItem, status: nextStatus, waitMinutes: nextStatus === "waiting" ? queueItem.waitMinutes : 0 } : queueItem));
      setToast(success ? `Queue updated: ${nextStatus === "in_consultation" ? "consultation started" : nextStatus}` : "Queue updated locally; backend is unavailable");
    } catch {
      setQueue((current) => current.map((queueItem) => queueItem.appointmentId === item.appointmentId ? { ...queueItem, status: nextStatus } : queueItem));
      setToast("Queue updated locally; backend is unavailable");
    } finally {
      setActionLoading(null);
      window.setTimeout(() => setToast(""), 3200);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#087E6A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#12A87E] animate-pulse" />
            LIVE QUEUE
          </div>
          <h2 className="mt-1.5 text-[24px] font-extrabold tracking-tight text-[#172033] sm:text-[28px]">OPD queue control</h2>
          <p className="mt-1 text-[13px] font-medium text-[#69758A]">Prioritize red flags, manage patient flow, and keep every department moving.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-xl border border-[#E5EAF0] bg-white px-3 py-2 text-[10px] font-semibold text-[#8490A2] sm:inline-flex">Updated {lastUpdated || "--:--"}</span>
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading} className="gap-2">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QueueStat label="Waiting" value={counts.waiting} detail="Patients in queue" tone="orange" />
        <QueueStat label="In consultation" value={counts.consultation} detail="Active consultations" tone="green" />
        <QueueStat label="Red flags" value={counts.redFlags} detail="Priority review" tone="red" />
        <QueueStat label="Completed today" value={counts.completed} detail="Queue throughput" tone="gray" />
      </div>

      {toast && (
        <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-xl border border-[#BCE7D5] bg-white px-4 py-3 text-[11px] font-semibold text-[#087E6A] shadow-lg lg:bottom-6">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      <Card className="!rounded-2xl">
        <CardHeader className="!pb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-[15px]">Live patient queue</CardTitle>
              <p className="mt-0.5 text-[10px] font-medium text-[#8490A2]">Sorted by clinical priority, then token number</p>
            </div>
            <div className="flex flex-col gap-2 lg:flex-row">
              <div className="relative w-full lg:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0AAB8]" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search token, patient, doctor..." className="h-10 pl-9 text-[12px]" />
              </div>
              <Select value={status} onChange={(event) => setStatus(event.target.value)} options={[{ value: "ALL", label: "All statuses" }, { value: "waiting", label: "Waiting" }, { value: "in_consultation", label: "In consultation" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }]} className="h-10 w-full lg:w-40 text-[12px]" />
              <Select value={priority} onChange={(event) => setPriority(event.target.value)} options={[{ value: "ALL", label: "All priorities" }, { value: "RED FLAG", label: "Red flags" }, { value: "URGENT", label: "Urgent" }, { value: "ROUTINE", label: "Routine" }]} className="h-10 w-full lg:w-36 text-[12px]" />
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Token / patient</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Wait</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="w-[190px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && queue.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="h-40 text-center text-[12px] text-[#8490A2]">Loading live queue...</TableCell></TableRow>
              ) : filteredQueue.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="h-40 text-center text-[12px] text-[#8490A2]">No queue items match the selected filters.</TableCell></TableRow>
              ) : (
                filteredQueue.map((item, index) => (
                  <TableRow key={item.appointmentId} className={item.redFlag ? "bg-[#FFF9F9] hover:bg-[#FFF4F4]" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F4F7] text-[10px] font-extrabold text-[#4B586C]">{String(index + 1).padStart(2, "0")}</span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-extrabold text-[#172033]">{item.token}</p>
                          <p className="mt-0.5 truncate text-[10px] font-medium text-[#8490A2]">{item.patientName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[11px] font-semibold text-[#4B586C]">{item.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar name={item.doctorName.replace("Dr. ", "")} size="sm" />
                        <span className="text-[11px] font-semibold text-[#4B586C]">{item.doctorName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{priorityBadge(item.priority)}</TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center gap-1 text-[11px] font-extrabold", item.status === "waiting" ? "text-[#B66A00]" : "text-[#69758A]")}>
                        <Timer className="h-3.5 w-3.5" />
                        {item.status === "waiting" ? `${item.waitMinutes} min` : item.status === "in_consultation" ? "Now" : "—"}
                      </span>
                    </TableCell>
                    <TableCell><span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#4B586C]"><MapPin className="h-3.5 w-3.5 text-[#087E6A]" />{item.room}</span></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {item.status === "waiting" && <Button size="sm" variant="primary" onClick={() => void handleStatusChange(item, "in_consultation")} isLoading={actionLoading === item.appointmentId} className="h-8 px-2.5 text-[10px]">Start</Button>}
                        {item.status === "in_consultation" && <Button size="sm" variant="secondary" onClick={() => void handleStatusChange(item, "completed")} isLoading={actionLoading === item.appointmentId} className="h-8 px-2.5 text-[10px]">Complete</Button>}
                        {item.status === "completed" && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#087E6A]"><CheckCircle2 className="h-3.5 w-3.5" />Done</span>}
                        {item.status === "cancelled" && <span className="text-[10px] font-semibold text-[#C94C4C]">Closed</span>}
                        <button type="button" className="rounded-lg p-1.5 text-[#A0AAB8] hover:bg-[#F3F6F8] hover:text-[#087E6A]" aria-label={`View ${item.token}`}>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="!rounded-2xl lg:col-span-2">
          <CardHeader className="!pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[14px]">Queue flow</CardTitle>
              <Badge variant="default">Auto-refresh 15s</Badge>
            </div>
          </CardHeader>
          <CardContent className="!pt-2">
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#69758A]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8F7EF] text-[#087E6A]"><Users className="h-3.5 w-3.5" /></span>
              <span><span className="font-extrabold text-[#172033]">{queue.length}</span> patients are currently tracked across OPD, emergency, and diagnostics.</span>
              <ArrowUpRight className="ml-auto h-4 w-4 text-[#A0AAB8]" />
            </div>
          </CardContent>
        </Card>
        <Card className="!rounded-2xl">
          <CardHeader className="!pb-3">
            <CardTitle className="text-[14px]">Queue health</CardTitle>
          </CardHeader>
          <CardContent className="!pt-2 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#69758A]"><span>Emergency bay</span><span className="text-[#C94C4C]">2 active</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#F1F4F7]"><div className="h-full w-2/3 rounded-full bg-[#E5484D]" /></div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#69758A]"><span>General OPD</span><span className="text-[#087E6A]">Stable</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#F1F4F7]"><div className="h-full w-1/3 rounded-full bg-[#12A87E]" /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
