"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Check } from "lucide-react";
import { MobileContainer } from "@/components/patient/MobileContainer";
import { PrimaryButton } from "@/components/patient/PrimaryButton";
import { SecondaryButton } from "@/components/patient/SecondaryButton";
import { usePatient } from "@/context/PatientContext";
import { CONSENT_ITEMS } from "@/data/patientMockData";
import { grantPatientConsent } from "@/lib/api/patientApi";

export default function ConsentPage() {
  const router = useRouter();
  const { patient, setPatient } = usePatient();
  const [agreed, setAgreed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleGrantConsent = async () => {
    if (!agreed) return;
    setIsLoading(true);

    try {
      await grantPatientConsent(patient.id);
      setPatient((prev) => ({
        ...prev,
        hasGivenConsent: true,
      }));
      router.push("/patient");
    } catch {
      router.push("/patient");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileContainer bgClassName="bg-[#808996] sm:bg-[#737d8b]">
      <div className="w-full my-auto flex flex-col justify-end p-2 sm:p-3">
        {/* Consent Card Container */}
        <section className="bg-white rounded-[28px] shadow-2xl px-6 pt-6 pb-7 text-slate-800 flex flex-col max-h-[820px] overflow-y-auto">
          {/* Header Section */}
          <header className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0a6652] flex items-center justify-center text-white shrink-0 shadow-sm">
              <KeyRound className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-[21px] font-bold text-slate-900 tracking-tight leading-snug">
                Your consent matters
              </h1>
              <p className="text-[13px] text-slate-500 font-normal leading-normal">
                You&apos;re always in control of your health data.
              </p>
            </div>
          </header>

          <hr className="border-t border-slate-100 my-4" />

          {/* Informational Intro */}
          <p className="text-[13.5px] leading-[1.45] text-slate-600 mb-4">
            To provide you with the best care, this app may do the following. You can update these preferences at any time in Settings.
          </p>

          {/* Consent Item List */}
          <ul className="space-y-3.5 mb-5">
            {CONSENT_ITEMS.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#d5f4ee] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-[#0a9e88] stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13.5px] font-semibold text-slate-800 leading-tight">
                    {item.title}
                  </span>
                  <span className="text-[12px] text-slate-400 font-normal mt-0.5 leading-normal">
                    {item.description}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {/* Supporting Links */}
          <nav aria-label="Legal and details links" className="flex items-center gap-5 text-[13px] mb-4">
            <a
              href="#consent-details"
              className="text-[#0d8574] font-medium underline underline-offset-2 hover:text-teal-900 transition-colors"
            >
              View full consent details
            </a>
            <a
              href="#privacy-policy"
              className="text-slate-500 font-normal underline underline-offset-2 hover:text-slate-700 transition-colors"
            >
              Privacy policy
            </a>
          </nav>

          {/* Agreement Checkbox */}
          <div className="border-t border-slate-100 pt-4 mb-5">
            <label className="flex items-start gap-3.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-[#005F4B] rounded cursor-pointer"
              />
              <span className="text-[13px] text-slate-600 leading-snug">
                I understand and agree. I know I can{" "}
                <strong className="font-semibold text-[#097b69]">
                  change or withdraw
                </strong>{" "}
                my consent at any time.
              </span>
            </label>
          </div>

          {/* Actions */}
          <footer className="flex flex-col gap-2.5 w-full">
            <PrimaryButton
              type="button"
              colorScheme="sage"
              onClick={handleGrantConsent}
              disabled={!agreed}
              isLoading={isLoading}
            >
              Give Consent &amp; Continue
            </PrimaryButton>

            <SecondaryButton
              type="button"
              onClick={() => router.push("/patient/auth/abha")}
            >
              Cancel
            </SecondaryButton>
          </footer>
        </section>
      </div>
    </MobileContainer>
  );
}
