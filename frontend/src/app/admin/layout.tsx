"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  CalendarDays,
  ClipboardList,
  Clock3,
  Hospital,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldAlert,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import {
  clearAdminSession,
  getAdminSession,
  type AdminSession,
} from "@/types/admin";

const navigation = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-[18px] w-[18px]" />,
  },
  {
    id: "alerts",
    label: "Priority Alerts",
    href: "/admin/alerts",
    icon: <ShieldAlert className="h-[18px] w-[18px]" />,
    badge: "3",
  },
  {
    id: "queue",
    label: "Queue",
    href: "/admin/queue",
    icon: <ClipboardList className="h-[18px] w-[18px]" />,
  },
];

function titleForPath(pathname: string) {
  if (pathname === "/admin/alerts") return "Priority Alerts";
  if (pathname === "/admin/queue") return "Live Queue";
  return "Hospital Operations Dashboard";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeId = pathname === "/admin/alerts" ? "alerts" : pathname === "/admin/queue" ? "queue" : "dashboard";

  useEffect(() => {
    if (pathname === "/admin/login") {
      setChecking(false);
      return;
    }

    const currentSession = getAdminSession();
    setSession(currentSession);
    if (!currentSession) {
      clearAdminSession();
      router.replace("/admin/login");
    }
    setChecking(false);
  }, [pathname, router]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const time = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const date = now.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const hospitalName = session?.hospital_name || "Hospital";
  const receptionistName = session?.receptionist_name || "Receptionist";

  const handleLogout = () => {
    clearAdminSession();
    setSession(null);
    router.replace("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checking || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F7F9] text-[#172033]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[260px] transform border-r border-[#E5EAF0] bg-white transition-transform duration-200 ease-in-out lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[76px] items-center justify-between border-b border-[#EDF1F5] px-5">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#087E6A] text-sm font-extrabold text-white shadow-sm">
                AF
              </span>
              <span>
                <span className="block text-[15px] font-extrabold tracking-tight text-[#172033]">AarogyaFlow</span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-[#8490A2]">Hospital OS</span>
              </span>
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-[#8490A2] hover:bg-[#F3F6F8] lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
            <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#A0AAB8]">Operations</p>
            {navigation.map((item) => {
              const active = activeId === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "group flex min-h-[44px] items-center justify-between rounded-xl px-3 text-[13px] font-semibold transition-colors",
                    active
                      ? "bg-[#E7F5F0] text-[#087E6A]"
                      : "text-[#69758A] hover:bg-[#F6F8FA] hover:text-[#172033]"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className={cn("text-[#9AA6B5]", active && "text-[#087E6A]")}>{item.icon}</span>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={cn(
                      "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                      active ? "bg-[#087E6A] text-white" : "bg-[#FDECEC] text-[#C94C4C]"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="mt-8 px-3">
              <p className="pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#A0AAB8]">Facilities</p>
              <div className="space-y-1 text-[13px] font-medium text-[#8490A2]">
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                  <Hospital className="h-[18px] w-[18px]" />
                  {hospitalName}
                </div>
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                  <Activity className="h-[18px] w-[18px]" />
                  OPD Performance
                </div>
              </div>
            </div>
          </nav>

          <div className="border-t border-[#EDF1F5] p-3">
            <div className="flex items-center gap-3 rounded-xl bg-[#F7F9FB] p-3">
              <Avatar name={receptionistName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-[#172033]">{receptionistName}</p>
                <p className="truncate text-[10px] font-medium text-[#8490A2]">Receptionist</p>
              </div>
              <button type="button" onClick={handleLogout} className="rounded-lg p-1.5 text-[#8490A2] hover:bg-white" aria-label="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && <button type="button" className="fixed inset-0 z-30 bg-[#172033]/30 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" />}

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-20 border-b border-[#E5EAF0] bg-white/95 backdrop-blur">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="rounded-lg p-2 text-[#69758A] hover:bg-[#F3F6F8] lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#087E6A]">Hospital Administration</p>
                <h1 className="truncate text-[17px] font-extrabold tracking-tight text-[#172033] sm:text-[19px]">{titleForPath(pathname)}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFB] px-3 py-2 md:flex">
                <Hospital className="h-4 w-4 text-[#087E6A]" />
                <div className="leading-tight">
                  <p className="max-w-[220px] truncate text-[10px] font-semibold text-[#69758A]">{hospitalName}</p>
                  <p className="text-[11px] font-bold text-[#172033]">Active facility</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#E5EAF0] bg-[#F8FAFB] px-3 py-2">
                <Clock3 className="h-4 w-4 text-[#087E6A]" />
                <div className="leading-tight">
                  <p className="text-[11px] font-bold text-[#172033]">{time}</p>
                  <p className="flex items-center gap-1 text-[10px] font-medium text-[#8490A2]"><CalendarDays className="h-3 w-3" />{date}</p>
                </div>
              </div>
              <button type="button" className="relative rounded-xl border border-[#E5EAF0] bg-white p-2.5 text-[#69758A] hover:bg-[#F7F9FB]" aria-label="Notifications">
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#E5484D] ring-2 ring-white" />
              </button>
              <div className="flex items-center gap-2 border-l border-[#E5EAF0] pl-2 sm:pl-3">
                <Avatar name={receptionistName} size="sm" />
                <div className="hidden leading-tight md:block">
                  <p className="max-w-[140px] truncate text-[11px] font-bold text-[#172033]">{receptionistName}</p>
                  <p className="text-[10px] font-medium text-[#8490A2]">Receptionist</p>
                </div>
                <button type="button" onClick={handleLogout} className="ml-1 hidden items-center gap-1.5 rounded-lg border border-[#E5EAF0] bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#69758A] hover:bg-[#F7F9FB] lg:inline-flex" aria-label="Logout">
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-3 border-t border-[#E5EAF0] bg-white px-2 py-1.5 lg:hidden">
        {navigation.map((item) => {
          const active = activeId === item.id;
          return (
            <Link key={item.id} href={item.href} className={cn("flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold", active ? "text-[#087E6A]" : "text-[#8490A2]")}>
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
