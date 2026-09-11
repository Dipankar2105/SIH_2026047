"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, Plus, CheckCircle, X, FileText, Download } from "lucide-react";
import { MobileContainer } from "@/components/patient/MobileContainer";
import { PatientTopBar } from "@/components/patient/PatientTopBar";
import { RecordCard } from "@/components/patient/RecordCard";
import { EmptyState } from "@/components/patient/States";
import { usePatient } from "@/context/PatientContext";
import { HealthRecord } from "@/types/patient";

const FILTER_CATEGORIES = ["All", "File (History)", "Lab Reports", "Prescription"];

export default function MyHealthRecordsPage() {
  const { healthRecords } = usePatient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);

  const filteredRecords = useMemo(() => {
    return healthRecords.filter((rec) => {
      // Category filter
      if (activeCategory !== "All") {
        if (activeCategory === "Lab Reports" && rec.category !== "Lab Report") return false;
        if (activeCategory === "File (History)" && !rec.category.includes("File")) return false;
        if (activeCategory === "Prescription" && rec.category !== "Prescription") return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          rec.title.toLowerCase().includes(q) ||
          rec.provider.toLowerCase().includes(q) ||
          rec.category.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [healthRecords, activeCategory, searchQuery]);

  return (
    <MobileContainer bgClassName="bg-[#FAFBFB]">
      {/* Top Header */}
      <PatientTopBar
        title="My Health Records"
        showBrand={false}
        showBack={true}
        backHref="/patient"
        textToRead="My Health Records. ABHA connected. You have records for blood tests, prescriptions, and medical history."
      />

      {/* ABHA Status Banner */}
      <section className="bg-[#EAF6F0] px-4 py-2 flex items-center space-x-2 border-b border-[#D8ECE1]">
        <CheckCircle className="w-4 h-4 text-[#007B55]" />
        <span className="text-xs font-semibold text-[#00533b] tracking-tight">
          ABHA connected
        </span>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-8 space-y-3">
        {/* Search & Filter Bar */}
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4 stroke-[2]" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your records..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007B55] focus:border-[#007B55] transition shadow-2xs"
            />
          </div>

          {/* Filter Button */}
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shrink-0 space-x-1.5 shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500 stroke-[2]" />
            <span>Filter</span>
          </button>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto py-0.5 no-scrollbar -mx-1 px-1">
          {FILTER_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1 text-[11px] font-semibold rounded-full shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#007B55] text-white shadow-2xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Records Count & Add Action Row */}
        <div className="flex items-center justify-between pt-1 pb-0.5 px-0.5">
          <span className="text-[11px] font-semibold text-slate-500">
            {filteredRecords.length} records
          </span>
          <Link
            href="/patient/records/upload"
            className="inline-flex items-center text-[12px] font-semibold text-[#007B55] hover:text-[#00533b] space-x-0.5 group"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add record</span>
          </Link>
        </div>

        {/* Records List */}
        {filteredRecords.length > 0 ? (
          <div className="space-y-2">
            {filteredRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onClick={() => setSelectedRecord(record)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No records found"
            description="Try changing your filter or search query, or upload a new record."
            actionLabel="Add Record"
            onAction={() => setActiveCategory("All")}
          />
        )}
      </main>

      {/* Record Preview Modal */}
      {selectedRecord && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200/80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#007B55]" />
                <h3 className="text-[15px] font-bold text-slate-900">
                  {selectedRecord.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 mb-5">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Provider</span>
                <span className="font-semibold text-slate-800">{selectedRecord.provider}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Date</span>
                <span className="font-semibold text-slate-800">{selectedRecord.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Source</span>
                <span className="font-semibold text-[#007B55]">{selectedRecord.source}</span>
              </div>
              {selectedRecord.summary && (
                <div className="pt-1">
                  <span className="text-slate-400 block mb-1">Clinical Summary</span>
                  <p className="p-2.5 bg-slate-50 rounded-xl text-slate-700 leading-relaxed font-mono text-[11px]">
                    {selectedRecord.summary}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                alert(`Downloading standard HL7 FHIR R4 document for ${selectedRecord.title}`);
                setSelectedRecord(null);
              }}
              className="w-full py-3 rounded-xl bg-[#005F4B] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#004D3D] transition"
            >
              <Download className="w-4 h-4" />
              <span>Download FHIR Document</span>
            </button>
          </div>
        </div>
      )}
    </MobileContainer>
  );
}
