"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/patient/MobileContainer";
import { PatientTopBar } from "@/components/patient/PatientTopBar";
import { RedFlagAlert } from "@/components/patient/RedFlagAlert";
import { usePatient } from "@/context/PatientContext";
import { notifyHospitalStaffEmergency } from "@/lib/api/patientApi";

export default function TriageAlertPage() {
  const router = useRouter();
  const { patient, redFlagAlert } = usePatient();
  const [isAlertSent, setIsAlertSent] = useState(false);

  const handleAlertStaff = async () => {
    try {
      await notifyHospitalStaffEmergency({
        patientId: patient.id,
        reason: "Emergency Red-Flag Cardiac Triage",
        symptoms: redFlagAlert?.patientReportedText || "Severe chest pain",
      });
      setIsAlertSent(true);
    } catch {
      setIsAlertSent(true);
    }
  };

  const handleBypass = () => {
    router.push("/patient/consult/chat");
  };

  return (
    <MobileContainer bgClassName="bg-white">
      {/* Top Header */}
      <PatientTopBar
        title="AarogyaFlow"
        subtitle="Health Assistant"
        showBack={false}
        textToRead="Please wait. Your symptoms may need immediate medical attention. Please contact hospital staff now. Do not continue through the normal queue."
      />

      {/* Red Flag Alert Content */}
      <RedFlagAlert
        reportedText={
          redFlagAlert?.patientReportedText ||
          "I have severe chest pain and difficulty breathing."
        }
        isAlertSent={isAlertSent}
        onAlertStaff={handleAlertStaff}
        onBypass={handleBypass}
      />
    </MobileContainer>
  );
}
