"use client";

import React from "react";
import { Bookmark, BookmarkCheck, FlipHorizontal2, Info } from "lucide-react";

export default function Flashcard({ card, isFlipped, onFlip, isTricky, onToggleTricky }) {
  if (!card) return null;

  const trickyButton = (onBack = false) => (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggleTricky(card.id);
      }}
      aria-label={isTricky ? "Remove tricky mark" : "Mark card as tricky"}
      title={isTricky ? "Marked as tricky" : "Mark card as tricky"}
      className={`flex min-h-10 items-center gap-1.5 rounded-[var(--radius-md)] border px-2.5 text-xs font-semibold transition-colors duration-150 ${
        isTricky
          ? "border-[var(--warning)]/30 bg-[var(--warning-bg)] text-[var(--warning)]"
          : `border-[var(--border)] bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--warning)] ${onBack ? "" : ""}`
      }`}
    >
      {isTricky ? <BookmarkCheck size={15} aria-hidden="true" /> : <Bookmark size={15} aria-hidden="true" />}
      <span className="hidden sm:inline">{isTricky ? "Tricky" : "Mark tricky"}</span>
    </button>
  );

  return (
    <div className="perspective-1000 mx-auto w-full max-w-xl lg:col-start-2 lg:row-start-2 lg:self-center">
      <div
        onClick={onFlip}
        tabIndex={0}
        role="button"
        aria-label={`Flashcard: ${isFlipped ? "Answer" : "Question"}. Click to flip.`}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            onFlip();
          }
        }}
        style={{ transitionDuration: "var(--dur-slow)", transitionTimingFunction: "var(--ease-spring)" }}
        className={`transform-style-3d relative h-80 w-full cursor-pointer select-none rounded-[var(--radius-xl)] transition-transform sm:h-96 ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        <div className="backface-hidden absolute inset-0 flex h-full w-full flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--border-card)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-[var(--primary)]">
              <Info size={13} aria-hidden="true" /> Question
            </span>
            {trickyButton()}
          </div>

          <div className="custom-scrollbar my-auto max-h-52 overflow-y-auto py-4 text-center sm:max-h-60">
            <h3 className="font-[var(--font-display)] text-2xl leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-[var(--fg)] sm:text-3xl">
              {card.front}
            </h3>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-2 text-xs font-medium text-[var(--fg-muted)]">
            <FlipHorizontal2 size={14} aria-hidden="true" />
            Click or press Space to flip
          </div>
        </div>

        <div className="backface-hidden rotate-y-180 absolute inset-0 flex h-full w-full flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--accent)]/25 bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border border-[var(--accent)]/25 bg-[var(--bg-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-[var(--accent)]">
              <Info size={13} aria-hidden="true" /> Answer
            </span>
            {trickyButton(true)}
          </div>

          <div className="custom-scrollbar my-auto max-h-52 overflow-y-auto py-4 text-center sm:max-h-60">
            <p className="font-[var(--font-display)] text-lg leading-[var(--leading-relaxed)] text-[var(--fg)] sm:text-xl">
              {card.back}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-2 text-xs font-medium text-[var(--fg-muted)]">
            <FlipHorizontal2 size={14} aria-hidden="true" />
            Click or press Space to see the question
          </div>
        </div>
      </div>
    </div>
  );
}
