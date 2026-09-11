"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BackButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  onBack?: () => void;
}

export function BackButton({
  label = "Back",
  onBack,
  className,
  ...props
}: BackButtonProps) {
  const handleClick = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#005F4B] transition-colors select-none py-1 px-2 rounded-lg hover:bg-[#F1F5F9]",
        className
      )}
      {...props}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      <span>{label}</span>
    </button>
  );
}
