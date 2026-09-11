import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] transition-colors",
          "focus:border-[#005F4B] focus:outline-none focus:ring-2 focus:ring-[#005F4B]/20",
          "disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:opacity-60",
          error && "border-[#C84B31] focus:border-[#C84B31] focus:ring-[#C84B31]/20",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface TextFieldProps extends InputProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, helperText, errorMessage, error, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const hasError = Boolean(error || errorMessage);

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-[#475569] uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <Input ref={ref} id={inputId} error={hasError} {...props} />
        {hasError && errorMessage ? (
          <span className="text-xs font-medium text-[#C84B31]">
            {errorMessage}
          </span>
        ) : helperText ? (
          <span className="text-xs text-[#94A3B8]">{helperText}</span>
        ) : null}
      </div>
    );
  }
);
TextField.displayName = "TextField";
