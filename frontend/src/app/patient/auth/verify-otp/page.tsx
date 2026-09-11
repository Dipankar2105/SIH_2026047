"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Smartphone } from "lucide-react";
import { MobileContainer } from "@/components/patient/MobileContainer";
import { OtpInputGrid } from "@/components/patient/OtpInputGrid";
import { PrimaryButton } from "@/components/patient/PrimaryButton";
import { usePatient } from "@/context/PatientContext";
import { verifyMobileOtp } from "@/lib/api/patientApi";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { patient, setPatient } = usePatient();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleVerify = async (enteredOtp?: string) => {
    const code = enteredOtp || otp;
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await verifyMobileOtp("mock-txn", code, patient.id);
      if (res.success) {
        setPatient((prev) => ({
          ...prev,
          isAbhaVerified: true,
        }));
        router.push("/patient/auth/consent");
      } else {
        setError("Invalid OTP code. Please try again.");
      }
    } catch {
      // Demo fallback
      router.push("/patient/auth/consent");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    setError("");
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <MobileContainer bgClassName="bg-gradient-to-b from-[#EBF2F7] via-[#EEF4F9] to-[#F1F5F9]">
      {/* Top Header */}
      <header className="w-full pt-6 pb-2 px-6 flex items-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#0A5645] hover:text-[#063b2f] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back</span>
        </button>
      </header>

      {/* Main Content */}
      <section className="flex-1 px-6 pt-4 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Badge Icon */}
          <div className="w-12 h-12 rounded-[14px] bg-[#0A5645] flex items-center justify-center text-white shadow-sm mb-5">
            <Smartphone className="w-6 h-6 stroke-[1.8]" />
          </div>

          {/* Typography */}
          <h1 className="text-[26px] sm:text-[27px] font-bold text-[#192231] tracking-tight leading-snug">
            Verify your mobile number
          </h1>
          <p className="text-[14px] text-[#556575] mt-1.5 font-normal">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-[#293845] whitespace-nowrap">
              +91 ••••••8901
            </span>
          </p>

          {/* OTP Grid Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="mt-6"
          >
            <OtpInputGrid
              length={6}
              value={otp}
              onChange={(val) => {
                setOtp(val);
                if (error) setError("");
              }}
              onComplete={(val) => handleVerify(val)}
              disabled={isLoading}
            />

            {error && (
              <p className="text-xs font-medium text-red-500 mt-2 px-1 text-center">
                {error}
              </p>
            )}

            <p className="text-[13px] text-[#6E7F91] mt-3 font-normal leading-normal">
              Enter each digit or paste the full code
            </p>

            {/* Actions Stack */}
            <div className="mt-8 space-y-3.5">
              <PrimaryButton
                type="submit"
                colorScheme="emerald"
                isLoading={isLoading}
                disabled={otp.length !== 6}
              >
                Verify
              </PrimaryButton>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="text-[#0B5C4D] hover:text-[#073D33] font-semibold text-[14px] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {resendCooldown > 0
                    ? `Resend OTP in ${resendCooldown}s`
                    : "Resend OTP"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Quick Demo Helper Hint */}
        <div className="text-center py-4">
          <button
            type="button"
            onClick={() => {
              setOtp("123456");
              handleVerify("123456");
            }}
            className="text-[11px] text-slate-400 hover:text-slate-600 underline"
          >
            Auto-fill demo OTP (123456)
          </button>
        </div>
      </section>
    </MobileContainer>
  );
}
