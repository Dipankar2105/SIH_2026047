import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { BackButton, PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusChip } from "@/components/ui/Badge";

export default function KioskPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopBar userName="Terminal #KS-101" userRole="Hospital OPD Kiosk" />
      <main className="max-w-5xl mx-auto p-6">
        <div className="mb-4">
          <Link href="/">
            <BackButton label="Back to Design System Home" />
          </Link>
        </div>

        <PageHeader
          title="Hospital Kiosk Interface"
          subtitle="Touch & voice-forward walk-in intake for hospital OPD"
          badge={<Badge variant="default">Stitch Source</Badge>}
          action={<StatusChip status="normal" label="Kiosk Online" />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Walk-in Patient Intake</CardTitle>
              <CardDescription>Session-based conversational triage</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Ready for Stitch Kiosk design implementation: Large touch targets, multilingual voice-forward interaction, auto-expiring session privacy, and automated red-flag triage.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ABHA QR Scan & Token</CardTitle>
              <CardDescription>Instant registration & OPD queue token</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Scan-and-share integration with ABDM QR codes for instant patient demographic extraction and token generation.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
