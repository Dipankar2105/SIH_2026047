"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/queue": "Patient Queue",
  "/active-consultation": "Active Consultation",
  "/patient-records": "Patient Records",
  "/tests": "Tests",
  "/prescriptions": "Prescriptions",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/queue/")) {
    if (pathname.includes("/assessment")) return "Clinical Assessment";
    if (pathname.includes("/priority-review")) return "Priority Review";
    if (pathname.includes("/pre-brief")) return "Pre-Consultation Brief";
    if (pathname.includes("/ai-history")) return "AI History";
    if (pathname.includes("/consultation")) return "Consultation";
    return "Patient Queue";
  }
  return PAGE_TITLES[pathname] ?? "AarogyaFlow";
}

export default function ClinicalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const headerTitle = getPageTitle(pathname);

  const isActive = (href: string) => pathname === href;
  const isQueueActive = pathname === "/queue";
  const isConsultationActive =
    pathname === "/active-consultation" || pathname.startsWith("/queue/");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-30 select-none">
        <div>
          {/* Brand */}
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="AarogyaFlow Logo" className="w-8 h-8 object-contain shrink-0 rounded" />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#00594C] leading-none">AarogyaFlow</h1>
                <p className="text-[10px] font-semibold tracking-wider text-slate-400 mt-1 leading-none">CLINICAL EDITION</p>
              </div>
            </div>
          </div>
          {/* Navigation */}
          <nav className="px-3 space-y-1" aria-label="Sidebar Navigation">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive("/dashboard")
                  ? "bg-[#E6F4F1] text-[#00594C] font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
              <span>Dashboard</span>
            </Link>
            <Link
              href="/queue"
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isQueueActive
                  ? "bg-[#E6F4F1] text-[#00594C] font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Patient Queue</span>
              </div>
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                isQueueActive ? "bg-[#00594C] text-white" : "bg-slate-400 text-white"
              }`}>
                5
              </span>
            </Link>
            <Link
              href="/active-consultation"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isConsultationActive
                  ? "bg-[#E6F4F1] text-[#00594C] font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Active Consultation</span>
            </Link>
            <Link
              href="/patient-records"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive("/patient-records")
                  ? "bg-[#E6F4F1] text-[#00594C] font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Patient Records</span>
            </Link>
            <Link
              href="/tests"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive("/tests")
                  ? "bg-[#E6F4F1] text-[#00594C] font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Tests</span>
            </Link>
            <Link
              href="/prescriptions"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive("/prescriptions")
                  ? "bg-[#E6F4F1] text-[#00594C] font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Prescriptions</span>
            </Link>
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive("/settings")
                  ? "bg-[#E6F4F1] text-[#00594C] font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 001.066-2.573c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Settings</span>
            </Link>
          </nav>
        </div>
        {/* User Profile */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E6F4F1] border border-emerald-100 flex items-center justify-center font-semibold text-xs text-[#00594C] shrink-0">
              DS
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 leading-tight truncate">
                Dr. A. Sharma
              </p>
              <p className="text-[11px] text-slate-500 leading-normal truncate">
                City Hospital · OPD 14
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20 shrink-0">
          <h2 className="text-base font-semibold text-slate-800">{headerTitle}</h2>
          <div className="flex items-center gap-5">
            <div className="relative w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <input
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00594C] focus:border-[#00594C] placeholder-slate-400"
                placeholder="Search by ABHA ID or name..."
              />
            </div>
            <span className="text-xs font-medium text-slate-600">10:42 AM</span>
            <button aria-label="Notifications" className="relative text-slate-400 hover:text-slate-600 transition" type="button">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#E6F4F1] border border-emerald-100 flex items-center justify-center font-semibold text-xs text-[#00594C] cursor-pointer">
              DS
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}