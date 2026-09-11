"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Shield, ChevronRight, ArrowLeft } from "lucide-react";
import { MobileContainer } from "@/components/patient/MobileContainer";
import { AudioListenButton } from "@/components/patient/AudioListenButton";
import { PrimaryButton } from "@/components/patient/PrimaryButton";
import { usePatient } from "@/context/PatientContext";
import { requestMobileOtp } from "@/lib/api/patientApi";

export default function EnterAbhaPage() {
  const router = useRouter();
  const { setPatient } = usePatient();
  const [rawAbha, setRawAbha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Format 14 digits as XX-XXXX-XXXX-XXXX
  const formatAbha = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "").slice(0, 14);
    const parts = [];
    if (cleaned.length > 0) parts.push(cleaned.slice(0, 2));
    if (cleaned.length > 2) parts.push(cleaned.slice(2, 6));
    if (cleaned.length > 6) parts.push(cleaned.slice(6, 10));
    if (cleaned.length > 10) parts.push(cleaned.slice(10, 14));
    return parts.join("-");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAbha(e.target.value);
    setRawAbha(formatted);
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digitsOnly = rawAbha.replace(/[^0-9]/g, "");
    if (digitsOnly.length !== 14) {
      setError("Please enter a valid 14-digit ABHA number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Save ABHA to context
      setPatient((prev) => ({
        ...prev,
        abhaNumber: rawAbha,
      }));

      // Call OTP request
      await requestMobileOtp("9876548901");
      router.push("/patient/auth/verify-otp");
    } catch {
      setError("Unable to request OTP. Continuing in demo mode.");
      setTimeout(() => {
        router.push("/patient/auth/verify-otp");
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileContainer bgClassName="bg-[#F2F6F9]">
      {/* Top Header Row */}
      <header className="w-full pt-6 pb-2 px-6 flex items-center justify-between">
        <Link
          href="/"
          className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 transition shadow-2xs"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
        </Link>

        {/* Brand pill badge & audio helper row */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white py-1.5 px-3.5 rounded-full border border-slate-200/80 shadow-2xs">
            <div className="w-5 h-5 rounded-md bg-[#005E54] flex items-center justify-center text-white text-xs">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <span className="text-[11px] font-bold tracking-wider text-slate-800 uppercase">
              AAROGYAFLOW
            </span>
          </div>

          <AudioListenButton
            textToRead="Enter your 14-digit ABHA ID to continue. Your health information is protected and shared only with your permission."
          />
        </div>
      </header>

      {/* Main Content Form */}
      <section className="flex-1 px-6 pt-4 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Profile Avatar Icon */}
          <div className="w-12 h-12 rounded-xl bg-[#005E54] flex items-center justify-center text-white mb-5 shadow-sm">
            <User className="w-6 h-6 stroke-[1.8]" />
          </div>

          {/* Form Title & Subtitle */}
          <h1 className="text-[25px] sm:text-[27px] font-bold text-[#111C2E] tracking-tight leading-tight">
            Enter your ABHA ID
          </h1>
          <p className="text-[13.5px] text-[#64748B] mt-1.5 font-normal">
            Your 14-digit Ayushman Bharat Health Account number
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6">
            <div className="relative">
              <input
                id="abha-id"
                type="text"
                maxLength={17}
                value={rawAbha}
                onChange={handleInputChange}
                placeholder="14-2345-6789-0123"
                className="w-full bg-white border border-slate-200/90 rounded-2xl py-4 px-4 text-[16px] text-slate-800 placeholder-[#9AA8BC] tracking-wider focus:outline-none focus:ring-2 focus:ring-[#005E54]/20 focus:border-[#005E54] transition-all shadow-xs"
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-red-500 mt-2 px-1">
                {error}
              </p>
            )}

            {/* Privacy & Protection Disclaimer Card */}
            <div className="mt-3.5 bg-[#E6F8F5]/80 border border-[#B9EBE2]/60 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#005E54] shrink-0" />
              <p className="text-[11px] text-[#005E54] font-medium leading-tight">
                Your health information is protected and shared only with your permission.
              </p>
            </div>

            {/* Submit Button */}
            <div className="mt-7">
              <PrimaryButton
                type="submit"
                colorScheme="sage"
                isLoading={isLoading}
              >
                Continue
              </PrimaryButton>
            </div>
          </form>
        </div>

        {/* Footer Navigation */}
        <footer className="w-full pb-4 pt-6 mt-4">
          <div className="relative flex items-center justify-center mb-5">
            <div className="w-full border-t border-slate-300/80" />
            <span className="bg-[#F2F6F9] px-3.5 text-[13px] text-[#8E9BAE] absolute font-normal">
              or
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-[14px] text-[#64748B] font-normal mb-1">
              Don&apos;t have ABHA?
            </span>
            <button
              type="button"
              onClick={() => {
                setRawAbha("14-2345-6789-0123");
              }}
              className="inline-flex items-center gap-1 text-[16px] font-bold text-[#005E54] hover:text-[#004a42] transition-colors group cursor-pointer"
            >
              <span>Create ABHA ID</span>
              <ChevronRight className="w-4 h-4 stroke-[2.8] transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </footer>
      </section>
    </MobileContainer>
  );
}
