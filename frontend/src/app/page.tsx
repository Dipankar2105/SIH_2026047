import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge, StatusChip } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { TextField } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Progress } from "@/components/ui/Avatar";
import { Smartphone, Monitor, Stethoscope, ShieldCheck, KeyRound } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopBar />

      <main className="max-w-6xl mx-auto p-6 md:p-10 space-y-10">
        {/* Header Hero Section */}
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#005F4B]" />
            <span className="text-xs font-bold text-[#005F4B] uppercase tracking-wider">
              AarogyaFlow Design System & Architecture Foundation
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Clean Healthcare UI Architecture
          </h1>
          <p className="text-sm text-[#475569] leading-relaxed">
            Frontend foundation established with Next.js App Router, React 19, TypeScript, and Tailwind CSS.
            Designed strictly with official healthcare tokens: Deep Teal (#005F4B), Mint (#E6F4EA), Terracotta Alert (#C84B31), and Atkinson typography.
          </p>
        </div>

        {/* Portals Ready for Implementation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
              Design Source Mapping (Figma & Stitch)
            </h2>
            <Badge variant="default">4 Target Consoles</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Patient App */}
            <Link href="/patient" className="group">
              <Card variant="interactive" className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#005F4B]">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <Badge variant="default">Stitch 19 Screens</Badge>
                  </div>
                  <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#005F4B] transition-colors">
                    Patient Mobile App
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Visual source: <strong>Stitch (19 Screens)</strong>
                  </p>
                  <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                    Mobile-first ABHA onboarding, AI intake triage, care pathway, records, & appointments.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-xs font-semibold text-[#005F4B] flex items-center justify-between">
                  <span>Open Patient App</span>
                  <span>→</span>
                </div>
              </Card>
            </Link>

            {/* Kiosk Mode */}
            <Link href="/kiosk" className="group">
              <Card variant="interactive" className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#005F4B]">
                      <Monitor className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary">Source 2</Badge>
                  </div>
                  <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#005F4B] transition-colors">
                    Hospital Kiosk
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Visual source: <strong>Stitch</strong>
                  </p>
                  <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                    Voice-forward touchscreen walk-in triage with auto-expiring session privacy.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-xs font-semibold text-[#005F4B] flex items-center gap-1">
                  View Foundation <span>→</span>
                </div>
              </Card>
            </Link>

            {/* Doctor Console */}
            <Link href="/doctor" className="group">
              <Card variant="interactive" className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#005F4B]">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary">Source 3</Badge>
                  </div>
                  <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#005F4B] transition-colors">
                    Doctor Console
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Visual source: <strong>Stitch</strong>
                  </p>
                  <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                    Real-time waiting queue, AI intake review, AYUSH diagnostics, and Rx.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-xs font-semibold text-[#005F4B] flex items-center gap-1">
                  View Foundation <span>→</span>
                </div>
              </Card>
            </Link>

            {/* Reception / Admin */}
            <Link href="/admin" className="group">
              <Card variant="interactive" className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#005F4B]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary">Source 4</Badge>
                  </div>
                  <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#005F4B] transition-colors">
                    Reception & Admin
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Visual source: <strong>Stitch</strong>
                  </p>
                  <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                    Queue orchestration, doctor cabin management, and kiosk telemetry.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-xs font-semibold text-[#005F4B] flex items-center gap-1">
                  View Foundation <span>→</span>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Design System Tokens & Component Library Showcase */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
            Design Tokens & Foundation Components
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Color Tokens & Principles */}
            <Card>
              <CardHeader>
                <CardTitle>Healthcare Color Palette</CardTitle>
                <CardDescription>
                  Calm visual appearance without generic purple/blue SaaS styling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#005F4B] border border-black/10 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Primary Action (#005F4B)</span>
                    <span className="text-[11px] text-[#64748B]">Deep teal for primary actions, buttons, and brand focus</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#E6F4EA] border border-[#005F4B]/20 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Secondary Surface (#E6F4EA)</span>
                    <span className="text-[11px] text-[#64748B]">Calm mint/sage for chips, active tabs, and gentle highlights</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#C84B31] border border-black/10 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Critical / Emergency Alert (#C84B31)</span>
                    <span className="text-[11px] text-[#64748B]">Terracotta used strictly and ONLY for emergency alerts</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Neutral Background (#F8FAFC) & White (#FFFFFF)</span>
                    <span className="text-[11px] text-[#64748B]">Subtle high-readability healthcare workspace</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buttons & Interactive Components */}
            <Card>
              <CardHeader>
                <CardTitle>Buttons & Status Chips</CardTitle>
                <CardDescription>Accessible touch targets (44px min) and clear states</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Primary Action</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="critical">Critical</Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F1F5F9]">
                  <StatusChip status="normal" label="Green / Low" />
                  <StatusChip status="urgent" label="Yellow / Urgent" />
                  <StatusChip status="critical" label="Red / Emergency" />
                  <StatusChip status="waiting" />
                  <StatusChip status="completed" />
                </div>

                <div className="pt-2 border-t border-[#F1F5F9]">
                  <span className="text-xs font-bold text-[#475569] block mb-1.5 uppercase">Clinical Progress</span>
                  <Progress value={65} max={100} />
                  <span className="text-[10px] text-[#64748B] mt-1 block">Step 3 of 5 completed (65%)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form & Alerts Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Components</CardTitle>
                <CardDescription>Clean inputs with label and helper states</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TextField
                  label="Patient ABHA Number"
                  placeholder="e.g. 91-4491-0021-3312"
                  helperText="14-digit standardized Ayushman Bharat Health Account ID"
                />
                <Select
                  label="Consulting Specialty"
                  options={[
                    { value: "general", label: "Kayachikitsa (General Medicine)" },
                    { value: "panchakarma", label: "Panchakarma Specialty" },
                    { value: "shalya", label: "Shalya Tantra (Surgery & Ortho)" },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clinical Alert Banners</CardTitle>
                <CardDescription>Strict semantic use of alert colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert
                  variant="info"
                  title="ABDM Consent Artifact Active"
                >
                  Health records shared under ABDM HIP consent token for OPD consult.
                </Alert>

                <Alert
                  variant="critical"
                  title="Critical Cardiac Red-Flag Alert"
                >
                  Acute chest distress detected. Emergency protocol activated. Direct to Emergency Bay #1.
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-center text-xs text-[#64748B] gap-2">
          <span>AarogyaFlow • SIH 2026 PS 26047 (AIIA, Ministry of AYUSH)</span>
          <Link href="/auth" className="text-[#005F4B] font-semibold hover:underline flex items-center gap-1">
            <KeyRound className="h-3.5 w-3.5" /> Authentication Gateway
          </Link>
        </div>
      </main>
    </div>
  );
}
