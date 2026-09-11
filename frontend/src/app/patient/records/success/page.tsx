"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/patient/MobileContainer";
import { PatientTopBar } from "@/components/patient/PatientTopBar";
import { SuccessState } from "@/components/patient/SuccessState";
import { usePatient } from "@/context/PatientContext";

export default function RecordsSavedSuccessPage() {
  const router = useRouter();
  const { uploadedDocument } = usePatient();

  const categoryName = uploadedDocument?.category || "Lab Report";

  return (
    <MobileContainer bgClassName="bg-white">
      {/* Top Header */}
      <PatientTopBar
        title="AarogyaFlow"
        showBack={false}
        textToRead={`Saved! Your ${categoryName} is saved in Health Records. Your information has been stored securely and can only be accessed with your permission.`}
      />

      {/* Success Content */}
      <SuccessState
        title="Saved!"
        subtitle={`Your ${categoryName} is saved in Health Records.`}
        infoMessage="Your information has been stored securely and can only be accessed with your permission."
        primaryActionLabel="View My Health Records"
        onPrimaryAction={() => router.push("/patient/records")}
        secondaryActionLabel="Back to Home"
        onSecondaryAction={() => router.push("/patient")}
      />
    </MobileContainer>
  );
}
