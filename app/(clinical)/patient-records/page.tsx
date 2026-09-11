"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { dashboardService, QueuePatient } from "@/lib/services/dashboard.service";
import { useClinicalWorkflowStore } from "@/stores/clinical-workflow.store";

type TabType = "Overview" | "Timeline" | "Consultations" | "Past Prescriptions" | "Investigations" | "Documents";

interface TimelineItem {
  id: string;
  date: string;
  badgeType: "Current Encounter" | "Previous Encounter" | "ABDM Record";
  badgeText?: string;
  title: string;
  subtitle: string;
  doctor?: string;
  details: string;
  hasViewReport?: boolean;
  nodeColor: string;
  isCurrent?: boolean;
}

interface DocumentItem {
  id: string;
  title: string;
  category: "Lab Reports" | "Imaging" | "Prescriptions";
  date: string;
  source: string;
  verifiedStatus: string;
  badge1: string;
  badge2: string;
  needsReview?: boolean;
  extractedFindings?: Array<{
    parameter: string;
    value: string;
    reference: string;
    status: "Normal" | "Abnormal" | "High" | "Low";
  }>;
  documentSummary?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function PatientRecordsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeEncounter = useClinicalWorkflowStore((s) => s.activeEncounter);

  const [patient, setPatient] = useState<QueuePatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("Timeline");

  // Filter & Search states for Documents
  const [documentSearch, setDocumentSearch] = useState("");
  const [documentCategoryFilter, setDocumentCategoryFilter] = useState<string>("All");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("doc-1");

  // Modals state
  const [viewDetailsModalItem, setViewDetailsModalItem] = useState<TimelineItem | null>(null);
  const [viewFullReportModal, setViewFullReportModal] = useState<DocumentItem | null>(null);

