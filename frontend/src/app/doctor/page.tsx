import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { BackButton, PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusChip } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { MOCK_APPOINTMENTS } from "@/data/mock";

export default function DoctorPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopBar userName="Dr. Rajesh Varma" userRole="Doctor Console • Cabin 102" />
      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-4">
          <Link href="/">
            <BackButton label="Back to Design System Home" />
          </Link>
        </div>

        <PageHeader
          title="Doctor Clinical Console"
          subtitle="Real-time OPD queue, AI intake review, and prescription pad"
          badge={<Badge variant="default">Stitch Source</Badge>}
          action={<StatusChip status="normal" label="Cabin Active" />}
        />

        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live OPD Queue & Triage</CardTitle>
              <CardDescription>
                Patients in queue synchronized from active Kiosk terminals and mobile app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Scheduled Time</TableHead>
                    <TableHead>Chief Complaint</TableHead>
                    <TableHead>Triage Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_APPOINTMENTS.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-bold text-[#005F4B]">
                        {apt.tokenNumber}
                      </TableCell>
                      <TableCell className="font-semibold">{apt.patientName}</TableCell>
                      <TableCell className="text-[#64748B]">{apt.scheduledTime}</TableCell>
                      <TableCell className="text-[#334155]">{apt.chiefComplaint}</TableCell>
                      <TableCell>
                        <StatusChip status={apt.priority} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
