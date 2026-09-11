import React from "react";
import { Camera, Folder, CheckCircle, Trash2, FileText } from "lucide-react";
import clsx from "clsx";

interface UploadOptionCardProps {
  title: string;
  subtitle: string;
  type: "camera" | "gallery";
  onClick: () => void;
  disabled?: boolean;
}

export function UploadOptionCard({
  title,
  subtitle,
  type,
  onClick,
  disabled = false,
}: UploadOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-[#005F4B]/50 hover:shadow-xs transition-all active:scale-[0.99] text-left cursor-pointer disabled:opacity-50"
    >
      <div className="w-12 h-12 rounded-xl bg-[#E6F4F1] flex items-center justify-center text-[#005F4B] shrink-0 mr-4">
        {type === "camera" ? (
          <Camera className="w-6 h-6 stroke-[1.8]" />
        ) : (
          <Folder className="w-6 h-6 stroke-[1.8]" />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-[15px] font-bold text-slate-800 leading-snug">
          {title}
        </span>
        <span className="text-[12px] text-slate-500 font-normal mt-0.5">
          {subtitle}
        </span>
      </div>
    </button>
  );
}

interface UploadedFileCardProps {
  fileName: string;
  category?: string;
  fileSize?: string;
  onRemove: () => void;
  className?: string;
}

export function UploadedFileCard({
  fileName,
  category,
  fileSize,
  onRemove,
  className,
}: UploadedFileCardProps) {
  return (
    <div
      className={clsx(
        "w-full flex items-center justify-between p-3.5 rounded-2xl border",
        "bg-[#E8F6F3] border-[#D2EBE6] shadow-2xs transition-all",
        className
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Document Icon with success check */}
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#005F4B] shadow-2xs shrink-0 relative">
          <FileText className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full">
            <CheckCircle className="w-3.5 h-3.5 fill-emerald-500 text-white" />
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-col min-w-0">
          <span className="text-[14px] font-bold text-slate-800 truncate">
            {fileName}
          </span>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            {category && <span className="font-medium text-[#005F4B]">{category}</span>}
            {fileSize && <span>• {fileSize}</span>}
            <span className="text-emerald-700 font-medium">Ready</span>
          </div>
        </div>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove attached file"
        className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-white/80 transition active:scale-95 cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
