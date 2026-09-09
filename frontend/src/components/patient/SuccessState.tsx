import React from "react";
import { Check, Shield } from "lucide-react";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

interface SuccessStateProps {
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  tokenNumber?: string;
  estimatedWaitMin?: number;
  infoMessage?: string;
  primaryActionLabel?: string;
  onPrimaryAction: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction: () => void;
}

export function SuccessState({
  title,
  subtitle,
  badgeLabel,
  tokenNumber,
  estimatedWaitMin,
  infoMessage = "Your information has been stored securely and can only be accessed with your permission.",
  primaryActionLabel = "View My Health Records",
  onPrimaryAction,
  secondaryActionLabel = "Back to Home",
  onSecondaryAction,
}: SuccessStateProps) {
  return (
    <div className="flex-1 px-6 pt-10 pb-6 flex flex-col justify-between items-center text-center overflow-y-auto">
      <div className="flex flex-col items-center w-full max-w-xs">
        {/* Big Circular Success Graphic */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#E5F5EF] flex items-center justify-center mb-6 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#006B52] flex items-center justify-center text-white">
            <Check className="w-7 h-7 stroke-[3]" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-tight mb-2">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-[14px] sm:text-[15px] text-slate-600 font-normal leading-relaxed mb-6">
            {subtitle}
          </p>
        )}

        {/* Optional Token & Wait Time Metric Card (Screen 19) */}
        {tokenNumber !== undefined && (
          <div className="w-full grid grid-cols-2 gap-3 bg-[#F9FAFB] border border-slate-200/80 rounded-2xl p-4 mb-6 text-center shadow-2xs">
            <div className="flex flex-col items-center border-r border-slate-200/60 pr-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                {badgeLabel || "APPOINTMENT"}
              </span>
              <span className="text-[34px] font-bold text-[#006D5B] leading-none my-1">
                {tokenNumber}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Your number
              </span>
            </div>

            <div className="flex flex-col items-center pl-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                WAIT TIME
              </span>
              <span className="text-[34px] font-bold text-[#006D5B] leading-none my-1">
                {estimatedWaitMin ?? 15}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                minutes est.
              </span>
            </div>
          </div>
        )}

        {/* Security Reassurance Card */}
        {infoMessage && (
          <div className="w-full bg-[#F4FAF8] border border-[#E6F4F1] rounded-2xl p-3.5 text-left flex items-start gap-2.5 mb-6">
            <Shield className="w-4 h-4 text-[#006B52] shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-slate-600 leading-snug">
              {infoMessage}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="w-full space-y-3 pt-4">
        <PrimaryButton onClick={onPrimaryAction}>
          {primaryActionLabel}
        </PrimaryButton>
        <SecondaryButton onClick={onSecondaryAction}>
          {secondaryActionLabel}
        </SecondaryButton>
      </div>
    </div>
  );
}
