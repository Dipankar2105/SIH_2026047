import React from "react";
import clsx from "clsx";

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  bgClassName?: string;
  showHomeIndicator?: boolean;
}

export function MobileContainer({
  children,
  className,
  bgClassName = "bg-[#F2F6F9]",
  showHomeIndicator = true,
}: MobileContainerProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-0 sm:p-4 bg-slate-200/80 antialiased font-sans selection:bg-teal-100">
      <main
        className={clsx(
          "w-full max-w-[420px] min-h-screen sm:min-h-[860px] sm:max-h-[920px]",
          "sm:rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col justify-between",
          "sm:border sm:border-slate-200/60",
          bgClassName,
          className
        )}
      >
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {showHomeIndicator && (
          <div
            aria-hidden="true"
            className="w-full flex justify-center py-2 shrink-0 bg-inherit pointer-events-none"
          >
            <div className="w-32 h-1 bg-slate-300/50 rounded-full" />
          </div>
        )}
      </main>
    </div>
  );
}
