"use client";

import React from "react";
import { Check, X, Globe } from "lucide-react";
import { usePatient } from "@/context/PatientContext";
import { SUPPORTED_LANGUAGES } from "@/data/patientMockData";
import { SupportedLanguage } from "@/types/patient";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const { language, setLanguage } = usePatient();

  if (!isOpen) return null;

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
          <div className="flex items-center gap-2 text-slate-800">
            <Globe className="w-5 h-5 text-[#005F4B]" />
            <h2 id="lang-modal-title" className="text-[16px] font-bold">
              Choose Language / भाषा चुनें
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5 max-h-[360px] overflow-y-auto pt-1">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all ${
                  isSelected
                    ? "bg-[#E6F4EA] text-[#005F4B] font-bold border border-[#005F4B]/30"
                    : "hover:bg-slate-50 text-slate-700 font-medium"
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm leading-tight">{lang.nativeName}</span>
                  <span className="text-xs text-slate-400 leading-tight">
                    {lang.name}
                  </span>
                </div>
                {isSelected && <Check className="w-5 h-5 text-[#005F4B]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
