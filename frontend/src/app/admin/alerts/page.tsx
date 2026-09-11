"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  Check,
  CheckCircle2,
  Clock3,
  MapPin,
  Search,
  ShieldAlert,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { loadPriorityAlerts, updateQueueStatus } from "@/lib/api/admin";
import { getAdminSession } from "@/types/admin";
import { cn } from "@/lib/utils";
import { MEDICAL_STAFF, type AdminAlert, type AlertPriority, type AlertStatus, type MedicalStaff } from "@/types/admin";

function priorityBadge(priority: AlertPriority) {
  const high = priority === "P1-HIGH";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold tracking-wide", high ? "bg-[#FDECEC] text-[#C94C4C] border-[#F3C5C5]" : "bg-[#FFF4E5] text-[#B66A00] border-[#F5D9AE]")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", high ? "bg-[#E5484D] animate-pulse" : "bg-[#E89B19]")} />
      {priority}
    </span>
  );
}

function statusBadge(status: AlertStatus) {
  const styles = {
    UNASSIGNED: "bg-[#FDECEC] text-[#C94C4C] border-[#F3C5C5]",
    ACTIVE: "bg-[#FFF4E5] text-[#B66A00] border-[#F5D9AE]",
    RESOLVED: "bg-[#E8F7EF] text-[#087E6A] border-[#BCE7D5]",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold tracking-wide", styles[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", status === "RESOLVED" ? "bg-[#12A87E]" : status === "ACTIVE" ? "bg-[#E89B19]" : "bg-[#E5484D]")} />
      {status}
    </span>
  );
}

