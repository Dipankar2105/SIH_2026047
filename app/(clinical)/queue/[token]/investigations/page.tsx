"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { dashboardService, QueuePatient } from "@/lib/services/dashboard.service";
import { useClinicalWorkflowStore } from "@/stores/clinical-workflow.store";

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

interface TestItem {
  id: string;
  name: string;
  code: string;
  description: string;
  categoryGroup: string;
  categories: string[];
  urgency: "MUST DO" | "RECOMMENDED" | "OPTIONAL";
  timing: string;
}

const ALL_TESTS: TestItem[] = [
  {
    id: "cbc",
    name: "CBC (Complete Blood Count)",
    code: "CBC",
    description: "Rule out infection, anaemia",
    categoryGroup: "Gastroenterology",
    categories: ["Gastroenterology", "Blood Tests", "Common OPD"],
    urgency: "MUST DO",
    timing: "2-3 hrs",
  },
  {
    id: "fobt",
    name: "Stool Occult Blood / H. pylori Ag",
    code: "FOBT/HP",
    description: "Rule out GI bleeding / H. pylori",
    categoryGroup: "Gastroenterology",
    categories: ["Gastroenterology", "Blood Tests"],
    urgency: "MUST DO",
    timing: "Same day",
  },
  {
    id: "usg-abd",
    name: "USG Whole Abdomen",
    code: "USG-ABD",
    description: "Structural pathology, organomegaly",
    categoryGroup: "Gastroenterology",
    categories: ["Gastroenterology", "Ultrasound & X-Ray"],
    urgency: "RECOMMENDED",
    timing: "Same day",
  },
  {
    id: "amylase",
    name: "Serum Amylase & Lipase",
    code: "AMYL",
    description: "Rule out pancreatitis",
    categoryGroup: "Gastroenterology",
    categories: ["Gastroenterology", "Blood Tests"],
    urgency: "RECOMMENDED",
    timing: "4-6 hrs",
  },
  {
    id: "ecg",
    name: "12-lead ECG",
    code: "ECG",
    description: "Rule out cardiac cause (given family Hx IHD)",
    categoryGroup: "Cardiac",
    categories: ["Cardiac / ECG", "Common OPD"],
    urgency: "OPTIONAL",
    timing: "Immediate",
  },
  {
    id: "lft",
    name: "LFT (Liver Function Tests)",
    code: "LFT",
    description: "Hepatic pathology",
    categoryGroup: "Renal & Liver",
    categories: ["Renal & Liver", "Blood Tests"],
    urgency: "OPTIONAL",
    timing: "4-6 hrs",
  },
  {
    id: "kft",
    name: "S. Creatinine / eGFR",
    code: "KFT",
    description: "Renal function baseline",
    categoryGroup: "Renal & Liver",
    categories: ["Renal & Liver", "Blood Tests"],
    urgency: "OPTIONAL",
    timing: "4-6 hrs",
  },
  {
    id: "rbs",
    name: "Random Blood Sugar (RBS)",
    code: "RBS",
    description: "Glycemia screening",
    categoryGroup: "Blood Tests",
    categories: ["Common OPD", "Blood Tests"],
    urgency: "OPTIONAL",
    timing: "Immediate",
  },
  {
    id: "cxr",
    name: "Chest X-Ray PA View",
    code: "CXR-PA",
    description: "Rule out pulmonary pathology",
    categoryGroup: "Ultrasound & X-Ray",
    categories: ["Ultrasound & X-Ray", "Common OPD"],
    urgency: "OPTIONAL",
    timing: "Same day",
  },
];

const CATEGORIES = [
  "Common OPD",
  "Blood Tests",
  "Gastroenterology",
  "Ultrasound & X-Ray",
  "Cardiac / ECG",
  "Renal & Liver",
];

