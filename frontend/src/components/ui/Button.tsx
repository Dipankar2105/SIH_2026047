import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "critical";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005F4B] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none";

    const variants = {
      primary:
        "bg-[#005F4B] text-white hover:bg-[#004D3D] shadow-sm active:bg-[#003B2E]",
      secondary:
        "bg-[#E6F4EA] text-[#005F4B] hover:bg-[#D5EEDC] active:bg-[#C4E8CD]",
      outline:
        "border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] shadow-sm",
      ghost:
        "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]",
      critical:
        "bg-[#C84B31] text-white hover:bg-[#B33E26] shadow-sm active:bg-[#9B321D]",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs gap-1.5 min-h-[36px]",
      md: "h-11 px-5 text-sm gap-2 min-h-[44px]", // Accessible 44px touch target
      lg: "h-12 px-6 text-base gap-2.5 min-h-[48px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
