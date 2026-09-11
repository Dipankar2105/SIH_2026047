"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  HeartPulse,
  Hospital,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { apiFetch } from "@/lib/api/client";
import {
  FALLBACK_HOSPITALS,
  MOCK_ADMIN_TOKEN,
  ADMIN_SESSION_KEY,
  getAdminSession,
  saveAdminSession,
  type HospitalOption,
} from "@/types/admin";

const DEFAULT_RECEPTIONIST = "Arpit Agarwal";
const DEFAULT_PASSCODE = "1234";

export default function AdminLoginPage() {
  const router = useRouter();
  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [receptionistName, setReceptionistName] = useState(DEFAULT_RECEPTIONIST);
  const [passcode, setPasscode] = useState(DEFAULT_PASSCODE);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const existingSession = getAdminSession();
    if (existingSession) {
      router.replace("/admin");
      return;
    }

    let active = true;
    setLoading(true);
    void apiFetch<HospitalOption[]>("/hospital/list")
      .then((result) => {
        if (!active) return;
        const liveHospitals =
          result.success && Array.isArray(result.data)
            ? result.data.filter((hospital): hospital is HospitalOption => Boolean(hospital?.id && hospital?.name))
            : [];
        const options = liveHospitals.length > 0 ? liveHospitals : FALLBACK_HOSPITALS;
        setHospitals(options);
        setSelectedHospitalId(options[0]?.id || "");
      })
      .catch(() => {
        if (!active) return;
        setHospitals(FALLBACK_HOSPITALS);
        setSelectedHospitalId(FALLBACK_HOSPITALS[0]?.id || "");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const selectedHospital = hospitals.find((hospital) => hospital.id === selectedHospitalId);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!selectedHospital) {
      setError("Select a hospital to continue.");
      return;
    }

    if (passcode !== DEFAULT_PASSCODE) {
      setError("Enter the receptionist access passcode.");
      return;
    }

    setSubmitting(true);
    saveAdminSession({
      hospital_id: selectedHospital.id,
      hospital_name: selectedHospital.name,
      receptionist_name: receptionistName.trim() || DEFAULT_RECEPTIONIST,
      token: MOCK_ADMIN_TOKEN,
    });
    router.replace("/admin");
  };

  return (
    <div className="min-h-screen bg-[#F5F7F9] text-[#172033]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(420px,6fr)]">
        <section className="relative hidden overflow-hidden bg-[#087E6A] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_85%_75%,rgba(255,255,255,0.12),transparent_30%)]" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-[15px] font-extrabold">
              AF
            </span>
            <div>
              <p className="text-[15px] font-extrabold tracking-tight">AarogyaFlow</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/70">Hospital OS</p>
            </div>
          </div>

          <div className="relative max-w-[520px]">
            <div className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
              <ShieldCheck className="h-4 w-4" />
              Admin Console
            </div>
            <h1 className="text-[38px] font-extrabold leading-[1.08] tracking-tight">Receptionist Login</h1>
            <p className="mt-5 max-w-[440px] text-[15px] font-medium leading-relaxed text-white/82">
              Coordinate OPD flow, review clinical safety alerts, and keep every patient moving with one secure hospital workspace.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: <HeartPulse className="h-4 w-4" />, title: "Live hospital operations", detail: "Doctor capacity and queue activity" },
                { icon: <ShieldCheck className="h-4 w-4" />, title: "Priority clinical alerts", detail: "Fast, accountable triage review" },
                { icon: <Building2 className="h-4 w-4" />, title: "Hospital-scoped access", detail: "Your selected facility only" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/10 p-3.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-[12px] font-extrabold">{item.title}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-white/70">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-2 text-[10px] font-medium text-white/65">
            <CheckCircle2 className="h-4 w-4" />
            Secure reception workflow for authorized hospital staff
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center p-5 sm:p-10 lg:p-16">
          <div className="w-full max-w-[500px]">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087E6A] text-sm font-extrabold text-white">
                AF
              </span>
              <div>
                <p className="text-[14px] font-extrabold">AarogyaFlow</p>
                <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#8490A2]">Hospital OS</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#087E6A]">
                <ShieldCheck className="h-4 w-4" />
                Authorized access
              </div>
              <img src="/logo.svg" alt="Logo" className="h-12 w-auto mb-4 mx-auto" />
              <h2 className="mt-3 text-[28px] font-extrabold tracking-tight text-[#172033] sm:text-[34px]">
                AarogyaFlow Admin Console <span className="text-[#A0AAB8]">—</span> Receptionist Login
              </h2>
              <p className="mt-3 text-[13px] font-medium leading-relaxed text-[#69758A]">
                Sign in to manage your hospital&apos;s reception and clinical operations.
              </p>
            </div>

            <Card className="!rounded-2xl border-[#E5EAF0] shadow-sm">
              <CardHeader className="!pb-5">
                <CardTitle className="text-[15px]">Hospital access details</CardTitle>
              </CardHeader>
              <CardContent className="!pt-0">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="hospital" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-[#4B586C]">
                      Hospital selection
                    </label>
                    <Select
                      id="hospital"
                      value={selectedHospitalId}
                      onChange={(event) => {
                        setSelectedHospitalId(event.target.value);
                        setError("");
                      }}
                      options={
                        loading
                          ? [{ value: "", label: "Loading hospitals..." }]
                          : hospitals.map((hospital) => ({
                              value: hospital.id,
                              label: hospital.name,
                            }))
                      }
                      disabled={loading}
                      className="h-11 text-[12px]"
                    />
                    <p className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-[#8490A2]">
                      <Hospital className="h-3.5 w-3.5 text-[#087E6A]" />
                      {loading ? "Fetching registered facilities" : "Live hospital directory"}
                    </p>
                  </div>

                  <TextField
                    label="Receptionist name"
                    value={receptionistName}
                    onChange={(event) => {
                      setReceptionistName(event.target.value);
                      setError("");
                    }}
                    autoComplete="name"
                    className="h-11 text-[12px]"
                  />

                  <TextField
                    label="Access PIN / Passcode"
                    type="password"
                    value={passcode}
                    onChange={(event) => {
                      setPasscode(event.target.value);
                      setError("");
                    }}
                    autoComplete="current-password"
                    className="h-11 text-[12px]"
                  />

                  {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-[#F3C5C5] bg-[#FDECEC] p-3 text-[11px] font-medium text-[#C94C4C]" role="alert">
                      <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={submitting}
                    disabled={submitting || loading || !selectedHospitalId}
                    className="w-full"
                  >
                    <LogIn className="h-4 w-4" />
                    {submitting ? "Signing in..." : "Sign in to console"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <div className="flex items-start gap-2.5 rounded-xl bg-[#F7F9FB] p-3.5">
                    <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-[#087E6A]" />
                    <p className="text-[10px] font-medium leading-relaxed text-[#69758A]">
                      Use the assigned receptionist credentials for this facility. Your session is scoped to the selected hospital.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            <p className="mt-6 text-center text-[10px] font-medium text-[#A0AAB8]">
              Protected workspace · Session key <span className="font-mono">{ADMIN_SESSION_KEY}</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
