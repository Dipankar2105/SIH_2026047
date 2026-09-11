"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/patient/MobileContainer";
import { PatientTopBar } from "@/components/patient/PatientTopBar";
import { ChipButton } from "@/components/patient/ChipButton";
import { UploadOptionCard, UploadedFileCard } from "@/components/patient/UploadCards";
import { PrimaryButton } from "@/components/patient/PrimaryButton";
import { SecondaryButton } from "@/components/patient/SecondaryButton";
import { usePatient } from "@/context/PatientContext";
import { uploadPatientDocument } from "@/lib/api/patientApi";
import { DocumentCategory } from "@/types/patient";

const CATEGORIES: DocumentCategory[] = [
  "Lab Report",
  "Prescription",
  "Scan / X-Ray",
  "File (History)",
];

export default function ConsultUploadPage() {
  const router = useRouter();
  const { patient, setUploadedDocument, addHealthRecord } = usePatient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>("Lab Report");
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setAttachedFile({
        name: file.name,
        size: `${sizeMb} MB`,
      });
    }
  };

  const handleSimulateSelect = (source: "camera" | "gallery") => {
    // Check if input exists
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      // Fallback demo file
      setAttachedFile({
        name: source === "camera" ? "Photo_today.jpg" : "Medical_report_2026.pdf",
        size: "1.8 MB",
      });
    }
  };

  const handleContinue = async () => {
    if (!attachedFile) {
      router.push("/patient/consult/success");
      return;
    }

    setIsUploading(true);
    try {
      await uploadPatientDocument({
        patientId: patient.id,
        category: selectedCategory,
        fileName: attachedFile.name,
        fileSize: attachedFile.size,
      });

      setUploadedDocument({
        name: attachedFile.name,
        category: selectedCategory,
      });

      // Add to patient health records list
      addHealthRecord({
        id: `rec-user-${Date.now()}`,
        title: selectedCategory,
        category: selectedCategory,
        provider: "City Hospital",
        date: "Today",
        source: "Added to AarogyaFlow",
        fileSize: attachedFile.size,
      });

      router.push("/patient/consult/success");
    } catch {
      router.push("/patient/consult/success");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    router.push("/patient/consult/success");
  };

  return (
    <MobileContainer bgClassName="bg-[#FAFDFD]">
      {/* Top Header */}
      <PatientTopBar
        title="AarogyaFlow"
        showBack={true}
        backHref="/patient/consult/chat"
        textToRead="Do you have any reports to share? Choose what you are sharing below and then upload. You can also skip this step."
      />

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Content */}
      <main className="flex-1 px-5 pt-4 pb-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-5">
          {/* Title & Prompt */}
          <div>
            <h1 className="text-[25px] sm:text-[26px] font-bold text-slate-900 tracking-tight leading-tight">
              Do you have any
              <br />
              reports to share?
            </h1>
            <p className="text-[13px] text-slate-500 mt-1 font-normal">
              Choose what you are sharing below and then upload —{" "}
              <span className="font-medium text-slate-700">
                {attachedFile ? "ready to submit" : "optional"}
              </span>
              .
            </p>
          </div>

          {/* Document Category Pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <ChipButton
                key={cat}
                label={cat}
                isSelected={selectedCategory === cat}
                onSelect={() => setSelectedCategory(cat)}
              />
            ))}
          </div>

          {/* Upload Sources OR Attached File State */}
          {!attachedFile ? (
            <div className="space-y-3 pt-2">
              <UploadOptionCard
                title="Take a photo"
                subtitle="Use your camera"
                type="camera"
                onClick={() => handleSimulateSelect("camera")}
              />
              <UploadOptionCard
                title="Choose from phone"
                subtitle="Gallery or files"
                type="gallery"
                onClick={() => handleSimulateSelect("gallery")}
              />
            </div>
          ) : (
            <div className="pt-2 space-y-3">
              <UploadedFileCard
                fileName={attachedFile.name}
                category={selectedCategory}
                fileSize={attachedFile.size}
                onRemove={() => setAttachedFile(null)}
              />
            </div>
          )}
        </div>

        {/* Action Buttons Stack */}
        <div className="space-y-3 pt-6">
          {attachedFile ? (
            <PrimaryButton
              type="button"
              onClick={handleContinue}
              isLoading={isUploading}
            >
              Continue
            </PrimaryButton>
          ) : (
            <PrimaryButton
              type="button"
              onClick={handleSkip}
            >
              Continue without reports
            </PrimaryButton>
          )}

          <SecondaryButton type="button" onClick={handleSkip}>
            Skip for now
          </SecondaryButton>
        </div>
      </main>
    </MobileContainer>
  );
}
