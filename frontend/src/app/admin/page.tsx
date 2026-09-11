"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  MapPin,
  RefreshCw,
  Search,
  Stethoscope,
  UserRound,
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
import { loadDoctorDashboard } from "@/lib/api/admin";
import { getAdminSession } from "@/types/admin";
import { cn } from "@/lib/utils";
import type { AdminDoctor, DoctorStatus, HospitalDashboard } from "@/types/admin";

const statusOptions = [
  { value: "ALL", label: "All statuses" },
  { value: "FREE", label: "Free" },
  { value: "BUSY", label: "Busy" },
  { value: "HOLIDAY", label: "Holiday" },
];

const departmentOptions = [
  { value: "ALL", label: "All Departments" },
  { value: "Cardiology", label: "Cardiology" },
  { value: "Pediatrics", label: "Pediatrics" },
  { value: "Orthopedics", label: "Orthopedics" },
  { value: "ENT", label: "ENT" },
  { value: "General Medicine", label: "General Medicine" },
  { value: "Dermatology", label: "Dermatology" },
  { value: "Gynecology", label: "Gynecology" },
  { value: "Neurology", label: "Neurology" },
  { value: "Pulmonology", label: "Pulmonology" },
  { value: "Radiology", label: "Radiology" },
  { value: "Psychiatry", label: "Psychiatry" },
];

function statusBadge(status: DoctorStatus) {
  const styles = {
    FREE: "bg-[#E8F7EF] text-[#087E6A] border-[#BCE7D5]",
    BUSY: "bg-[#FFF4E5] text-[#B66A00] border-[#F5D9AE]",
    HOLIDAY: "bg-[#F1F4F7] text-[#69758A] border-[#DCE2E9]",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold tracking-wide", styles[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", status === "FREE" ? "bg-[#12A87E]" : status === "BUSY" ? "bg-[#E89B19]" : "bg-[#9AA6B5]")} />
      {status}
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  tone,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  tone: "green" | "orange" | "gray";
}) {
  const tones = {
    green: "bg-[#E8F7EF] text-[#087E6A]",
    orange: "bg-[#FFF4E5] text-[#B66A00]",
    gray: "bg-[#F1F4F7] text-[#69758A]",
  };
  return (
    <Card className="relative overflow-hidden !rounded-2xl !p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8490A2]">{title}</p>
          <p className="mt-2 text-[34px] font-extrabold leading-none tracking-tight text-[#172033]">{value}</p>
          <p className="mt-2 text-[11px] font-medium text-[#8490A2]">{description}</p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", tones[tone])}>{icon}</div>
      </div>
      <div className={cn("absolute bottom-0 left-0 h-1", tone === "green" ? "w-full bg-[#BCE7D5]" : tone === "orange" ? "w-2/3 bg-[#F5D9AE]" : "w-1/3 bg-[#DCE2E9]")} />
    </Card>
  );
}

