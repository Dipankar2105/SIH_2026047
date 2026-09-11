"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Search as SearchIcon, X } from "lucide-react";

export interface SearchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  (
    {
      className,
      value,
      onChange,
      onClear,
      placeholder = "Search by patient name, ABHA or Token...",
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("relative flex w-full items-center", className)}>
        <SearchIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#94A3B8]" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-11 w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-10 text-sm text-[#0F172A] placeholder-[#94A3B8] transition-colors",
            "focus:border-[#005F4B] focus:outline-none focus:ring-2 focus:ring-[#005F4B]/20"
          )}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              onClear?.();
            }}
            className="absolute right-3 rounded-md p-1 text-[#94A3B8] hover:text-[#0F172A]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Search.displayName = "Search";
