"use client";

import { forwardRef } from "react";

interface PillInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const PillInput = forwardRef<HTMLInputElement, PillInputProps>(
  ({ label, hint, error, leftIcon, rightIcon, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold text-clinical-text-secondary tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative rounded-[var(--radius-pill)] shadow-[var(--shadow-clinical-sm)]">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-clinical-muted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={[
              "block w-full pl-11 pr-4 py-3 text-sm font-mono tracking-wider",
              "bg-clinical-surface border border-clinical-border rounded-[var(--radius-pill)]",
              "text-clinical-text placeholder-clinical-muted",
              "focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10 transition duration-150",
              error && "border-status-redflag focus:border-status-redflag",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {hint && !error && (
          <p className="text-[11px] text-clinical-muted ml-1">{hint}</p>
        )}
        {error && (
          <p className="text-[11px] text-status-redflag font-medium ml-1">{error}</p>
        )}
      </div>
    );
  }
);

PillInput.displayName = "PillInput";
