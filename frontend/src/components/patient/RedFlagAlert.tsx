import React from "react";
import { AlertTriangle, Bell } from "lucide-react";
import { PrimaryButton } from "./PrimaryButton";

interface RedFlagAlertProps {
  reportedText: string;
  onAlertStaff: () => void;
  onBypass: () => void;
  isAlertSent?: boolean;
}

export function RedFlagAlert({
  reportedText,
  onAlertStaff,
  onBypass,
  isAlertSent = false,
}: RedFlagAlertProps) {
  return (
    <div className="flex-1 px-6 pt-8 pb-6 flex flex-col items-center justify-start text-center overflow-y-auto">
      {/* Warning Icon Badge */}
      <div className="w-16 h-16 rounded-full bg-[#FCECE9] flex items-center justify-center mb-5 shrink-0 shadow-2xs">
        <AlertTriangle className="w-8 h-8 text-[#A84234] stroke-[2]" />
      </div>

      {/* Main Heading */}
      <h2 className="text-xl font-bold text-[#1E293B] mb-2 tracking-tight">
        Please wait
      </h2>

      {/* Primary Red Flag Alert Text */}
      <p className="text-[14px] leading-snug font-bold text-[#A84234] px-3 mb-2">
        Your symptoms may need immediate medical attention.
      </p>

      {/* Sub-guidance informative copy */}
      <p className="text-xs text-slate-500 max-w-[280px] leading-relaxed mb-6 font-normal">
        Please contact hospital staff now. Do not continue through the normal queue.
      </p>

      {/* Trigger Reason Box */}
      <section className="w-full bg-[#FCF3F1] border border-[#F6DED9] rounded-2xl p-4 text-left mb-6 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-900 mb-1">
          What triggered this alert
        </h3>
        <p className="text-[12px] text-slate-600 leading-normal">
          Patient reported:{" "}
          <span className="italic font-medium text-slate-800">
            &ldquo;{reportedText || "Severe chest pain and difficulty breathing."}&rdquo;
          </span>
        </p>
      </section>

      {/* Alert Status or Button */}
      {isAlertSent ? (
        <div className="w-full py-3.5 px-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold mb-4">
          ✓ Hospital nursing staff has been alerted. Please stay seated.
        </div>
      ) : (
        <PrimaryButton
          colorScheme="danger"
          onClick={onAlertStaff}
          className="mb-4"
        >
          <Bell className="w-4 h-4 text-white fill-none stroke-[2]" />
          <span>Alert hospital staff</span>
        </PrimaryButton>
      )}

      {/* Secondary Bypass Link */}
      <button
        type="button"
        onClick={onBypass}
        className="text-xs font-normal text-slate-400 hover:text-slate-600 transition-colors py-2 cursor-pointer"
      >
        My symptoms are not urgent — continue
      </button>
    </div>
  );
}
