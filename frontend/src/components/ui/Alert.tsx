import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "critical" | "success";
  title?: string;
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  ...props
}: AlertProps) {
  const variants = {
    info: {
      container: "bg-[#E6F4EA] border-[#005F4B]/20 text-[#005F4B]",
      icon: <Info className="h-5 w-5 text-[#005F4B] shrink-0" />,
      titleColor: "text-[#005F4B]",
    },
    critical: {
      container: "bg-[#FAECE9] border-[#C84B31]/30 text-[#0F172A]",
      icon: <AlertCircle className="h-5 w-5 text-[#C84B31] shrink-0" />,
      titleColor: "text-[#C84B31]",
    },
    success: {
      container: "bg-[#E6F4EA] border-[#005F4B]/30 text-[#005F4B]",
      icon: <CheckCircle2 className="h-5 w-5 text-[#005F4B] shrink-0" />,
      titleColor: "text-[#005F4B]",
    },
  };

  const current = variants[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-xl border p-4 text-sm shadow-sm",
        current.container,
        className
      )}
      {...props}
    >
      {current.icon}
      <div className="flex flex-col gap-0.5">
        {title && (
          <h5 className={cn("font-bold tracking-tight text-sm", current.titleColor)}>
            {title}
          </h5>
        )}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
