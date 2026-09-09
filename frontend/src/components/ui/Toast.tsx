"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export interface ToastProps {
  id: string;
  type?: "success" | "critical" | "info";
  message: string;
  onDismiss?: (id: string) => void;
}

export function Toast({
  id,
  type = "info",
  message,
  onDismiss,
}: ToastProps) {
  const styles = {
    info: "bg-white border-[#E2E8F0] text-[#0F172A]",
    success: "bg-white border-[#005F4B]/30 text-[#0F172A]",
    critical: "bg-[#FAECE9] border-[#C84B31]/30 text-[#0F172A]",
  };

  const icons = {
    info: <CheckCircle2 className="h-4 w-4 text-[#005F4B] shrink-0" />,
    success: <CheckCircle2 className="h-4 w-4 text-[#005F4B] shrink-0" />,
    critical: <AlertCircle className="h-4 w-4 text-[#C84B31] shrink-0" />,
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3.5 shadow-md text-sm transition-all",
        styles[type]
      )}
    >
      {icons[type]}
      <span className="text-xs font-medium flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={() => onDismiss(id)}
          className="text-[#94A3B8] hover:text-[#0F172A] p-0.5 rounded-md"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
