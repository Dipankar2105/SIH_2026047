import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: boolean;
  errorMessage?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, errorMessage, id, ...props }, ref) => {
    const selectId = id || React.useId();
    const hasError = Boolean(error || errorMessage);

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-[#475569] uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "flex h-11 w-full appearance-none rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 pr-10 text-sm text-[#0F172A] transition-colors cursor-pointer",
              "focus:border-[#005F4B] focus:outline-none focus:ring-2 focus:ring-[#005F4B]/20",
              "disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:opacity-60",
              hasError && "border-[#C84B31] focus:border-[#C84B31] focus:ring-[#C84B31]/20",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {hasError && errorMessage && (
          <span className="text-xs font-medium text-[#C84B31]">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
