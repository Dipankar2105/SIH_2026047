"use client";

interface CheckboxProps {
  id: string;
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({
  id,
  label,
  checked = false,
  onChange,
  disabled = false,
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="relative flex items-center gap-2.5 cursor-pointer select-none"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        className="peer sr-only"
      />
      <div
        className={[
          "w-6 h-6 rounded-lg bg-clinical-surface border border-clinical-border",
          "flex items-center justify-center transition-all duration-150",
          "peer-checked:bg-brand-700 peer-checked:border-brand-700 shadow-[var(--shadow-clinical-sm)]",
          "peer-focus:ring-2 peer-focus:ring-brand-700 peer-focus:ring-offset-1",
          disabled && "opacity-50 cursor-not-allowed",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <svg
          className="w-3.5 h-3.5 text-white stroke-[3.5] stroke-current fill-none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <span className="text-xs sm:text-sm font-medium text-clinical-text-secondary">
        {label}
      </span>
    </label>
  );
}
