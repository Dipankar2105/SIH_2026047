import React from "react";
import clsx from "clsx";

interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "outline";
  children: React.ReactNode;
}

export function SecondaryButton({
  children,
  variant = "ghost",
  className,
  ...props
}: SecondaryButtonProps) {
  const variantClasses = {
    ghost: "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60",
    outline: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs",
  }[variant];

  return (
    <button
      className={clsx(
        "w-full py-3 px-4 rounded-2xl font-medium text-[14px] sm:text-[15px]",
        "flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] focus:outline-none cursor-pointer",
        variantClasses,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
