"use client";

import React from "react";
import Link from "next/link";
import {
  ClipboardList,
  FileText,
  Calendar,
  ChevronRight,
  User,
} from "lucide-react";
import { MobileContainer } from "@/components/patient/MobileContainer";
import { PatientTopBar } from "@/components/patient/PatientTopBar";
import { usePatient } from "@/context/PatientContext";

export default function PatientHomePage() {
  const { patient, assignedToken } = usePatient();

  return (
    <MobileContainer bgClassName="bg-[#F5F8F9]">
      {/* Top Bar */}
      <PatientTopBar
        title="AarogyaFlow"
        showBrand={true}
        showBack={false}
        textToRead="Good morning Rahul. Welcome to AarogyaFlow. How can we help you today? You can start a consultation, view your health records, or check appointments."
      />

      {/* Main Screen Content */}
      <div className="flex-1 px-5 pt-3 pb-8 overflow-y-auto space-y-4">
        {/* User Greeting Section */}
        <section className="pt-2 pb-1" data-purpose="user-greeting">
          <div className="flex items-center space-x-3.5 mb-2">
            {/* Avatar Profile */}
            <div className="relative w-13 h-13 rounded-full p-[2px] bg-gradient-to-tr from-teal-200 to-emerald-400 shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-emerald-50 flex items-center justify-center text-[#005F4B]">
                <User className="w-7 h-7 stroke-[1.8]" />
              </div>
            </div>

            {/* Greeting Labels */}
            <div className="flex flex-col">
              <span className="text-xs font-normal text-gray-500">
                Good morning,
              </span>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                {patient.fullName || "Rahul"}
              </h1>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600">
            How can we help you today?
          </p>
        </section>

        {/* Primary Hero Card */}
        <section className="bg-[#015C49] rounded-2xl p-5 text-white shadow-lg shadow-[#015C49]/20 relative overflow-hidden">
          <div className="flex items-start space-x-4">
            {/* Clipboard Icon Badge */}
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <ClipboardList className="w-6 h-6 text-emerald-200 stroke-[1.8]" />
            </div>

            {/* Card Content & Action Button */}
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white tracking-tight mb-1">
                Start Consultation
              </h2>
              <p className="text-xs text-emerald-100/80 leading-relaxed mb-4">
                Tell us what&apos;s wrong and share your health history.
              </p>
              <Link
                href="/patient/consult/pathway"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/20 active:bg-white/25 border border-white/10 text-xs font-semibold text-white transition-all active:scale-95"
              >
                <span>Begin</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </section>

        {/* Secondary Actions List */}
        <section className="space-y-3" data-purpose="secondary-options">
          {/* Card 1: My Health Records */}
          <Link
            href="/patient/records"
            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200/70 shadow-2xs hover:border-gray-300 transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#EAF5F2] flex items-center justify-center text-[#0A735E] shrink-0">
                <FileText className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900 leading-snug">
                  My Health Records
                </h3>
                <p className="text-[11.5px] text-gray-500 leading-normal mt-0.5">
                  Reports, prescriptions and previous visits.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0 ml-2" />
          </Link>

          {/* Card 2: Appointments / Queue */}
          <Link
            href="/patient/appointments"
            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200/70 shadow-2xs hover:border-gray-300 transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#EAF5F2] flex items-center justify-center text-[#0A735E] shrink-0">
                <Calendar className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900 leading-snug">
                  Appointments / Queue
                </h3>
                <p className="text-[11.5px] text-gray-500 leading-normal mt-0.5">
                  Your appointment or hospital queue status.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0 ml-2" />
          </Link>
        </section>

        {/* Recent Activity Section */}
        <section className="bg-white rounded-2xl p-4 border border-gray-200/70 shadow-2xs">
          <span className="block text-[10.5px] font-bold tracking-wider text-gray-400 uppercase mb-1.5">
            Recent Activity
          </span>
          {assignedToken ? (
            <p className="text-xs text-slate-700 leading-relaxed">
              Active OPD Token <span className="font-bold text-[#005F4B]">#{assignedToken}</span> registered at City Hospital today.
            </p>
          ) : (
            <p className="text-xs text-gray-500 leading-relaxed">
              Your health activity will appear here after your first consultation.
            </p>
          )}
        </section>
      </div>
    </MobileContainer>
  );
}
