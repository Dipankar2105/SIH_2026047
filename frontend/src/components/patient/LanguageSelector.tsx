"use client";

import React, { useState } from "react";
import { Globe } from "lucide-react";
import { usePatient } from "@/context/PatientContext";
import { LanguageModal } from "./LanguageModal";
import clsx from "clsx";

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { language } = usePatient();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        aria-label="Select Language"
        className={clsx(
          "flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-gray-300",
          "bg-white/90 hover:bg-white text-gray-700 text-xs font-semibold shadow-2xs transition-all active:scale-95",
          className
        )}
      >
        <Globe className="w-3.5 h-3.5 text-gray-500" />
        <span className="uppercase tracking-wider">{language}</span>
      </button>

      <LanguageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
