import React from "react";
import clsx from "clsx";

interface ChipButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  isSelected?: boolean;
  onSelect?: () => void;
  size?: "sm" | "md";
}

export function ChipButton({
  label,
  isSelected = false,
  onSelect,
  size = "md",
  disabled,
  className,
  ...props
}: ChipButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-[12px]",
    md: "px-4 py-2.5 text-[13.5px]",
  }[size];

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={clsx(
        "rounded-2xl font-medium transition-all text-center focus:outline-none focus:ring-2 focus:ring-[#005F4B]/20 active:scale-95 cursor-pointer",
        sizeClasses,
        isSelected
          ? "bg-[#005F4B] text-white border border-[#005F4B] shadow-2xs"
          : "bg-white text-[#005F4B] border border-[#2A9D8F]/30 hover:bg-[#E6F4F1]/70 hover:border-[#005F4B]/50",
        disabled && "opacity-50 cursor-not-allowed active:scale-100",
        className
      )}
      {...props}
    >
      {label}
    </button>
  );
}

interface ChipButtonGroupProps {
  chips: string[];
  selectedChip?: string | null;
  onSelectChip: (chip: string) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function ChipButtonGroup({
  chips,
  selectedChip,
  onSelectChip,
  disabled = false,
  className,
  size = "md",
}: ChipButtonGroupProps) {
  return (
    <div className={clsx("flex flex-wrap gap-2 pt-1", className)}>
      {chips.map((chip) => (
        <ChipButton
          key={chip}
          label={chip}
          size={size}
          isSelected={selectedChip === chip}
          onSelect={() => onSelectChip(chip)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
