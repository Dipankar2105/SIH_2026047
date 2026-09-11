import React from "react";
import { Clock } from "lucide-react";
import { AppointmentItem } from "@/types/patient";

interface TokenCounterCardProps {
  department: string;
  hospitalName: string;
  doctorName: string;
  appointmentTime: string;
  tokenNumber: string;
  estimatedWaitMin: number;
}

export function TokenCounterCard({
  department,
  hospitalName,
  doctorName,
  appointmentTime,
  tokenNumber,
  estimatedWaitMin,
}: TokenCounterCardProps) {
  return (
    <article className="w-full bg-[#006C59] rounded-[24px] p-5 text-white shadow-sm flex flex-col justify-between relative overflow-hidden">
      {/* Top Row: Department, Hospital info & Token Pill */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col pr-2">
          {/* Department badge with cross */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-[2px] relative flex items-center justify-center">
              <span className="w-1.5 h-[2px] bg-[#006C59] absolute" />
              <span className="h-1.5 w-[2px] bg-[#006C59] absolute" />
            </span>
            <span className="text-[10px] tracking-wider uppercase font-bold text-emerald-200">
              {department}
            </span>
          </div>

          <h3 className="text-[21px] font-bold text-white leading-tight">
            {hospitalName}
          </h3>
          <p className="text-[13px] text-emerald-100/90 font-medium mt-1">
            {doctorName} · {appointmentTime}
          </p>
        </div>

        {/* Token Counter Badge */}
        <div className="bg-[#005F4E]/90 border border-emerald-400/20 rounded-[16px] w-16 h-16 flex flex-col items-center justify-center shadow-inner shrink-0">
          <span className="text-[9px] uppercase font-semibold text-emerald-200/90 tracking-wider">
            TOKEN
          </span>
          <span className="text-[26px] font-bold text-white leading-none mt-0.5">
            {tokenNumber}
          </span>
        </div>
      </div>

      {/* Bottom Row: Estimated Wait Time Bar */}
      <div className="mt-4 bg-[#087762] rounded-xl py-2.5 px-3.5 flex items-center gap-2">
        <Clock className="w-4 h-4 text-emerald-200" />
        <span className="text-[13px] font-semibold text-white">
          Estimated wait: <span className="font-bold">{estimatedWaitMin} min</span>
        </span>
      </div>
    </article>
  );
}

interface UpcomingAppointmentCardProps {
  appointment: AppointmentItem;
  onViewDetails?: () => void;
}

export function UpcomingAppointmentCard({
  appointment,
  onViewDetails,
}: UpcomingAppointmentCardProps) {
  return (
    <article className="w-full bg-white border border-slate-200/80 rounded-[20px] p-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3">
        {/* Mini Calendar Icon Container */}
        <div className="w-12 h-12 rounded-xl bg-slate-100/80 border border-slate-200/60 flex flex-col items-center justify-center p-1 overflow-hidden shrink-0">
          <div className="w-full flex justify-center gap-1 mb-0.5">
            <span className="w-2 h-1 bg-red-400 rounded-full" />
            <span className="w-2 h-1 bg-red-400 rounded-full" />
          </div>
          <span className="text-slate-800 text-[14px] font-bold leading-tight">
            {appointment.dateNumeric || "17"}
          </span>
        </div>

        {/* Doctor & Hospital Metadata */}
        <div className="flex flex-col">
          <h3 className="text-[14px] font-bold text-slate-800 leading-snug">
            {appointment.department}
          </h3>
          <p className="text-[12px] text-slate-500 leading-snug mt-0.5">
            {appointment.hospitalName} · {appointment.doctorName} ·
          </p>
          <p className="text-[12px] text-slate-500 leading-none">
            {appointment.appointmentTime}
          </p>
        </div>
      </div>

      {onViewDetails && (
        <button
          type="button"
          onClick={onViewDetails}
          className="text-xs font-semibold text-[#005F4B] hover:text-[#004D3D] px-3 py-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition"
        >
          Details
        </button>
      )}
    </article>
  );
}