export default function AdminDashboardPage() {
  const session = getAdminSession();
  const hospitalName = session?.hospital_name || "Hospital Operations";
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [dashboard, setDashboard] = useState<HospitalDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [lastUpdated, setLastUpdated] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await loadDoctorDashboard(session?.hospital_id);
      setDoctors(data.doctors);
      setDashboard(data.dashboard);
      setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const matchesSearch = !query || `${doctor.name} ${doctor.department} ${doctor.room} ${doctor.currentPatient}`.toLowerCase().includes(query);
      const matchesDepartment = department === "ALL" || doctor.department === department;
      const matchesStatus = status === "ALL" || doctor.status === status;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [doctors, search, department, status]);

  const counts = useMemo(
    () => ({
      free: doctors.filter((doctor) => doctor.status === "FREE").length,
      busy: doctors.filter((doctor) => doctor.status === "BUSY").length,
      holiday: doctors.filter((doctor) => doctor.status === "HOLIDAY").length,
    }),
    [doctors]
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#087E6A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#12A87E]" />
            LIVE OPERATIONS
          </div>
          <h2 className="mt-1.5 text-[24px] font-extrabold tracking-tight text-[#172033] sm:text-[28px]">Doctor availability</h2>
          <p className="mt-1 text-[13px] font-medium text-[#69758A]">Monitor OPD capacity, doctor status, and patient flow across {hospitalName}.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-xl border border-[#E5EAF0] bg-white px-3 py-2 text-[10px] font-semibold text-[#8490A2] sm:inline-flex">
            Updated {lastUpdated || "--:--"}
          </span>
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading} className="gap-2">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Doctors Available" value={counts.free} description="Ready to see patients now" icon={<UserRound className="h-5 w-5" />} tone="green" />
        <StatCard title="Doctors Busy" value={counts.busy} description="Currently in consultation" icon={<Stethoscope className="h-5 w-5" />} tone="orange" />
        <StatCard title="Doctors on Holiday" value={counts.holiday} description="Unavailable today" icon={<CalendarClock className="h-5 w-5" />} tone="gray" />
      </div>

      <Card className="!rounded-2xl">
        <div className="flex flex-col gap-3 border-b border-[#EDF1F5] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[15px] font-extrabold text-[#172033]">Doctor roster</h3>
            <p className="mt-0.5 text-[11px] font-medium text-[#8490A2]">{filteredDoctors.length} of {doctors.length || 12} doctors match your filters</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0AAB8]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search doctor, department, room..."
                className="h-10 pl-9 text-[12px]"
              />
            </div>
            <Select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              options={departmentOptions}
              className="h-10 w-full sm:w-44 text-[12px]"
            />
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              options={statusOptions}
              className="h-10 w-full sm:w-36 text-[12px]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Doctor</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[190px]">Current patient / note</TableHead>
                <TableHead>Room / location</TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && doctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-[12px] text-[#8490A2]">Loading doctor availability...</TableCell>
                </TableRow>
              ) : filteredDoctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-[12px] text-[#8490A2]">No doctors match the selected filters.</TableCell>
                </TableRow>
              ) : (
                filteredDoctors.map((doctor) => (
                  <TableRow key={doctor.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={doctor.name} size="sm" />
                        <div>
                          <p className="text-[12px] font-bold text-[#172033]">{doctor.name}</p>
                          <p className="mt-0.5 text-[10px] font-medium text-[#8490A2]">MBBS, MD</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[12px] font-semibold text-[#4B586C]">{doctor.department}</TableCell>
                    <TableCell>{statusBadge(doctor.status)}</TableCell>
                    <TableCell>
                      <div className="max-w-[220px]">
                        <p className="truncate text-[12px] font-semibold text-[#172033]">{doctor.currentPatient}</p>
                        <p className="mt-0.5 truncate text-[10px] font-medium text-[#8490A2]">{doctor.note}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#4B586C]">
                        <MapPin className="h-3.5 w-3.5 text-[#087E6A]" />
                        {doctor.room}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button type="button" className="rounded-lg p-1.5 text-[#A0AAB8] opacity-0 transition-opacity hover:bg-[#F3F6F8] hover:text-[#087E6A] group-hover:opacity-100" aria-label={`View ${doctor.name}`}>
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
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
              <CardTitle className="text-[14px]">Hospital pulse</CardTitle>
              <Badge variant="default">Live</Badge>
            </div>
          </CardHeader>
          <CardContent className="!pt-2">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#F7F9FB] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8490A2]">Waiting patients</p>
                <p className="mt-1 text-[22px] font-extrabold text-[#172033]">{dashboard?.queue_stats?.waiting_patients ?? 18}</p>
              </div>
              <div className="rounded-xl bg-[#F7F9FB] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8490A2]">In consultation</p>
                <p className="mt-1 text-[22px] font-extrabold text-[#172033]">{dashboard?.queue_stats?.in_consultation ?? 4}</p>
              </div>
              <div className="rounded-xl bg-[#F7F9FB] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8490A2]">Avg. wait</p>
                <p className="mt-1 text-[22px] font-extrabold text-[#172033]">{dashboard?.daily_analytics?.avg_wait_time_minutes ?? 15}<span className="ml-1 text-[11px] font-semibold text-[#8490A2]">min</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="!rounded-2xl">
          <CardHeader className="!pb-3">
            <CardTitle className="text-[14px]">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="!pt-2 space-y-2">
            <button type="button" className="flex w-full items-center justify-between rounded-xl border border-[#E5EAF0] bg-white p-3 text-left text-[11px] font-semibold text-[#4B586C] hover:border-[#BCE7D5] hover:bg-[#F7FCFA]">
              <span className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8F7EF] text-[#087E6A]"><Users className="h-3.5 w-3.5" /></span>Open queue control</span><ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <button type="button" className="flex w-full items-center justify-between rounded-xl border border-[#E5EAF0] bg-white p-3 text-left text-[11px] font-semibold text-[#4B586C] hover:border-[#F5D9AE] hover:bg-[#FFFBF3]">
              <span className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFF4E5] text-[#B66A00]"><Activity className="h-3.5 w-3.5" /></span>Review priority alerts</span><ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
