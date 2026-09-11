"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Calm subtle backdrop */}
      <div
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      {/* Dialog container */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xl animate-in zoom-in-95",
          className
        )}
      >
        <div className="flex items-start justify-between pb-3 border-b border-[#F1F5F9]">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-[#64748B] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}

export const Dialog = Modal;
