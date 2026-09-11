import React from "react";
import clsx from "clsx";
import { AudioListenButton } from "./AudioListenButton";

interface ChatBubbleProps {
  sender: "bot" | "user" | "system";
  text: string;
  timestamp?: string;
  isAudioAvailable?: boolean;
  className?: string;
}

export function ChatBubble({
  sender,
  text,
  timestamp,
  isAudioAvailable = false,
  className,
}: ChatBubbleProps) {
  if (sender === "user") {
    return (
      <div className={clsx("flex flex-col items-end my-1 max-w-[82%] ml-auto", className)}>
        <div className="bg-[#005F4B] text-white text-[14px] font-normal px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-xs tracking-tight leading-relaxed">
          {text}
        </div>
        {timestamp && (
          <span className="text-[10px] text-slate-400 mt-0.5 px-1">{timestamp}</span>
        )}
      </div>
    );
  }

  if (sender === "system") {
    return (
      <div className={clsx("flex justify-center my-2", className)}>
        <span className="text-xs text-slate-500 bg-slate-100/90 px-3 py-1 rounded-full text-center">
          {text}
        </span>
      </div>
    );
  }

  // Bot bubble
  return (
    <div className={clsx("flex flex-col items-start my-1 max-w-[88%] mr-auto", className)}>
      <div className="bg-[#F4FAF8] border border-[#E6F4F1] text-slate-800 text-[14px] px-4 py-3 rounded-2xl rounded-tl-xs shadow-2xs leading-relaxed">
        <div className="flex items-start justify-between gap-3">
          <p className="text-slate-800 leading-normal flex-1">{text}</p>
          {isAudioAvailable && (
            <AudioListenButton variant="pill" textToRead={text} />
          )}
        </div>
      </div>
      {timestamp && (
        <span className="text-[10px] text-slate-400 mt-0.5 px-1">{timestamp}</span>
      )}
    </div>
  );
}
