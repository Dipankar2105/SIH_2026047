import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

export interface TopBarProps {
  appName?: string;
  subTitle?: string;
  userName?: string;
  userRole?: string;
  className?: string;
}

export function TopBar({
  appName = "AarogyaFlow",
  subTitle = "Ministry of AYUSH • ABDM Integrated",
  userName = "Dr. Rajesh Varma",
  userRole = "Doctor Console",
  className,
}: TopBarProps) {
  return (
    <header
      className={cn(
        "flex h-16 w-full items-center justify-between border-b border-[#E2E8F0] bg-white px-6 shadow-xs",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#005F4B] text-white shadow-xs font-bold text-sm">
            AF
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-[#0F172A] block leading-tight">
              {appName}
            </span>
            <span className="text-[10px] font-medium text-[#64748B] block">
              {subTitle}
            </span>
          </div>
        </Link>
        <Badge variant="default" className="hidden sm:inline-flex ml-2">
          ABDM Sandbox
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <span className="text-xs font-bold text-[#0F172A] block leading-tight">
            {userName}
          </span>
          <span className="text-[10px] text-[#64748B] block">{userRole}</span>
        </div>
        <Avatar name={userName} size="sm" />
      </div>
    </header>
  );
}

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface SidebarProps {
  items: SidebarItem[];
  activeId?: string;
  className?: string;
}

export function Sidebar({ items, activeId, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex w-64 flex-col border-r border-[#E2E8F0] bg-[#F8FAFC] p-4 text-[#0F172A]",
        className
      )}
    >
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors min-h-[40px]",
                isActive
                  ? "bg-[#E6F4EA] text-[#005F4B] shadow-xs"
                  : "text-[#64748B] hover:bg-white hover:text-[#0F172A]"
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="rounded-full bg-[#E2E8F0] px-2 py-0.5 text-[10px] font-bold text-[#475569]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