const DEFAULT_SELECTED_IDS = ["cbc", "fobt", "usg-abd", "amylase"];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function InvestigationsPage() {
  const params = useParams();
  const rawToken = params.token as string;
  const router = useRouter();
  const activeEncounter = useClinicalWorkflowStore((s) => s.activeEncounter);
  const [patient, setPatient] = useState<QueuePatient | null>(null);
  const [loading, setLoading] = useState(true);

  const targetToken = activeEncounter?.token || rawToken || "#42";
  const normalizedToken = targetToken.startsWith("#") ? targetToken : `#${targetToken}`;

  const [selectedTests, setSelectedTests] = useState<TestItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedInv = window.sessionStorage.getItem(`investigations_${normalizedToken}`);
        if (storedInv) {
          const parsed = JSON.parse(storedInv);
          if (parsed.tests && Array.isArray(parsed.tests)) {
            return ALL_TESTS.filter((t) =>
              parsed.tests.some((st: TestItem | string) => (typeof st === "string" ? st === t.id : st.id === t.id))
            );
          }
        }
      } catch {
        // fallback
      }
    }
    return ALL_TESTS.filter((t) => DEFAULT_SELECTED_IDS.includes(t.id));
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Gastroenterology");
  const [instructions, setInstructions] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const storedInv = window.sessionStorage.getItem(`investigations_${normalizedToken}`);
        if (storedInv) {
          const parsed = JSON.parse(storedInv);
          if (parsed.instructions) return parsed.instructions;
        }
      } catch {
        // fallback
      }
    }
    return "";
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);

  const addToast = (message: string, type: "success" | "info" | "error" = "success") => {
    toastIdRef.current += 1;
    const id = `toast-${toastIdRef.current}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  useEffect(() => {
    let encounter = activeEncounter;
    if (!encounter) {
      try {
        const stored = window.sessionStorage.getItem("activeEncounter");
        if (stored) {
          encounter = JSON.parse(stored);
        }
      } catch {
        // ignore
      }
    }

    let cancelled = false;
    const tokenToFetch = encounter?.token || rawToken || "42";

    dashboardService
      .getPatientByToken(tokenToFetch)
      .then((data) => {
        if (cancelled) return;
        const targetPatient = data || {
          id: `p-${tokenToFetch}`,
          token: tokenToFetch.startsWith("#") ? tokenToFetch : `#${tokenToFetch}`,
          name: "Patient",
          age: 30,
          gender: "M",
          abhaId: "ABHA-1234",
          intakeStatus: "linked" as const,
          chiefComplaint: "Routine OPD Visit",
          symptoms: "Mild discomfort",
          vitals: { bp: "120/80", pulse: "72" },
          priority: "normal" as const,
          redFlagDetected: false,
          status: "in-consultation" as const,
          registeredAt: new Date().toISOString(),
        };

        setPatient(targetPatient);

        // Dynamic initial test selection if not already saved in sessionStorage
        const storedKey = `investigations_${targetPatient.token}`;
        try {
          const storedInv = window.sessionStorage.getItem(storedKey);
          if (storedInv) {
            const parsed = JSON.parse(storedInv);
            if (parsed.tests && Array.isArray(parsed.tests)) {
              setSelectedTests(
                ALL_TESTS.filter((t) =>
                  parsed.tests.some((st: TestItem | string) => (typeof st === "string" ? st === t.id : st.id === t.id))
                )
              );
              if (parsed.instructions) setInstructions(parsed.instructions);
              setLoading(false);
              return;
            }
          }
        } catch {}

        // Complaint-based default tests
        const complaint = (targetPatient.chiefComplaint || "").toLowerCase();
        if (complaint.includes("chest") || complaint.includes("sob") || complaint.includes("breath")) {
          setSelectedTests(ALL_TESTS.filter((t) => ["ecg", "cbc", "kft"].includes(t.id)));
          setActiveCategory("Cardiac / ECG");
        } else if (complaint.includes("knee") || complaint.includes("joint")) {
          setSelectedTests(ALL_TESTS.filter((t) => ["cbc"].includes(t.id)));
          setActiveCategory("Common OPD");
        } else if (complaint.includes("fever") || complaint.includes("cough")) {
          setSelectedTests(ALL_TESTS.filter((t) => ["cbc", "cxr"].includes(t.id)));
          setActiveCategory("Common OPD");
        } else {
          setSelectedTests(ALL_TESTS.filter((t) => DEFAULT_SELECTED_IDS.includes(t.id)));
          setActiveCategory("Gastroenterology");
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        const formattedToken = tokenToFetch.startsWith("#") ? tokenToFetch : `#${tokenToFetch}`;
        setPatient({
          id: `p-${tokenToFetch}`,
          token: formattedToken,
          name: "Rahul S.",
          age: 34,
          gender: "M",
          abhaId: "ABHA-2345-6789-0123-4567",
          intakeStatus: "linked",
          chiefComplaint: "Abdominal pain & cramping",
          symptoms: "Lower abdominal pain",
          vitals: { bp: "122/80", pulse: "76" },
          priority: "normal",
          redFlagDetected: false,
          status: "in-consultation",
          registeredAt: new Date().toISOString(),
          abhaConnected: true,
          abhaLabel: "rahul34@abdm",
          room: "OPD Room 14",
        });
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [rawToken, activeEncounter, router]);

  // Filter tests based on category tab & search query
  const filteredTests = ALL_TESTS.filter((test) => {
    const matchesCategory =
      !activeCategory || test.categories.includes(activeCategory) || test.categoryGroup === activeCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Group filtered tests by categoryGroup for display
  const groupNames = Array.from(new Set(filteredTests.map((t) => t.categoryGroup)));
  const groups = groupNames.map((g) => ({
    groupName: g,
    tests: filteredTests.filter((t) => t.categoryGroup === g),
  }));

  const toggleTest = (test: TestItem) => {
    const exists = selectedTests.some((t) => t.id === test.id);
    if (exists) {
      setSelectedTests((prev) => prev.filter((t) => t.id !== test.id));
    } else {
      setSelectedTests((prev) => [...prev, test]);
    }
  };

  const removeTest = (id: string) => {
    setSelectedTests((prev) => prev.filter((t) => t.id !== id));
  };

  const handleConfirm = () => {
    if (selectedTests.length === 0) {
      addToast("Please select at least one test", "info");
      return;
    }
    const currentToken = rawToken || activeEncounter?.token || "42";
    const cleanToken = currentToken.replace(/^#/, "");
    const normalizedToken = currentToken.startsWith("#") ? currentToken : `#${currentToken}`;
    try {
      window.sessionStorage.setItem(
        `investigations_${normalizedToken}`,
        JSON.stringify({
          tests: selectedTests,
          instructions,
          confirmedAt: new Date().toISOString(),
        })
      );
    } catch {
      // ignore
    }
    addToast(`Confirmed ${selectedTests.length} test(s) for ${patient?.name || "patient"}`, "success");
    setTimeout(() => {
      router.push(`/queue/${cleanToken}/prescription`);
    }, 1200);
  };

  const handleSkip = () => {
    const currentToken = rawToken || activeEncounter?.token || "42";
    const cleanToken = currentToken.replace(/^#/, "");
    router.push(`/queue/${cleanToken}/prescription`);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-400">Loading investigations...</p>
      </div>
    );
  }

  const currentToken = rawToken || activeEncounter?.token || "42";
  const currentPatient = patient || {
    token: currentToken.startsWith("#") ? currentToken : `#${currentToken}`,
    name: "Rahul S.",
    age: 34,
    gender: "M",
    abhaId: "ABHA-2345-6789-0123-4567",
    abhaConnected: true,
    abhaLabel: "rahul34@abdm",
    room: "OPD Room 14",
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#F8FAFC]">
      {/* Toast Notifications */}
      <div className="fixed top-20 right-8 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 min-w-[280px] ${
              t.type === "success"
                ? "bg-[#00594C] text-white"
                : t.type === "error"
                ? "bg-red-600 text-white"
                : "bg-slate-800 text-white"
            }`}
          >
            <span>{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="ml-auto opacity-70 hover:opacity-100 text-base leading-none"
              type="button"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Patient Demographics Banner */}
      <section className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#EBF5F3] text-[#00594C] font-semibold text-xs flex items-center justify-center">
            {getInitials(currentPatient.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 leading-none">{currentPatient.name}</span>
              <span className="text-xs text-slate-500">
                {currentPatient.age} yrs · {currentPatient.gender === "M" ? "Male" : currentPatient.gender === "F" ? "Female" : currentPatient.gender}
              </span>
              <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                Token {currentPatient.token.startsWith("#") ? currentPatient.token : `#${currentPatient.token}`}
              </span>
              {currentPatient.abhaConnected && (
                <span className="text-[11px] font-medium text-[#00594C] flex items-center gap-1 ml-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  ABHA Connected
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span>{currentPatient.abhaLabel || currentPatient.abhaId || "rahul34@abdm"}</span>
              <span>·</span>
              <span>{currentPatient.room || "OPD Room 14"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            In Consultation
          </span>
        </div>
      </section>

      {/* Main Workspace (Center + Right Columns) */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Center: Test Selection Area */}
        <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-w-0">
          {/* Search & Filter Controls */}
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative w-full">
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00594C] focus:border-[#00594C] shadow-sm"
                placeholder="Search lab test, panel, imaging, code..."
                type="text"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-[#00594C] text-white shadow-sm font-semibold"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                    type="button"
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Cards Grouped by Section */}
          {groups.length === 0 ? (
            <div className="flex h-40 items-center justify-center bg-white rounded-lg border border-slate-200">
              <p className="text-xs text-slate-400">No lab tests found matching your filter</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.groupName} className="space-y-2 pt-1">
                <h3 className="text-xs font-bold text-slate-900 tracking-wide">{group.groupName}</h3>
                {group.tests.map((test) => {
                  const isSelected = selectedTests.some((t) => t.id === test.id);
                  return (
                    <div
                      key={test.id}
                      onClick={() => toggleTest(test)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#EBF5F3] border-[#00594C]/40 hover:border-[#00594C]"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 cursor-pointer ${
                            isSelected ? "bg-[#00594C] text-white border-[#00594C]" : "border border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 stroke-[3]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-900">{test.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{test.code}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">{test.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                            test.urgency === "MUST DO"
                              ? "bg-rose-50 text-rose-600"
                              : test.urgency === "RECOMMENDED"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {test.urgency}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {test.timing}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </main>

        {/* Right Rail: Selected Tests */}
        <aside className="w-72 bg-white border-l border-slate-200 flex flex-col justify-between flex-shrink-0 p-4">
          <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xs font-bold text-slate-900">Selected Tests</h3>
              <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold bg-[#00594C] text-white rounded-full">
                {selectedTests.length}
              </span>
            </div>

            {/* List of Chosen Tests */}
            {selectedTests.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No tests selected</p>
            ) : (
              <div className="space-y-2">
                {selectedTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-colors"
                  >
                    <div className="pr-2 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-800 truncate">{test.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {test.code} · {test.timing}
                      </p>
                    </div>
                    <button
                      onClick={() => removeTest(test.id)}
                      className="text-rose-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Remove"
                      type="button"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Clinical Instructions Area */}
            <div className="pt-3">
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1.5 uppercase">
                Clinical Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00594C] focus:border-[#00594C] resize-none"
                placeholder="e.g. Fasting required for lipid profile..."
                rows={3}
              />
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="pt-3 space-y-2 flex-shrink-0">
            <button
              onClick={handleConfirm}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all shadow hover:shadow-md flex items-center justify-center ${
                selectedTests.length > 0
                  ? "bg-[#00594C] hover:bg-[#00473D] text-white cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
              type="button"
            >
              Confirm Test
            </button>
            <button
              onClick={handleSkip}
              className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-500 rounded-lg text-xs font-semibold tracking-wider transition-colors"
              type="button"
            >
              SKIP
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}