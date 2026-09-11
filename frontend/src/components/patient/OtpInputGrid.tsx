"use client";

import React, { useRef, useState, useEffect } from "react";
import clsx from "clsx";

interface OtpInputGridProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
}

export function OtpInputGrid({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
}: OtpInputGridProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));

  useEffect(() => {
    const chars = value.split("").slice(0, length);
    const newDigits = Array(length).fill("");
    chars.forEach((c, i) => {
      newDigits[i] = c;
    });
    setDigits(newDigits);
  }, [value, length]);

  const handleChange = (index: number, val: string) => {
    // Only accept numbers
    const cleanVal = val.replace(/[^0-9]/g, "");
    if (!cleanVal) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setDigits(nextDigits);
      onChange(nextDigits.join(""));
      return;
    }

    const lastChar = cleanVal.slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = lastChar;
    setDigits(nextDigits);
    const fullOtp = nextDigits.join("");
    onChange(fullOtp);

    // Auto-advance
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (fullOtp.length === length && onComplete) {
      onComplete(fullOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, length);
    if (!pasted) return;

    const nextDigits = Array(length).fill("");
    pasted.split("").forEach((char, idx) => {
      nextDigits[idx] = char;
    });
    setDigits(nextDigits);
    const fullOtp = nextDigits.join("");
    onChange(fullOtp);

    const focusIdx = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIdx]?.focus();

    if (fullOtp.length === length && onComplete) {
      onComplete(fullOtp);
    }
  };

  return (
    <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoFocus={idx === 0}
          disabled={disabled}
          value={digit}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${idx + 1}`}
          className={clsx(
            "w-full aspect-square text-center text-xl font-bold rounded-2xl transition-all",
            "bg-white text-slate-800 border shadow-[0_2px_4px_rgba(0,0,0,0.02)]",
            "caret-[#0A5645] focus:outline-none focus:ring-2 focus:ring-[#0A5645]/30 focus:border-[#0A5645]",
            digit ? "border-[#0A5645]/40" : "border-[#D9E2EC]/90"
          )}
        />
      ))}
    </div>
  );
}
