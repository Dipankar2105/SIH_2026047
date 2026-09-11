import React from "react";
import clsx from "clsx";

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  colorScheme?: "brand" | "sage" | "danger" | "emerald";
  children: React.ReactNode;
}

export function PrimaryButton({
  children,
  isLoading = false,
  colorScheme = "brand",
  className,
  disabled,
  ...props
}: PrimaryButtonProps) {
  const colorClasses = {
    brand: "bg-[#005F4B] hover:bg-[#004D3D] active:bg-[#00382C] text-white shadow-sm",
    sage: "bg-[#5D8E84] hover:bg-[#528278] active:bg-[#47736A] text-white shadow-sm",
    emerald: "bg-[#618D83] hover:bg-[#527a71] active:bg-[#466a62] text-white shadow-sm",
    danger: "bg-[#B25344] hover:bg-[#9E4537] active:bg-[#8B3B2F] text-white shadow-sm",
  }[colorScheme];

  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        "w-full h-[52px] rounded-2xl font-semibold text-[15px] sm:text-[16px]",
        "flex items-center justify-center gap-2 transition-all active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#005F4B]/30",
        "disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
        colorClasses,
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
