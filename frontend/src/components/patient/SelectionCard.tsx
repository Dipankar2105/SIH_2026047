import React from "react";
import clsx from "clsx";

interface SelectionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  isSelected?: boolean;
  onClick: () => void;
  className?: string;
}

export function SelectionCard({
  title,
  description,
  icon,
  iconBgColor = "bg-[#eff5f5]",
  isSelected = false,
  onClick,
  className,
}: SelectionCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={clsx(
        "group relative flex items-center p-4 bg-white rounded-2xl border transition-all duration-150 cursor-pointer text-left",
        isSelected
          ? "border-[#015C53] ring-2 ring-[#015C53]/20 shadow-md"
          : "border-slate-200/90 shadow-2xs hover:border-[#015C53]/40 hover:shadow-sm active:scale-[0.99]",
        className
      )}
    >
      {/* Illustration Box */}
      <div
        className={clsx(
          "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 mr-4 p-2 transition-transform group-hover:scale-105",
          iconBgColor
        )}
      >
        {icon}
      </div>

      {/* Option Text Details */}
      <div className="flex-1 pr-2">
        <h2 className="text-[17px] font-bold text-[#142337] tracking-tight mb-0.5 leading-snug">
          {title}
        </h2>
        <p className="text-[13px] text-[#6d7c92] font-normal leading-tight">
          {description}
        </p>
      </div>
    </div>
  );
}
