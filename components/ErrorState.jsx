"use client";

import React from "react";
import { RefreshCw, RotateCcw, TriangleAlert } from "lucide-react";

const ERROR_MESSAGES = {
  parse: "We couldn’t read the study deck that was returned. Try again.",
  shape: "We couldn’t read the study deck that was returned. Try again.",
  timeout: "This took too long. Try again.",
  rate_limit: "Too many requests were made. Wait a moment, then try again.",
  network: "Your connection interrupted the request. Check it, then try again.",
  provider_error: "The study service is temporarily unavailable. Try again in a moment.",
};

export default function ErrorState({ kind = "network", customMessage, onRetry, onReset }) {
  const displayMessage = ERROR_MESSAGES[kind] || customMessage || "Something unexpected happened. Try again.";

  return (
    <div className="w-full max-w-md space-y-6 rounded-[var(--radius-xl)] border border-[var(--error)]/30 bg-[var(--bg-card)] p-6 text-center shadow-[var(--shadow-md)] sm:p-8">
      <div className="mx-auto grid size-16 place-items-center rounded-[var(--radius-full)] border border-[var(--error)]/20 bg-[var(--error-bg)] text-[var(--error)]"><TriangleAlert size={32} aria-hidden="true" /></div>
      <div className="space-y-2">
        <h3 className="font-[var(--font-display)] text-xl text-[var(--fg)]">Couldn’t create your deck</h3>
        <p className="text-sm leading-[var(--leading-relaxed)] text-[var(--fg-muted)]">{displayMessage}</p>
        {kind && <p className="pt-1 font-[var(--font-mono)] text-xs text-[var(--error)]">Error code: {kind}</p>}
      </div>
      <div className="flex flex-col justify-center gap-3 pt-1 sm:flex-row">
        {onRetry && <button type="button" onClick={onRetry} className="flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--error)] px-5 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90"><RefreshCw size={16} aria-hidden="true" /> Try again</button>}
        {onReset && <button type="button" onClick={onReset} className="flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-muted)] px-5 text-sm font-semibold text-[var(--fg)] transition-colors duration-150 hover:border-[var(--primary)]"><RotateCcw size={16} aria-hidden="true" /> Edit notes</button>}
      </div>
    </div>
  );
}
