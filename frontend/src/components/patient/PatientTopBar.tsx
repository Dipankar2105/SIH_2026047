"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { AudioListenButton } from "./AudioListenButton";
import clsx from "clsx";

interface PatientTopBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  onBack?: () => void;
  showBrand?: boolean;
  showLanguage?: boolean;
  showAudio?: boolean;
  textToRead?: string;
  className?: string;
}

export function PatientTopBar({
  title = "AarogyaFlow",
  subtitle,
  showBack = false,
  backHref,
  onBack,
  showBrand = true,
  showLanguage = true,
  showAudio = true,
  textToRead,
  className,
}: PatientTopBarProps) {
  const router = useRouter();

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header
      className={clsx(
        "w-full px-4 pt-4 pb-3 flex items-center justify-between border-b border-slate-100/80 bg-white/90 backdrop-blur-xs sticky top-0 z-30 shrink-0",
        className
      )}
    >
      {/* Left side: Back Button OR Brand Logo & Title */}
      <div className="flex items-center gap-2.5">
        {showBack && (
          <button
            type="button"
            onClick={handleBackClick}
            aria-label="Go back"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        {showBrand && (
          <Link href="/patient" className="flex items-center gap-2 group">
            {/* Medical loop glyph */}
            <div className="w-7 h-7 rounded-lg bg-[#005F4B] flex items-center justify-center text-white shadow-2xs">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
                <path d="M9 12.5v4.5a3 3 0 0 0 6 0v-1" />
                <circle cx="15" cy="14" r="2" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[16px] tracking-tight text-[#111C2E] leading-tight">
                {title}
              </span>
              {subtitle && (
                <span className="text-[10px] font-medium text-[#0A735E] leading-none">
                  {subtitle}
                </span>
              )}
            </div>
          </Link>
        )}

        {!showBrand && (
          <h1 className="text-[17px] font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
        )}
      </div>

      {/* Right side: Language Pill & Audio Narration */}
      <div className="flex items-center gap-2">
        {showLanguage && <LanguageSelector />}
        {showAudio && (
          <AudioListenButton
            variant="iconOnly"
            textToRead={textToRead || `${title} ${subtitle || ""}`}
          />
        )}
      </div>
    </header>
  );
}
