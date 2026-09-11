"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/patient/MobileContainer";
import { PatientTopBar } from "@/components/patient/PatientTopBar";
import { SuccessState } from "@/components/patient/SuccessState";
import { usePatient } from "@/context/PatientContext";

export default function ConsultationSuccessPage() {
  const router = useRouter();
  const { assignedToken, estimatedWaitMinutes } = usePatient();

  return (
    <MobileContainer bgClassName="bg-white">
      {/* Top Header */}
      <PatientTopBar
        title="AarogyaFlow"
        showBack={false}
        textToRead="You are all set! Your health summary has been sent to the doctor. Your appointment token number is 42, estimated wait time is 15 minutes."
      />

      {/* Success Content */}
      <SuccessState
        title="You're all set!"
        subtitle="Your health summary has been sent to the doctor."
        badgeLabel="APPOINTMENT"
        tokenNumber={assignedToken || "42"}
        estimatedWaitMin={estimatedWaitMinutes || 15}
        infoMessage="Your information has been securely prepared for your healthcare team."
        primaryActionLabel="View My Health Records"
        onPrimaryAction={() => router.push("/patient/records")}
        secondaryActionLabel="Back to Home"
        onSecondaryAction={() => router.push("/patient")}
      />
    </MobileContainer>
  );
}
