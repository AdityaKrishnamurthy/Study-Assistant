"use client";

import React, { useEffect, useState } from "react";
import { Layers, ListChecks, LoaderCircle, RefreshCw } from "lucide-react";

export default function LoadingState({ mode = "flashcards" }) {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  const isFlashcards = mode === "flashcards";

  return (
    <div className="w-full max-w-lg space-y-6 rounded-[var(--radius-xl)] border border-[var(--border-card)] bg-[var(--bg-card)] p-8 text-center shadow-[var(--shadow-lg)]">
      <div className="mx-auto grid size-16 place-items-center rounded-[var(--radius-full)] bg-[var(--bg-muted)] text-[var(--primary)]">
        <LoaderCircle size={34} className="animate-spin" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 text-[var(--primary)]">
          {isFlashcards ? <Layers size={16} aria-hidden="true" /> : <ListChecks size={16} aria-hidden="true" />}
          <span className="text-xs font-semibold uppercase tracking-[var(--tracking-wide)]">Preparing your study set</span>
        </div>
        <h3 className="font-[var(--font-display)] text-xl text-[var(--fg)]">Building your {isFlashcards ? "flashcard deck" : "quiz"}...</h3>
        <p className="text-sm leading-[var(--leading-relaxed)] text-[var(--fg-muted)]">
          {isSlow ? "Still working through your material and shaping each prompt." : "Reading your notes and structuring material for active recall."}
        </p>
      </div>
      <div className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-input)] p-4 text-left">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--bg-muted)]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--bg-muted)]" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-[var(--bg-muted)]" />
      </div>
      {isSlow && <div className="animate-fade-in inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border border-[var(--warning)]/20 bg-[var(--warning-bg)] px-3 py-1 text-xs font-medium text-[var(--warning)]"><RefreshCw size={13} aria-hidden="true" /> Taking a little longer than usual</div>}
    </div>
  );
}