  useEffect(() => {
    let token = searchParams.get("token");
    if (!token && activeEncounter) {
      token = activeEncounter.token;
    }
    if (!token && typeof window !== "undefined") {
      try {
        const stored = window.sessionStorage.getItem("activeEncounter");
        if (stored) {
          const enc = JSON.parse(stored);
          token = enc.token;
        }
      } catch {
        // ignore
      }
    }
    if (!token) {
      token = "#42"; // default patient context if none supplied
    }

    let cancelled = false;
    dashboardService
      .getPatientByToken(token)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setPatient(data);
        } else {
          return dashboardService.getPatientByToken("#42").then((fallback) => {
            if (!cancelled && fallback) setPatient(fallback);
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, activeEncounter]);

  // Timeline Mock Data
  const timelineItems: TimelineItem[] = [
    {
      id: "tl-1",
      date: "9 Sep 2026",
      badgeType: "Current Encounter",
      title: "Current OPD Consultation",
      subtitle: `${patient?.chiefComplaint || "Abdominal pain & cramping"} · ${patient?.department || "Modern Medicine"} · Dr. A. Sharma`,
      details: `Patient presented with ${patient?.symptoms || "Abdominal pain and cramping"}. Vitals recorded at intake. Physician evaluation in progress.`,
      nodeColor: "#00594C",
      isCurrent: true,
    },
    {
      id: "tl-2",
      date: "15 Aug 2026",
      badgeType: "Previous Encounter",
      title: "OPD Consultation",
      subtitle: "Seasonal allergic rhinitis · Prescribed: Cetirizine, Fluticasone nasal spray",
      doctor: "Dr. R. Gupta",
      details: "Presented with nasal congestion, sneezing, and watery eyes for 5 days. History of seasonal allergies. Advised allergen avoidance.",
      nodeColor: "#CBD5E1",
    },
    {
      id: "tl-3",
      date: "12 Jun 2026",
      badgeType: "ABDM Record",
      title: "Laboratory Investigation",
      subtitle: "CBC, LFT, KFT - Results: All within normal limits",
      details: "Comprehensive metabolic panel and complete blood count performed at City Diagnostics. Hemoglobin 13.4 g/dL, Platelets 2.1L. All organ function tests within baseline.",
      hasViewReport: true,
      nodeColor: "#00594C",
    },
    {
      id: "tl-4",
      date: "18 Mar 2026",
      badgeType: "Previous Encounter",
      title: "OPD Consultation",
      subtitle: "Viral fever · Rx: Paracetamol, rest",
      doctor: "Dr. A. Sharma",
      details: "High grade fever (101.5°F) with body ache for 2 days. Chest clear. Prescribed symptomatic treatment and hydration.",
      nodeColor: "#CBD5E1",
    },
    {
      id: "tl-5",
      date: "5 Nov 2024",
      badgeType: "ABDM Record",
      title: "Appendectomy — Surgical Record",
      subtitle: "Laparoscopic Appendectomy · City General Hospital",
      details: "Emergency laparoscopic appendectomy for acute appendicitis. Uncomplicated recovery. Histopathology confirmed acute suppurative appendicitis.",
      nodeColor: "#B46A36",
    },
  ];

  // Documents Mock Data
  const documentsList: DocumentItem[] = [
    {
      id: "doc-1",
      title: "Complete Blood Count (CBC)",
      category: "Lab Reports",
      date: "15 Aug 2026",
      source: "ABDM Record",
      verifiedStatus: "OCR Verified",
      badge1: "ABDM Record",
      badge2: "Verified",
      extractedFindings: [
        { parameter: "Hb", value: "13.4 g/dL", reference: "13.0-17.0", status: "Normal" },
        { parameter: "TLC", value: "7800 /µL", reference: "4000-11000", status: "Normal" },
        { parameter: "Platelets", value: "2.1 L/µL", reference: "1.5-4.0 L", status: "Normal" },
        { parameter: "MCV", value: "82 fL", reference: "80-100", status: "Normal" },
      ],
      documentSummary: "CBC report from City Central Lab. Normal cell counts without atypical cells or anemia.",
    },
    {
      id: "doc-2",
      title: "USG Abdomen",
      category: "Imaging",
      date: "12 Jun 2026",
      source: "ABDM Record",
      verifiedStatus: "Verified",
      badge1: "ABDM Record",
      badge2: "Verified",
      extractedFindings: [
        { parameter: "Liver", value: "Normal size (13.2 cm)", reference: "< 15 cm", status: "Normal" },
        { parameter: "Gallbladder", value: "No calculus / wall edema", reference: "Normal", status: "Normal" },
        { parameter: "Kidneys", value: "Bilateral normal CMD", reference: "Normal", status: "Normal" },
        { parameter: "Pancreas", value: "Normal echotexture", reference: "Normal", status: "Normal" },
      ],
      documentSummary: "Ultrasonography of abdomen & pelvis showing normal liver, kidneys, and spleen. No gallstones or free fluid.",
    },
    {
      id: "doc-3",
      title: "Prescription — Dr. R. Gupta",
      category: "Prescriptions",
      date: "15 Aug 2026",
      source: "OPD Record",
      verifiedStatus: "Needs Review",
      badge1: "OCR / Document",
      badge2: "Needs Review",
      needsReview: true,
      extractedFindings: [
        { parameter: "Cetirizine 10mg", value: "1 tab OD x 5 days", reference: "Oral", status: "Normal" },
        { parameter: "Fluticasone Spray", value: "2 puffs BD x 14 days", reference: "Nasal", status: "Normal" },
      ],
      documentSummary: "Outpatient prescription for seasonal allergic rhinitis. Digitized via OCR scan.",
    },
  ];

  const filteredDocuments = documentsList.filter((doc) => {
    const matchesCategory =
      documentCategoryFilter === "All" || doc.category === documentCategoryFilter;
    const matchesSearch =
      !documentSearch.trim() ||
      doc.title.toLowerCase().includes(documentSearch.toLowerCase()) ||
      doc.category.toLowerCase().includes(documentSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedDoc =
    documentsList.find((d) => d.id === selectedDocumentId) || filteredDocuments[0] || documentsList[0];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <p className="text-sm text-slate-400">Loading patient records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 bg-[#F9FBFA] -m-8 p-6 min-h-screen text-[13px] text-slate-800">
      {/* Patient Header Card */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#E3F2EF] text-[#00594C] font-semibold text-base flex items-center justify-center border border-[#CAE5DF]">
              {getInitials(patient?.name || "Rahul S.")}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{patient?.name || "Rahul S."}</h2>
                <span className="text-sm font-medium text-slate-500">
                  {patient?.age || 34} years · {patient?.gender === "M" ? "Male" : patient?.gender === "F" ? "Female" : patient?.gender || "Male"}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  Token {patient?.token || "#42"}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center space-x-2 flex-wrap">
                <span>Blood Group: <strong className="font-medium text-slate-700">B+</strong></span>
                <span>·</span>
                <span>Allergies: <strong className="font-medium text-slate-700">{patient?.allergyWarning?.allergen || "Penicillin (Rash)"}</strong></span>
                <span>·</span>
                <span>ABDM Consent: <strong className="font-medium text-slate-700">Active</strong></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
              In Consultation
            </span>
            {activeEncounter && (
              <button
                onClick={() => router.push("/active-consultation")}
                className="px-3 py-1 text-xs font-semibold text-[#00594C] bg-[#E6F4F1] border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                type="button"
              >
                Return to Consultation
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex space-x-8 text-xs font-medium px-2">
        {(["Overview", "Timeline", "Consultations", "Past Prescriptions", "Investigations", "Documents"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 transition-colors ${
              activeTab === tab
                ? "text-[#00594C] font-bold border-b-2 border-[#00594C] -mb-[1px]"
                : "text-slate-500 hover:text-slate-800"
            }`}
            type="button"
          >
            {tab === "Documents" ? "Document" : tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: TIMELINE */}
      {activeTab === "Timeline" && (
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 lg:col-span-8 relative pl-6">
            <div className="absolute left-2.5 top-3 bottom-0 w-0.5 bg-slate-200" />
            <div className="space-y-6">
              {timelineItems.map((item) => (
                <div key={item.id} className="relative flex items-start space-x-4">
                  <div className="relative z-10 -ml-6 flex items-center justify-center">
                    <div
                      className="w-5 h-5 rounded-full border-4 border-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center"
                      style={{ backgroundColor: item.nodeColor }}
                    />
                  </div>
                  <div
                    className={`flex-1 bg-white border rounded-xl p-4 shadow-sm ${
                      item.isCurrent ? "border-[#3E8B79]" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-slate-500">{item.date}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-semibold tracking-wide border ${
                          item.badgeType === "ABDM Record"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {item.badgeType}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      {item.isCurrent && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wider bg-[#00594C] text-white uppercase">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{item.subtitle}</p>
                    {item.doctor && (
                      <p className="text-[11px] text-slate-400 mt-0.5">Consulting: {item.doctor}</p>
                    )}
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => setViewDetailsModalItem(item)}
                        className="px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                        type="button"
                      >
                        View Details
                      </button>
                      {item.hasViewReport && (
                        <button
                          onClick={() => {
                            setActiveTab("Documents");
                            setSelectedDocumentId("doc-1");
                          }}
                          className="px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                          type="button"
                        >
                          View Report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Record Summary</h4>
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center pt-1 text-slate-600">
                  <span>Total Encounters</span>
                  <span className="font-bold text-slate-900 font-mono">5</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-slate-600">
                  <span>OPD Visits</span>
                  <span className="font-bold text-slate-900 font-mono">3</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-slate-600">
                  <span>Surgeries</span>
                  <span className="font-bold text-slate-900 font-mono">1</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-slate-600">
                  <span>Lab Reports</span>
                  <span className="font-bold text-slate-900 font-mono">2</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-slate-600">
                  <span>Prescriptions</span>
                  <span className="font-bold text-slate-900 font-mono">4</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-slate-600">
                  <span>Documents</span>
                  <span className="font-bold text-slate-900 font-mono">3</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 mb-2">Chronic Conditions</h4>
              <p className="text-xs italic text-slate-400">No known chronic conditions</p>
            </div>

            <div className="bg-[#FEF9EE] border border-[#FDE4B0] rounded-xl p-4 shadow-sm">
              <span className="text-[11px] font-medium text-[#9A6313]">Known Allergy</span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">Penicillin</h4>
              <p className="text-xs text-slate-600 mt-0.5">Reaction: Rash · Patient-reported</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 mb-3">ABHA</h4>
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center pt-1 text-slate-500">
                  <span>Health ID</span>
                  <span className="font-bold text-[#00594C] font-mono">23455 65432 5456</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-slate-500">
                  <span>Consent</span>
                  <span className="font-medium text-slate-800">Active · Valid till Dec 2026</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-slate-500">
                  <span>Records Linked</span>
                  <span className="font-medium text-[#00594C]">3 facilities</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-slate-500">
                  <span>Last Sync</span>
                  <span className="font-medium text-[#00594C]">Today 10:02 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DOCUMENTS */}
      {activeTab === "Documents" && (
        <div className="grid grid-cols-12 gap-6 items-start min-h-[500px]">
          <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" x2="16.65" y1="21" y2="16.65" />
                </svg>
              </span>
              <input
                value={documentSearch}
                onChange={(e) => setDocumentSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-teal-700 text-slate-700 placeholder-slate-400"
                placeholder="Search documents..."
                type="text"
              />
            </div>

            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 flex-wrap">
              {["All", "Lab Reports", "Imaging", "Prescriptions"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setDocumentCategoryFilter(cat)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                    documentCategoryFilter === cat
                      ? "bg-[#00594C] text-white"
                      : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                  }`}
                  type="button"
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="divide-y divide-slate-100 space-y-1 max-h-[420px] overflow-y-auto">
              {filteredDocuments.map((doc) => {
                const isSelected = selectedDoc.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocumentId(doc.id)}
                    className={`p-3 cursor-pointer rounded-lg transition-all ${
                      isSelected
                        ? "bg-[#EBF6F3]/80 border-l-[3px] border-[#00594C]"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">{doc.title}</h4>
                      <svg className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                        <polyline points="13 2 13 9 20 9" />
                      </svg>
                    </div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5">
                      {doc.category} · {doc.date}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[9.5px] font-medium text-[#00594C] bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                        {doc.badge1}
                      </span>
                      <span
                        className={`text-[9.5px] font-medium px-1.5 py-0.2 rounded border ${
                          doc.needsReview
                            ? "text-amber-700 bg-amber-50 border-amber-200"
                            : "text-emerald-700 bg-emerald-50 border-emerald-200"
                        }`}
                      >
                        {doc.badge2}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-4">
            <article className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">{selectedDoc.title}</h3>
                  <p className="text-[11.5px] text-slate-500 mt-1">
                    {selectedDoc.category} · {selectedDoc.date} · Source: {selectedDoc.source}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-tight font-semibold text-[#00594C] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                    {selectedDoc.source}
                  </span>
                  <span className="text-[10px] font-mono tracking-tight font-semibold text-[#00594C] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                    ✓ {selectedDoc.verifiedStatus}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 mt-3.5">
                <button
                  onClick={() => setViewFullReportModal(selectedDoc)}
                  className="bg-[#00594C] hover:bg-[#00473C] text-white font-medium text-xs px-3 py-1.5 rounded-md transition-colors shadow-sm"
                  type="button"
                >
                  Open Full Report
                </button>
                <button
                  onClick={() => setViewFullReportModal(selectedDoc)}
                  className="bg-white hover:bg-slate-50 text-slate-600 font-medium text-xs px-3 py-1.5 rounded-md border border-slate-200 transition-colors"
                  type="button"
                >
                  View Document
                </button>
              </div>
            </article>

            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-white">
                <h4 className="text-xs font-bold text-slate-900">Extracted Findings</h4>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-800 text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    AI GENERATED
                  </span>
                  <span className="text-[10.5px] text-slate-400">OCR-extracted · Subject to physician review</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold text-[10px] tracking-wider uppercase">
                      <th className="py-2 px-4 w-[25%]">PARAMETER</th>
                      <th className="py-2 px-4 w-[25%]">VALUE</th>
                      <th className="py-2 px-4 w-[25%]">REFERENCE</th>
                      <th className="py-2 px-4 text-right w-[25%]">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedDoc.extractedFindings?.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 text-slate-700 font-medium">{row.parameter}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900 font-mono text-xs">{row.value}</td>
                        <td className="py-2.5 px-4 text-slate-500 font-mono text-[11.5px]">{row.reference}</td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium text-[10.5px] px-2 py-0.5 rounded-full">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <article className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm flex flex-col items-center justify-center min-h-[140px]">
              <svg className="w-6 h-6 text-slate-400 stroke-[1.5] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <div className="text-xs font-bold text-slate-700">{selectedDoc.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Document preview · {selectedDoc.source}</div>
              <button
                onClick={() => setViewFullReportModal(selectedDoc)}
                className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                type="button"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                View Original Document
              </button>
            </article>
          </div>
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Patient Overview &amp; History Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">CHIEF COMPLAINT HISTORY</span>
                <p className="mt-1 font-semibold text-slate-800">{patient?.chiefComplaint || "Abdominal pain & cramping"}</p>
                <p className="text-slate-500 mt-0.5">{patient?.symptoms || "Lower abdominal pain with cramping after eating outside food."}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">PAST SURGICAL HISTORY</span>
                <p className="mt-1 font-semibold text-slate-800">Laparoscopic Appendectomy (2024)</p>
                <p className="text-slate-500 mt-0.5">Uncomplicated post-operative recovery.</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">RECENT VITALS BASELINE</span>
              <div className="grid grid-cols-4 gap-2 mt-2">
                <div className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
                  <span className="block text-[10px] text-slate-400">BP</span>
                  <span className="font-bold text-slate-800">{patient?.vitals?.bp || "122/80"}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
                  <span className="block text-[10px] text-slate-400">PULSE</span>
                  <span className="font-bold text-slate-800">{patient?.vitals?.pulse || "76 bpm"}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
                  <span className="block text-[10px] text-slate-400">SpO2</span>
                  <span className="font-bold text-slate-800">{patient?.vitals?.spo2 || "98%"}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
                  <span className="block text-[10px] text-slate-400">TEMP</span>
                  <span className="font-bold text-slate-800">{patient?.vitals?.temperature || "98.4°F"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase">Quick Actions</h4>
            <button
              onClick={() => setActiveTab("Timeline")}
              className="w-full py-2 px-3 text-left text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
              type="button"
            >
              → View Timeline Records
            </button>
            <button
              onClick={() => setActiveTab("Documents")}
              className="w-full py-2 px-3 text-left text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
              type="button"
            >
              → Browse Lab &amp; Imaging Reports
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CONSULTATIONS */}
      {activeTab === "Consultations" && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Past Consultations (3)</h3>
          <div className="space-y-3">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-slate-900">OPD Consultation — Seasonal Allergic Rhinitis</h4>
                <p className="text-[11px] text-slate-500">15 Aug 2026 · Consulting: Dr. R. Gupta · Modern Medicine</p>
              </div>
              <button
                onClick={() => setViewDetailsModalItem(timelineItems[1])}
                className="px-3 py-1 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-slate-100"
                type="button"
              >
                View Details
              </button>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-slate-900">OPD Consultation — Viral Fever</h4>
                <p className="text-[11px] text-slate-500">18 Mar 2026 · Consulting: Dr. A. Sharma · General Medicine</p>
              </div>
              <button
                onClick={() => setViewDetailsModalItem(timelineItems[3])}
                className="px-3 py-1 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-slate-100"
                type="button"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PAST PRESCRIPTIONS */}
      {activeTab === "Past Prescriptions" && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Past Prescriptions (4)</h3>
          <div className="space-y-3">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-900">Prescription — 15 Aug 2026 (Dr. R. Gupta)</h4>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">1. Tab Cetirizine 10mg — OD x 5 days</p>
              <p className="text-xs text-slate-600">2. Fluticasone Nasal Spray — 2 puffs BD x 14 days</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: INVESTIGATIONS */}
      {activeTab === "Investigations" && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Past Investigations &amp; Reports (2)</h3>
          <div className="space-y-3">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Complete Blood Count (CBC)</h4>
                <p className="text-[11px] text-slate-500">15 Aug 2026 · Source: ABDM Record · All Parameters Normal</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab("Documents");
                  setSelectedDocumentId("doc-1");
                }}
                className="px-3 py-1 text-xs font-medium bg-[#00594C] text-white rounded hover:bg-[#00473C]"
                type="button"
              >
                View Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: View Timeline Details */}
      {viewDetailsModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">{viewDetailsModalItem.title}</h3>
              <button
                onClick={() => setViewDetailsModalItem(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                type="button"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <p><strong className="text-slate-900">Date:</strong> {viewDetailsModalItem.date}</p>
              <p><strong className="text-slate-900">Record Type:</strong> {viewDetailsModalItem.badgeType}</p>
              <p><strong className="text-slate-900">Summary:</strong> {viewDetailsModalItem.subtitle}</p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                {viewDetailsModalItem.details}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewDetailsModalItem(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#00594C] rounded-lg hover:bg-[#00473C]"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: View Full Document / Report */}
      {viewFullReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewFullReportModal.title}</h3>
                <p className="text-xs text-slate-500">{viewFullReportModal.category} · {viewFullReportModal.date} · Source: {viewFullReportModal.source}</p>
              </div>
              <button
                onClick={() => setViewFullReportModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                type="button"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 text-xs">
              <p className="font-semibold text-slate-800">{viewFullReportModal.documentSummary}</p>
              {viewFullReportModal.extractedFindings && (
                <div className="bg-white border border-slate-200 rounded p-3">
                  <h4 className="font-bold text-slate-800 mb-2">Findings Summary</h4>
                  <ul className="space-y-1">
                    {viewFullReportModal.extractedFindings.map((f, i) => (
                      <li key={i} className="flex justify-between border-b border-slate-100 py-1">
                        <span>{f.parameter}</span>
                        <span className="font-bold text-slate-900 font-mono">{f.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setViewFullReportModal(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatientRecordsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Patient Records...</div>}>
      <PatientRecordsContent />
    </Suspense>
  );
}
