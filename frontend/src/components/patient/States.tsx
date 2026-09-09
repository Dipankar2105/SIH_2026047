import React from "react";
import { AlertCircle, FileQuestion, RefreshCw } from "lucide-react";
import { PrimaryButton } from "./PrimaryButton";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading information..." }: LoadingStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-full border-3 border-[#005F4B]/20 border-t-[#005F4B] animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <FileQuestion className="w-7 h-7 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="w-full max-w-[200px]">
          <PrimaryButton onClick={onAction}>{actionLabel}</PrimaryButton>
        </div>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please check your network connection and try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-4">
        <AlertCircle className="w-7 h-7 stroke-[1.8]" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-6">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005F4B] text-white text-xs font-semibold hover:bg-[#004D3D] transition active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
