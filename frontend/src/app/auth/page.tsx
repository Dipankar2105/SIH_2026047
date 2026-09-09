import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { BackButton } from "@/components/layout/BackButton";
import { Badge } from "@/components/ui/Badge";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link href="/">
            <BackButton label="Back to Design System Home" />
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AarogyaFlow Auth</CardTitle>
              <Badge variant="default">ABHA Gateway</Badge>
            </div>
            <CardDescription>
              Foundation ready for ABHA Login & Multi-role Authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#64748B] leading-relaxed">
              This module will integrate ABHA M3 OTP authentication and role-based access for Patient, Doctor, Kiosk, and Admin consoles.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
