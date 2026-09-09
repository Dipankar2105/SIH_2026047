"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Lock } from "lucide-react";
import clsx from "clsx";

interface ChatInputBarProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInputBar({
  onSendMessage,
  disabled = false,
  placeholder = "Speak or type • Your responses are private",
  className,
}: ChatInputBarProps) {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech Recognition if supported
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-IN";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported in this browser environment.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed);
    setInputText("");
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div
      className={clsx(
        "w-full bg-white border-t border-slate-100 px-4 pt-3 pb-2 flex flex-col gap-1.5 shrink-0 z-20",
        className
      )}
    >
      <form onSubmit={handleSend} className="flex items-center gap-2">
        {/* Microphone Voice Button */}
        <button
          type="button"
          onClick={toggleMic}
          aria-label={isListening ? "Stop voice listening" : "Start voice speech input"}
          className={clsx(
            "w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 shadow-xs cursor-pointer",
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-[#005F4B] hover:bg-[#004D3D] text-white"
          )}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Input */}
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={disabled}
            placeholder={isListening ? "Listening... speak now" : placeholder}
            className="w-full bg-[#F8FAFC] border border-slate-200/90 rounded-2xl py-3 pl-4 pr-11 text-[14px] text-slate-800 placeholder-[#9AA8BC] focus:outline-none focus:ring-2 focus:ring-[#005F4B]/20 focus:border-[#005F4B] transition-all"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={disabled || !inputText.trim()}
            aria-label="Send message"
            className="absolute right-1.5 w-8 h-8 rounded-xl bg-transparent hover:bg-emerald-50 text-[#005F4B] flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <Send className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </form>

      {/* Privacy disclaimer row */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 py-0.5">
        <Lock className="w-3 h-3 text-[#005F4B]" />
        <span>Speak or type • Your responses are private</span>
      </div>
    </div>
  );
}
