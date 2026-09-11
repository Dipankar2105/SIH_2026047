"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { Volume2, VolumeX } from "lucide-react";
import { usePatient } from "@/context/PatientContext";

interface AudioListenButtonProps {
  textToRead?: string;
  variant?: "header" | "pill" | "iconOnly";
  className?: string;
}

export function AudioListenButton({
  textToRead = "AarogyaFlow Health Assistant",
  variant = "header",
  className,
}: AudioListenButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { language } = usePatient();

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    // Map supported language to BCP 47 language tag
    const langMap: Record<string, string> = {
      en: "en-IN",
      hi: "hi-IN",
      mr: "mr-IN",
      ta: "ta-IN",
      te: "te-IN",
      kn: "kn-IN",
      bn: "bn-IN",
    };
    utterance.lang = langMap[language] || "en-IN";
    utterance.rate = 0.95;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleSpeak}
        aria-label="Listen to message audio"
        className={clsx(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors",
          isPlaying
            ? "bg-[#005F4B] text-white animate-pulse"
            : "bg-emerald-50 text-[#005F4B] hover:bg-emerald-100/80 border border-emerald-200/60",
          className
        )}
      >
        {isPlaying ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
        <span>{isPlaying ? "Stop" : "Listen"}</span>
      </button>
    );
  }

  if (variant === "iconOnly") {
    return (
      <button
        type="button"
        onClick={handleSpeak}
        aria-label="Listen audio"
        className={clsx(
          "p-1.5 text-slate-600 hover:text-slate-900 transition-colors focus:outline-none rounded-lg",
          isPlaying && "text-[#005F4B] animate-pulse",
          className
        )}
      >
        {isPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    );
  }

  // Header / default variant
  return (
    <button
      type="button"
      onClick={handleSpeak}
      aria-label="Listen to screen content"
      className={clsx(
        "bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80 flex flex-col items-center justify-center transition-colors shadow-2xs hover:bg-slate-50",
        isPlaying && "border-[#005F4B] ring-2 ring-[#005F4B]/20 text-[#005F4B]",
        className
      )}
    >
      {isPlaying ? (
        <VolumeX className="w-4 h-4 text-[#005F4B] mb-0.5" />
      ) : (
        <Volume2 className="w-4 h-4 text-slate-600 mb-0.5" />
      )}
      <span className="text-[10px] text-slate-500 font-medium leading-none">
        {isPlaying ? "Stop" : "Listen"}
      </span>
    </button>
  );
}
