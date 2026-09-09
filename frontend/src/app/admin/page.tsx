import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { BackButton, PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusChip } from "@/components/ui/Badge";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopBar userName="Admin Staff" userRole="Reception & OPD Management" />
      <main className="max-w-5xl mx-auto p-6">
        <div className="mb-4">
          <Link href="/">
            <BackButton label="Back to Design System Home" />
          </Link>
        </div>

        <PageHeader
          title="Hospital Admin & Reception"
          subtitle="Queue orchestration, kiosk terminal monitoring, and doctor availability"
          badge={<Badge variant="default">Stitch Source</Badge>}
          action={<StatusChip status="normal" label="System Operational" />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Terminal & Kiosk Status</CardTitle>
              <CardDescription>Live health and telemetry of OPD kiosks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Ready for Stitch Reception/Admin design implementation: Kiosk hardware status, paper level, session privacy timeouts, and active tokens.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Doctor Roster & Cabins</CardTitle>
              <CardDescription>OPD schedule & cabin allocation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Live doctor check-ins, cabin reassignment, and queue redistribution for peak OPD hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
