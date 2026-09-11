"use client";

interface ContinueButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  variant?: "primary" | "secondary" | "emergency";
}

export function ContinueButton({
  children,
  isLoading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
  variant = "primary",
}: ContinueButtonProps) {
  const baseClasses = [
    "w-full flex justify-center items-center gap-2",
    "py-4 px-6 rounded-[var(--radius-pill)] text-base font-bold text-white",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    className,
  ];

  const variantClasses = {
    primary: "bg-brand-700 hover:bg-brand-800 active:bg-brand-900 focus:ring-brand-700 shadow-[var(--shadow-clinical-md)]",
    secondary: "bg-white border border-clinical-border text-clinical-text hover:bg-clinical-hover focus:ring-brand-700 shadow-[var(--shadow-clinical-sm)]",
    emergency: "bg-status-redflag hover:bg-status-priority focus:ring-status-redflag shadow-[var(--shadow-clinical-md)]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={[...baseClasses, variantClasses[variant]].filter(Boolean).join(" ")}
    >
      {isLoading ? (
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
      ) : (
        children
      )}
    </button>
  );
}
