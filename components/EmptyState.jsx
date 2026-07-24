"use client";

import React from "react";
import { Inbox, RefreshCw, RotateCcw } from "lucide-react";

export default function EmptyState({ onRetry, onReset }) {
  return (
    <div className="w-full max-w-md space-y-6 rounded-[var(--radius-xl)] border border-[var(--border-card)] bg-[var(--bg-card)] p-6 text-center shadow-[var(--shadow-md)] sm:p-8">
      <div className="mx-auto grid size-16 place-items-center rounded-[var(--radius-full)] border border-[var(--border)] bg-[var(--bg-muted)] text-[var(--fg-muted)]"><Inbox size={32} aria-hidden="true" /></div>
      <div className="space-y-2">
        <h3 className="font-[var(--font-display)] text-xl text-[var(--fg)]">No study items yet</h3>
        <p className="text-sm leading-[var(--leading-relaxed)] text-[var(--fg-muted)]">Try adding more detail or rephrasing your notes, then create a new deck.</p>
      </div>
      <div className="flex flex-col justify-center gap-3 pt-1 sm:flex-row">
        {onReset && <button type="button" onClick={onReset} className="flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[var(--primary-hover)]"><RotateCcw size={16} aria-hidden="true" /> Try different notes</button>}
        {onRetry && <button type="button" onClick={onRetry} className="flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-muted)] px-5 text-sm font-semibold text-[var(--fg)] transition-colors duration-150 hover:border-[var(--primary)]"><RefreshCw size={16} aria-hidden="true" /> Retry same input</button>}
      </div>
    </div>
  );
}
