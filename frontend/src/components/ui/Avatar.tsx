import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ name, size = "md", className, ...props }: AvatarProps) {
  const getInitials = (str: string) => {
    if (!str) return "AF";
    const parts = str.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-[#E6F4EA] font-bold text-[#005F4B] select-none border border-[#005F4B]/15",
        sizes[size],
        className
      )}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
}

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
}

export function Progress({ value, max = 100, className, ...props }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]",
        className
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...props}
    >
      <div
        className="h-full bg-[#005F4B] transition-all duration-300 ease-in-out rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
