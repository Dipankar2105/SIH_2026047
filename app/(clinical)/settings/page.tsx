"use client";

import { useState, useRef } from "react";

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

export default function SettingsPage() {
  // Doctor Profile (Read-only / Demo)
  const doctorProfile = {
    name: "Dr. A. Sharma",
    role: "Senior Consultant — General Medicine",
    facility: "City Hospital · OPD Room 14",
    regNumber: "MCI-2014-987654",
    hprId: "dr.sharma@hpr.abdm",
    abdmVerified: true,
  };

  // Consultation Preferences
  const [dictationLanguage, setDictationLanguage] = useState<"Hindi" | "English" | "Hinglish">("Hindi");
  const [autoSaveNotes, setAutoSaveNotes] = useState(true);
  const [defaultTestFilter, setDefaultTestFilter] = useState("Gastroenterology");
  const [enableAiSuggestions, setEnableAiSuggestions] = useState(true);

  // Notifications
  const [redFlagAudioAlerts, setRedFlagAudioAlerts] = useState(true);
  const [patientQueueChime, setPatientQueueChime] = useState(true);
  const [dailyEmailDigest, setDailyEmailDigest] = useState(false);

  // Appearance
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("light");
  const [compactDensity, setCompactDensity] = useState(false);

  // Toast Notifications
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

  const handleSave = () => {
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "clinical_settings",
          JSON.stringify({
            dictationLanguage,
            autoSaveNotes,
            defaultTestFilter,
            enableAiSuggestions,
            redFlagAudioAlerts,
            patientQueueChime,
            dailyEmailDigest,
            themeMode,
            compactDensity,
          })
        );
      }
    } catch {
      // ignore
    }
    addToast("Settings saved successfully", "success");
  };

  const handleReset = () => {
    setDictationLanguage("Hindi");
    setAutoSaveNotes(true);
    setDefaultTestFilter("Gastroenterology");
    setEnableAiSuggestions(true);
    setRedFlagAudioAlerts(true);
    setPatientQueueChime(true);
    setDailyEmailDigest(false);
    setThemeMode("light");
    setCompactDensity(false);
    addToast("Settings reset to defaults", "info");
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#F8FAFC] text-slate-800 antialiased overflow-y-auto">
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

      {/* Main Workspace Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Clinical Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your consultation preferences, dictation defaults, and workspace notifications.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
              type="button"
            >
              Reset Defaults
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-[#00594C] hover:bg-[#004A3F] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              type="button"
            >
              Save Changes
            </button>
          </div>
        </div>
      </header>

      {/* Settings Sections Workspace */}
      <main className="flex-1 p-6 space-y-6 max-w-4xl">
        {/* Section 1: Practitioner Profile */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-xs font-bold text-slate-900 tracking-wide uppercase">Practitioner Profile</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Official medical identification and facility mapping</p>
            </div>
            {doctorProfile.abdmVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                ABDM Verified Practitioner
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#EBF5F3] text-[#00594C] flex items-center justify-center font-bold text-sm shrink-0 border border-teal-200">
              DS
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doctor Name</label>
                <p className="text-xs font-semibold text-slate-800 mt-1">{doctorProfile.name}</p>
                <p className="text-[11px] text-slate-500">{doctorProfile.role}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Facility & OPD</label>
                <p className="text-xs font-semibold text-slate-800 mt-1">{doctorProfile.facility}</p>
                <p className="text-[11px] text-slate-500">Registration: {doctorProfile.regNumber}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">HPR Identifier</label>
                <p className="text-xs font-mono font-medium text-teal-750 mt-1">{doctorProfile.hprId}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Consultation & Speech Preferences */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="pb-4 border-b border-slate-100 mb-4">
            <h2 className="text-xs font-bold text-slate-900 tracking-wide uppercase">Consultation Preferences</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Customize dictation, AI clinical assistance, and workflows</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Dictation Language */}
            <div className="flex items-center justify-between py-1">
              <div>
                <h3 className="font-semibold text-slate-800">Default Speech Dictation Language</h3>
                <p className="text-[11px] text-slate-500">Primary spoken language used during clinical note dictation</p>
              </div>
              <select
                value={dictationLanguage}
                onChange={(e) => setDictationLanguage(e.target.value as "Hindi" | "English" | "Hinglish")}
                className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-750"
              >
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="English">English</option>
                <option value="Hinglish">Hinglish (Mixed)</option>
              </select>
            </div>

            {/* Auto-save Notes */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800">Auto-save Clinical Notes</h3>
                <p className="text-[11px] text-slate-500">Automatically persist clinical assessment progress locally</p>
              </div>
              <button
                onClick={() => setAutoSaveNotes(!autoSaveNotes)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                  autoSaveNotes ? "bg-[#00594C]" : "bg-slate-300"
                }`}
                type="button"
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    autoSaveNotes ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Default Test Category */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800">Default Test Category Tab</h3>
                <p className="text-[11px] text-slate-500">Initial tab selected when ordering investigations</p>
              </div>
              <select
                value={defaultTestFilter}
                onChange={(e) => setDefaultTestFilter(e.target.value)}
                className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-750"
              >
                <option value="Common OPD">Common OPD</option>
                <option value="Blood Tests">Blood Tests</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="Ultrasound & X-Ray">Ultrasound & X-Ray</option>
                <option value="Cardiac / ECG">Cardiac / ECG</option>
                <option value="Renal & Liver">Renal & Liver</option>
              </select>
            </div>

            {/* AI Differential Suggestions */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800">AI Differential Diagnosis Suggestions</h3>
                <p className="text-[11px] text-slate-500">Display AI clinical suggestions on assessment workspace</p>
              </div>
              <button
                onClick={() => setEnableAiSuggestions(!enableAiSuggestions)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                  enableAiSuggestions ? "bg-[#00594C]" : "bg-slate-300"
                }`}
                type="button"
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    enableAiSuggestions ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Audio & Notifications */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="pb-4 border-b border-slate-100 mb-4">
            <h2 className="text-xs font-bold text-slate-900 tracking-wide uppercase">Notifications & Alerts</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Control audio chimes and red flag clinical notifications</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Red Flag Alerts */}
            <div className="flex items-center justify-between py-1">
              <div>
                <h3 className="font-semibold text-slate-800">Emergency Red Flag Audio Alerts</h3>
                <p className="text-[11px] text-slate-500">Play alert sound when high-priority red flag symptoms detected</p>
              </div>
              <button
                onClick={() => setRedFlagAudioAlerts(!redFlagAudioAlerts)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                  redFlagAudioAlerts ? "bg-[#00594C]" : "bg-slate-300"
                }`}
                type="button"
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    redFlagAudioAlerts ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Patient Queue Chime */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800">Patient Arrival Chime</h3>
                <p className="text-[11px] text-slate-500">Play subtle chime when a new patient checks into OPD queue</p>
              </div>
              <button
                onClick={() => setPatientQueueChime(!patientQueueChime)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                  patientQueueChime ? "bg-[#00594C]" : "bg-slate-300"
                }`}
                type="button"
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    patientQueueChime ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Daily Email Digest */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800">End-of-Day OPD Summary Digest</h3>
                <p className="text-[11px] text-slate-500">Receive email summary of completed consultations at shift end</p>
              </div>
              <button
                onClick={() => setDailyEmailDigest(!dailyEmailDigest)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                  dailyEmailDigest ? "bg-[#00594C]" : "bg-slate-300"
                }`}
                type="button"
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    dailyEmailDigest ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Section 4: Workspace Appearance */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="pb-4 border-b border-slate-100 mb-4">
            <h2 className="text-xs font-bold text-slate-900 tracking-wide uppercase">Workspace Appearance</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Interface theme and layout density options</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Theme Select */}
            <div className="flex items-center justify-between py-1">
              <div>
                <h3 className="font-semibold text-slate-800">Interface Theme</h3>
                <p className="text-[11px] text-slate-500">Choose preferred clinical UI color theme</p>
              </div>
              <div className="flex items-center gap-1.5">
                {(["light", "dark", "system"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setThemeMode(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border capitalize transition-colors ${
                      themeMode === t
                        ? "bg-[#00594C] text-white border-[#00594C]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                    type="button"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Density */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800">Compact Table & Card Density</h3>
                <p className="text-[11px] text-slate-500">Reduce padding for higher information density on large screens</p>
              </div>
              <button
                onClick={() => setCompactDensity(!compactDensity)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                  compactDensity ? "bg-[#00594C]" : "bg-slate-300"
                }`}
                type="button"
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    compactDensity ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end gap-3 pt-2 pb-6">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
            type="button"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-[#00594C] hover:bg-[#004A3F] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            type="button"
          >
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
}
