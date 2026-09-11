import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { Button } from "./Button";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export function LoadingState({
  message = "Loading clinical records...",
  className,
  ...props
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center",
        className
      )}
      {...props}
    >
      <Loader2 className="h-8 w-8 animate-spin text-[#005F4B]" />
      <p className="text-xs font-medium text-[#64748B]">{message}</p>
    </div>
  );
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "No records found",
  description = "There are currently no items to display in this queue.",
  actionLabel,
  onAction,
  icon,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F4EA] text-[#005F4B]">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <div className="max-w-xs">
        <h4 className="text-sm font-bold text-[#0F172A]">{title}</h4>
        <p className="mt-1 text-xs text-[#64748B] leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "Unable to load data",
  description = "A network or server error occurred. Please check connectivity.",
  onRetry,
  retryLabel = "Try Again",
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#FAECE9] bg-white p-8 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAECE9] text-[#C84B31]">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div className="max-w-xs">
        <h4 className="text-sm font-bold text-[#0F172A]">{title}</h4>
        <p className="mt-1 text-xs text-[#64748B] leading-relaxed">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
