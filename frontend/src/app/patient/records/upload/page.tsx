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

export default function RecordsUploadPage() {
  const router = useRouter();
  const { patient, addHealthRecord, setUploadedDocument } = usePatient();
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
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      setAttachedFile({
        name: source === "camera" ? "Document_camera.jpg" : "CBC_Report_Thyrocare.pdf",
        size: "1.4 MB",
      });
    }
  };

  const handleSave = async () => {
    if (!attachedFile) return;
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

      addHealthRecord({
        id: `rec-user-${Date.now()}`,
        title: selectedCategory,
        category: selectedCategory,
        provider: "City Hospital",
        date: "Today",
        source: "Added to AarogyaFlow",
        fileSize: attachedFile.size,
      });

      router.push("/patient/records/success");
    } catch {
      router.push("/patient/records/success");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <MobileContainer bgClassName="bg-[#FAFBFB]">
      {/* Top Header */}
      <PatientTopBar
        title="AarogyaFlow"
        showBack={true}
        backHref="/patient/records"
        textToRead="Upload Records. Choose what you are sharing below and attach a photo or file."
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Screen Content */}
      <main className="flex-1 px-5 pt-4 pb-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-5">
          <div>
            <h1 className="text-[25px] font-bold text-slate-900 tracking-tight leading-tight">
              Choose what you are
              <br />
              sharing below:
            </h1>
            <p className="text-[13px] text-slate-500 mt-1 font-normal">
              Choose only 1 option
            </p>
          </div>

          {/* Category Chips */}
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

          {/* Upload Sources or Attached Card */}
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
            <div className="pt-2">
              <UploadedFileCard
                fileName={attachedFile.name}
                category={selectedCategory}
                fileSize={attachedFile.size}
                onRemove={() => setAttachedFile(null)}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-6">
          <PrimaryButton
            type="button"
            onClick={handleSave}
            disabled={!attachedFile}
            isLoading={isUploading}
          >
            Save Record
          </PrimaryButton>

          <SecondaryButton
            type="button"
            onClick={() => router.push("/patient/records")}
          >
            Cancel
          </SecondaryButton>
        </div>
      </main>
    </MobileContainer>
  );
}