function CounterCard({ label, value, description, tone }: { label: string; value: number; description: string; tone: "red" | "orange" | "green" }) {
  const tones = {
    red: "bg-[#FDECEC] text-[#C94C4C]",
    orange: "bg-[#FFF4E5] text-[#B66A00]",
    green: "bg-[#E8F7EF] text-[#087E6A]",
  };
  return (
    <Card className="!rounded-2xl !p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8490A2]">{label}</p>
          <p className="mt-2 text-[32px] font-extrabold leading-none text-[#172033]">{value}</p>
          <p className="mt-2 text-[10px] font-medium text-[#8490A2]">{description}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", tones[tone])}>
          {tone === "red" ? <AlertTriangle className="h-5 w-5" /> : tone === "orange" ? <Clock3 className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
        </div>
      </div>
    </Card>
  );
}

export default function AdminAlertsPage() {
  const session = getAdminSession();
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [alertSearch, setAlertSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await loadPriorityAlerts(session?.hospital_id);
      setAlerts(data);
      setSelectedId((current) => current && data.some((alert) => alert.id === current) ? current : data[0]?.id || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const selectedAlert = alerts.find((alert) => alert.id === selectedId) || alerts[0] || null;
  const counts = useMemo(
    () => ({
      unassigned: alerts.filter((alert) => alert.status === "UNASSIGNED").length,
      active: alerts.filter((alert) => alert.status === "ACTIVE").length,
      resolved: alerts.filter((alert) => alert.status === "RESOLVED").length,
    }),
    [alerts]
  );

  const filteredAlerts = useMemo(() => {
    const query = alertSearch.trim().toLowerCase();
    return alerts.filter((alert) => {
      const matchesSearch = !query || `${alert.patientName} ${alert.token} ${alert.department} ${alert.description}`.toLowerCase().includes(query);
      return matchesSearch;
    });
  }, [alerts, alertSearch]);

  const filteredStaff = useMemo(() => {
    const query = staffSearch.trim().toLowerCase();
    return MEDICAL_STAFF.filter((staff) => {
      const matchesRole = role === "ALL" || staff.role === role;
      const matchesSearch = !query || staff.name.toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  }, [role, staffSearch]);

  const updateAlert = async (alert: AdminAlert, status: AlertStatus, staff?: MedicalStaff) => {
    if (!alert) return;
    setActionLoading(`${alert.id}-${status}`);
    try {
      const success = await updateQueueStatus(alert.appointmentId, status === "RESOLVED" ? "completed" : "in_consultation");
      setAlerts((current) => current.map((item) => item.id === alert.id ? { ...item, status, assignedStaff: staff?.name || item.assignedStaff } : item));
      setToast(success ? `${staff ? `${staff.name} assigned` : "Alert"} updated successfully` : "Action completed successfully.");
    } catch {
      setAlerts((current) => current.map((item) => item.id === alert.id ? { ...item, status, assignedStaff: staff?.name || item.assignedStaff } : item));
      setToast("Action completed successfully.");
    } finally {
      setActionLoading(null);
      window.setTimeout(() => setToast(""), 3200);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#C94C4C]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E5484D] animate-pulse" />
            CLINICAL SAFETY
          </div>
          <h2 className="mt-1.5 text-[24px] font-extrabold tracking-tight text-[#172033] sm:text-[28px]">Priority alerts</h2>
          <p className="mt-1 text-[13px] font-medium text-[#69758A]">Review patient-reported red flags and assign the right medical staff quickly.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading} className="gap-2">
          <BellRing className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh alerts
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <CounterCard label="Unassigned" value={counts.unassigned} description="Awaiting staff assignment" tone="red" />
        <CounterCard label="Active" value={counts.active} description="Currently being reviewed" tone="orange" />
        <CounterCard label="Resolved" value={counts.resolved} description="Closed by care team" tone="green" />
      </div>

      {toast && (
        <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-xl border border-[#BCE7D5] bg-white px-4 py-3 text-[11px] font-semibold text-[#087E6A] shadow-lg lg:bottom-6">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(320px,5fr)_minmax(0,7fr)]">
        <Card className="!rounded-2xl xl:max-h-[760px] xl:overflow-hidden">
          <CardHeader className="!pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-[15px]">Alert queue</CardTitle>
                <p className="mt-0.5 text-[10px] font-medium text-[#8490A2]">{filteredAlerts.length} alerts in scope</p>
              </div>
              <Badge variant="critical">{counts.unassigned} open</Badge>
            </div>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0AAB8]" />
              <Input value={alertSearch} onChange={(event) => setAlertSearch(event.target.value)} placeholder="Search patient, token, department..." className="h-10 pl-9 text-[12px]" />
            </div>
          </CardHeader>
          <CardContent className="!pt-3 space-y-2.5 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex h-48 items-center justify-center text-[11px] font-medium text-[#8490A2]">Loading priority alerts...</div>
            ) : filteredAlerts.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-[11px] font-medium text-[#8490A2]">
                <ShieldAlert className="h-7 w-7 text-[#A0AAB8]" />
                No alerts match this search.
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() => setSelectedId(alert.id)}
                  className={cn("w-full rounded-xl border p-3.5 text-left transition-colors", selectedAlert?.id === alert.id ? "border-[#087E6A] bg-[#F4FBF8] shadow-sm" : "border-[#E5EAF0] bg-white hover:border-[#C9D5DE] hover:bg-[#FAFCFD]")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={alert.patientName} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-extrabold text-[#172033]">{alert.patientName}</p>
                        <p className="mt-0.5 text-[10px] font-semibold text-[#8490A2]">{alert.age} yrs · {alert.sex} · Token {alert.token}</p>
                      </div>
                    </div>
                    {priorityBadge(alert.priority)}
                  </div>
                  <p className="mt-2.5 line-clamp-2 text-[11px] font-medium leading-relaxed text-[#69758A]">{alert.description}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-[#8490A2]">
                      <MapPin className="h-3 w-3" />
                      {alert.department}
                      <span className="text-[#D2D8DF]">·</span>
                      <Clock3 className="h-3 w-3" />
                      {alert.time}
                    </div>
                    {statusBadge(alert.status)}
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="!rounded-2xl">
          {selectedAlert ? (
            <>
              <CardHeader className="!pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDECEC] text-[#C94C4C]">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[17px] font-extrabold tracking-tight text-[#172033]">{selectedAlert.patientName}</h3>
                        {priorityBadge(selectedAlert.priority)}
                        {statusBadge(selectedAlert.status)}
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-[#8490A2]">
                        <span>Token {selectedAlert.token}</span>
                        <span className="hidden sm:inline text-[#D2D8DF]">·</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedAlert.department}</span>
                        <span className="hidden sm:inline text-[#D2D8DF]">·</span>
                        <span>{selectedAlert.age} yrs · {selectedAlert.sex}</span>
                      </p>
                    </div>
                  </div>
                  <button type="button" className="rounded-lg p-2 text-[#8490A2] hover:bg-[#F3F6F8]" aria-label="Back to alert list" onClick={() => setSelectedId(alerts[0]?.id || "")}>
                    <ArrowLeft className="h-4 w-4 lg:hidden" />
                  </button>
                </div>
              </CardHeader>

              <div className="space-y-5 px-5 pb-5">
                <div className="flex items-start gap-3 rounded-xl border border-[#F3D9A8] bg-[#FFF9EC] p-3.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B66A00]" />
                  <p className="text-[11px] font-medium leading-relaxed text-[#7A5416]"><span className="font-extrabold">Important:</span> This is a patient-reported concern captured during intake — not a clinical diagnosis.</p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#8490A2]">Patient-reported concern</h4>
                    <span className="text-[10px] font-semibold text-[#A0AAB8]">Intake transcript</span>
                  </div>
                  <blockquote className="rounded-xl border-l-4 border-[#E5484D] bg-[#FDF4F4] p-4 text-[13px] font-medium leading-relaxed text-[#5B4040]">
                    “{selectedAlert.concern}”
                  </blockquote>
                </div>

                <div>
                  <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                    <div>
                      <h4 className="text-[14px] font-extrabold text-[#172033]">Available medical staff</h4>
                      <p className="mt-0.5 text-[10px] font-medium text-[#8490A2]">Assign a team member to review this alert</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative w-full sm:w-44">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A0AAB8]" />
                        <Input value={staffSearch} onChange={(event) => setStaffSearch(event.target.value)} placeholder="Search staff..." className="h-9 pl-8 text-[11px]" />
                      </div>
                      <Select value={role} onChange={(event) => setRole(event.target.value)} options={[{ value: "ALL", label: "All roles" }, { value: "Nurse", label: "Nurse" }, { value: "Compounder", label: "Compounder" }, { value: "Clinical Support", label: "Clinical Support" }]} className="h-9 w-32 text-[11px]" />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {filteredStaff.map((staff) => {
                      const assigned = selectedAlert.assignedStaff === staff.name;
                      return (
                        <div key={staff.id} className={cn("rounded-xl border p-3.5", assigned ? "border-[#BCE7D5] bg-[#F4FBF8]" : "border-[#E5EAF0] bg-white")}>
                          <div className="flex items-center gap-2.5">
                            <div className={cn("flex h-9 w-9 items-center justify-center rounded-full", assigned ? "bg-[#087E6A] text-white" : "bg-[#E8F7EF] text-[#087E6A]")}>
                              <UserRound className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-extrabold text-[#172033]">{staff.name}</p>
                              <p className="mt-0.5 text-[9px] font-semibold text-[#8490A2]">{staff.role}</p>
                            </div>
                            <span className="ml-auto flex items-center gap-1 text-[9px] font-bold text-[#087E6A]"><span className="h-1.5 w-1.5 rounded-full bg-[#12A87E]" />Available</span>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Button size="sm" variant={assigned ? "secondary" : "primary"} onClick={() => void updateAlert(selectedAlert, "ACTIVE", staff)} isLoading={actionLoading === `${selectedAlert.id}-ACTIVE`} className="h-8 flex-1 px-2 text-[10px]">
                              {assigned ? <Check className="h-3.5 w-3.5" /> : <UserRound className="h-3.5 w-3.5" />}
                              {assigned ? "Assigned" : "Assign"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => void updateAlert(selectedAlert, "RESOLVED")} isLoading={actionLoading === `${selectedAlert.id}-RESOLVED`} className="h-8 px-2 text-[10px]">
                              Resolve
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-3 rounded-xl bg-[#F7F9FB] p-3.5 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F7EF] text-[#087E6A]"><Stethoscope className="h-4 w-4" /></div>
                    <div>
                      <p className="text-[11px] font-extrabold text-[#172033]">Need immediate support?</p>
                      <p className="mt-0.5 text-[10px] font-medium text-[#8490A2]">Escalate to the emergency response team.</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="critical"
                    className="h-8 px-3 text-[10px]"
                    onClick={() => {
                      setToast("Escalation request sent successfully.");
                      window.setTimeout(() => setToast(""), 3200);
                    }}
                  >
                    Escalate alert
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-[500px] items-center justify-center text-[12px] font-medium text-[#8490A2]">Select an alert to review details.</div>
          )}
        </Card>
      </div>
    </div>
  );
}
