"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/patient/MobileContainer";
import { PatientTopBar } from "@/components/patient/PatientTopBar";
import { SelectionCard } from "@/components/patient/SelectionCard";
import { usePatient } from "@/context/PatientContext";
import { CarePathwayType } from "@/types/patient";

export default function CarePathwayPage() {
  const router = useRouter();
  const { selectedPathway, setSelectedPathway } = usePatient();

  const handleSelectPathway = (pathway: CarePathwayType) => {
    setSelectedPathway(pathway);
    router.push("/patient/consult/chat");
  };

  return (
    <MobileContainer bgClassName="bg-[#F4F7F9]">
      {/* Top Header */}
      <PatientTopBar
        title="AarogyaFlow"
        showBack={true}
        backHref="/patient"
        textToRead="What kind of consultation today? Choose the type of care you would like. Modern Medicine for general medical consultation, or AYUSH for Ayurvedic consultation."
      />

      {/* Main Content Area */}
      <main className="flex-1 px-5 pt-4 pb-8 overflow-y-auto">
        {/* Title & Subtitle Section */}
        <section className="mb-6">
          <h1 className="text-[26px] leading-[1.25] font-extrabold text-[#111e33] tracking-[-0.015em] mb-2">
            What kind of
            <br />
            consultation today?
          </h1>
          <p className="text-[14px] text-[#69798e] font-normal leading-normal">
            Choose the type of care you&apos;d like.
          </p>
        </section>

        {/* Consultation Mode Selection Cards */}
        <section className="space-y-4">
          {/* Option 1: Modern Medicine */}
          <SelectionCard
            title="Modern Medicine"
            description="General medical consultation"
            isSelected={selectedPathway === "modern"}
            onClick={() => handleSelectPathway("modern")}
            iconBgColor="bg-[#eff5f5]"
            icon={
              <svg
                className="w-11 h-11"
                fill="none"
                viewBox="0 0 64 64"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Pill 1: Cyan & Coral */}
                <g transform="rotate(-38 28 32)">
                  <path
                    d="M20 22 C20 17 24 13 29 13 C34 13 38 17 38 22 L38 31 L20 31 Z"
                    fill="#38BDF8"
                  />
                  <path
                    d="M20 31 L38 31 L38 40 C38 45 34 49 29 49 C24 49 20 45 20 40 Z"
                    fill="#F43F5E"
                  />
                  <rect
                    height="36"
                    rx="9"
                    stroke="#1E293B"
                    strokeWidth="2.5"
                    width="18"
                    x="20"
                    y="13"
                  />
                  <line
                    stroke="#1E293B"
                    strokeWidth="2.5"
                    x1="20"
                    x2="38"
                    y1="31"
                    y2="31"
                  />
                  <path
                    d="M24 18 C24 16 26 15 28 15"
                    stroke="white"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </g>
                {/* Pill 2: Yellow & White */}
                <g transform="rotate(35 38 34)">
                  <path
                    d="M30 22 C30 17 34 13 39 13 C44 13 48 17 48 22 L48 31 L30 31 Z"
                    fill="#FFFFFF"
                  />
                  <path
                    d="M30 31 L48 31 L48 40 C48 45 44 49 39 49 C34 49 30 45 30 40 Z"
                    fill="#FBBF24"
                  />
                  <rect
                    height="36"
                    rx="9"
                    stroke="#1E293B"
                    strokeWidth="2.5"
                    width="18"
                    x="30"
                    y="13"
                  />
                  <line
                    stroke="#1E293B"
                    strokeWidth="2.5"
                    x1="30"
                    x2="48"
                    y1="31"
                    y2="31"
                  />
                </g>
              </svg>
            }
          />

          {/* Option 2: AYUSH / Ayurveda */}
          <SelectionCard
            title="AYUSH / Ayurveda"
            description="Ayurvedic consultation"
            isSelected={selectedPathway === "ayush"}
            onClick={() => handleSelectPathway("ayush")}
            iconBgColor="bg-[#f7f3ec]"
            icon={
              <svg
                className="w-11 h-11"
                fill="none"
                viewBox="0 0 64 64"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Pestle */}
                <rect
                  fill="#C28E5C"
                  height="24"
                  rx="4"
                  stroke="#221B14"
                  strokeWidth="2.2"
                  transform="rotate(-30 18 14)"
                  width="8"
                  x="18"
                  y="14"
                />
                {/* Leaves */}
                <path
                  d="M38 27 C38 21 44 19 46 19 C46 22 45 28 39 30"
                  fill="#34D399"
                  stroke="#1D3E2E"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M34 26 C33 21 28 20 27 20 C27 23 29 27 34 28"
                  fill="#10B981"
                  stroke="#1D3E2E"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M36 29 C38 23 37 17 37 17 C34 18 33 24 35 29"
                  fill="#059669"
                  stroke="#1D3E2E"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                {/* Mortar Bowl */}
                <path
                  d="M16 32 C16 32 17 48 32 48 C47 48 48 32 48 32 Z"
                  fill="#D6C5B3"
                  stroke="#221B14"
                  strokeWidth="2.5"
                />
                {/* Mortar Rim */}
                <ellipse
                  cx="32"
                  cy="32"
                  fill="#E8DED1"
                  rx="16"
                  ry="4"
                  stroke="#221B14"
                  strokeWidth="2.5"
                />
                <path
                  d="M26 48 L38 48 L40 51 L24 51 Z"
                  fill="#B39F8C"
                  stroke="#221B14"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                />
              </svg>
            }
          />
        </section>
      </main>
    </MobileContainer>
  );
}
