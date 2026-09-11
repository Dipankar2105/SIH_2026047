"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { dashboardService } from "@/lib/services/dashboard.service";
import { useClinicalWorkflowStore } from "@/stores/clinical-workflow.store";

export default function ConsultationPage() {
  const params = useParams();
  const token = params.token as string;
  const setActiveEncounter = useClinicalWorkflowStore((s) => s.setActiveEncounter);

  useEffect(() => {
    let cancelled = false;

    dashboardService.getPatientByToken(token).then((patient) => {
      if (cancelled || !patient) return;
      const encounter = {
        patientId: patient.id,
        token: patient.token,
        priority: patient.priority,
        startedAt: new Date().toISOString(),
      };
      setActiveEncounter(encounter);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("activeEncounter", JSON.stringify(encounter));
        window.location.href = "/active-consultation";
      }
    });

    return () => {
      cancelled = true;
    };
  }, [token, setActiveEncounter]);

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-clinical-muted">Starting consultation...</p>
    </div>
  );
}
