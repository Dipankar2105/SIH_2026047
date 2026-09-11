import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "critical" | "outline" | "neutral";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-[#E6F4EA] text-[#005F4B] border border-[#005F4B]/20",
    secondary: "bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]",
    critical: "bg-[#FAECE9] text-[#C84B31] border border-[#C84B31]/30 font-semibold",
    outline: "bg-transparent text-[#0F172A] border border-[#CBD5E1]",
    neutral: "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export interface StatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: "normal" | "urgent" | "critical" | "waiting" | "completed";
  label?: string;
}

export function StatusChip({ status, label, className, ...props }: StatusChipProps) {
  const statusConfig = {
    normal: {
      bg: "bg-[#E6F4EA]",
      text: "text-[#005F4B]",
      dot: "bg-[#005F4B]",
      defaultLabel: "Normal",
    },
    urgent: {
      bg: "bg-[#FEF3C7]",
      text: "text-[#92400E]",
      dot: "bg-[#D97706]",
      defaultLabel: "Urgent",
    },
    critical: {
      bg: "bg-[#FAECE9]",
      text: "text-[#C84B31]",
      dot: "bg-[#C84B31] animate-pulse",
      defaultLabel: "Critical Triage",
    },
    waiting: {
      bg: "bg-[#F1F5F9]",
      text: "text-[#475569]",
      dot: "bg-[#94A3B8]",
      defaultLabel: "In Waiting",
    },
    completed: {
      bg: "bg-[#E6F4EA]",
      text: "text-[#005F4B]",
      dot: "bg-[#005F4B]",
      defaultLabel: "Completed",
    },
  };

  const config = statusConfig[status] || statusConfig.normal;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold select-none border border-black/5",
        config.bg,
        config.text,
        className
      )}
      {...props}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {label || config.defaultLabel}
    </span>
  );
}
