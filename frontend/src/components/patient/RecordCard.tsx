import React from "react";
import { ChevronRight, FileText, Activity, Pill, ShieldCheck } from "lucide-react";
import { HealthRecord } from "@/types/patient";
import clsx from "clsx";

interface RecordCardProps {
  record: HealthRecord;
  onClick?: () => void;
}

export function RecordCard({ record, onClick }: RecordCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Lab Report":
        return <Activity className="w-5 h-5 text-emerald-700" />;
      case "Prescription":
        return <Pill className="w-5 h-5 text-emerald-700" />;
      case "Discharge Summary":
        return <ShieldCheck className="w-5 h-5 text-emerald-700" />;
      default:
        return <FileText className="w-5 h-5 text-emerald-700" />;
    }
  };

  const isFromAbha = record.source === "From ABHA";

  return (
    <article
      onClick={onClick}
      className={clsx(
        "w-full bg-white border border-slate-100 rounded-2xl p-3.5 shadow-2xs",
        "flex items-center justify-between hover:border-slate-300/80 transition-all cursor-pointer group"
      )}
    >
      <div className="flex items-center space-x-3 min-w-0">
        {/* Category Icon Badge */}
        <div className="w-10 h-10 rounded-xl bg-emerald-50/80 flex items-center justify-center shrink-0">
          {getCategoryIcon(record.category)}
        </div>

        {/* Labels & Tags */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-bold text-slate-800 leading-snug truncate">
              {record.title}
            </h3>
            <span
              className={clsx(
                "text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0",
                isFromAbha
                  ? "bg-[#EBF4FE] text-[#1D63B8]"
                  : "bg-[#EAF6F0] text-[#007B55]"
              )}
            >
              {record.source}
            </span>
          </div>

          <p className="text-[12px] text-slate-500 leading-tight mt-0.5 truncate">
            {record.provider} · {record.date}
          </p>
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 ml-2" />
    </article>
  );
}
