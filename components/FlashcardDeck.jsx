"use client";

import React, { useCallback, useEffect, useState } from "react";
import { BookmarkCheck, ChevronLeft, ChevronRight, FlipHorizontal2, Layers } from "lucide-react";
import Flashcard from "./Flashcard";

export default function FlashcardDeck({ deck, onReset }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [trickyCardIds, setTrickyCardIds] = useState(new Set());
  const [filterTrickyOnly, setFilterTrickyOnly] = useState(false);
  const rawCards = deck?.cards || [];
  const activeCards = filterTrickyOnly ? rawCards.filter((card) => trickyCardIds.has(card.id)) : rawCards;
  const currentCard = activeCards[currentIndex] || null;
  const totalCards = activeCards.length;

  const handleNext = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((previous) => previous + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, totalCards]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((previous) => previous - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleToggleFlip = useCallback(() => setIsFlipped((previous) => !previous), []);

  const handleToggleTricky = useCallback((cardId) => {
    setTrickyCardIds((previous) => {
      const next = new Set(previous);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrev();
      } else if (event.key === " ") {
        event.preventDefault();
        handleToggleFlip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, handleToggleFlip]);

  if (filterTrickyOnly && activeCards.length === 0) {
    return (
      <div className="w-full max-w-lg space-y-4 rounded-[var(--radius-xl)] border border-[var(--border-card)] bg-[var(--bg-card)] p-8 text-center shadow-[var(--shadow-md)]">
        <span className="mx-auto grid size-14 place-items-center rounded-[var(--radius-full)] bg-[var(--warning-bg)] text-[var(--warning)]"><BookmarkCheck size={28} aria-hidden="true" /></span>
        <h3 className="font-[var(--font-display)] text-xl text-[var(--fg)]">No tricky cards marked</h3>
        <p className="text-sm leading-[var(--leading-relaxed)] text-[var(--fg-muted)]">Mark any card as tricky to create a focused review set.</p>
        <button type="button" onClick={() => setFilterTrickyOnly(false)} className="min-h-11 rounded-[var(--radius-md)] bg-[var(--primary)] px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[var(--primary-hover)]">
          View all cards ({rawCards.length})
        </button>
      </div>
    );
  }

  const progressPercent = totalCards > 0 ? Math.round(((currentIndex + 1) / totalCards) * 100) : 0;

  return (
    <div className="flex flex-col h-full min-h-0 w-full max-w-2xl space-y-2 sm:space-y-3 lg:grid lg:h-full lg:min-h-0 lg:max-w-5xl lg:grid-cols-[minmax(14rem,17rem)_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)_auto] lg:gap-6 lg:space-y-0">
      <div className="flex shrink-0 items-center justify-between gap-2 rounded-[var(--radius-lg)] border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2 sm:px-4 sm:py-3 lg:col-span-2 lg:row-start-1 lg:h-fit">
        <div className="min-w-0">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-[var(--primary)]"><Layers size={14} aria-hidden="true" /> Flashcard deck</span>
          <h2 className="mt-0.5 break-words font-[var(--font-display)] text-base sm:text-lg lg:text-xl font-medium leading-[var(--leading-tight)] text-[var(--fg)]">{deck.topic}</h2>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {trickyCardIds.size > 0 && (
            <button
              type="button"
              onClick={() => {
                setFilterTrickyOnly(!filterTrickyOnly);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`reveal-pop flex min-h-11 items-center gap-1.5 rounded-[var(--radius-md)] border px-3 text-xs font-semibold transition-colors duration-150 ${
                filterTrickyOnly ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--warning)]/30 bg-[var(--warning-bg)] text-[var(--warning)]"
              }`}
            >
              <BookmarkCheck size={15} aria-hidden="true" />
              {filterTrickyOnly ? "Show all" : `Tricky only (${trickyCardIds.size})`}
            </button>
          )}
          <button type="button" onClick={onReset} className="min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] px-3 text-xs font-semibold text-[var(--fg-muted)] transition-colors duration-150 hover:text-[var(--primary)]">
            Edit notes
          </button>
        </div>
      </div>

      <div className="space-y-2 lg:col-start-1 lg:row-start-2 lg:self-start">
        <div className="flex items-center justify-between px-1 font-[var(--font-mono)] text-xs text-[var(--fg-muted)]">
          <span>Card {currentIndex + 1} of {totalCards}</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-[var(--radius-full)] bg-[var(--bg-muted)]">
          <div className="h-full rounded-[var(--radius-full)] bg-[var(--primary)] transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {currentCard && <Flashcard card={currentCard} isFlipped={isFlipped} onFlip={handleToggleFlip} isTricky={trickyCardIds.has(currentCard.id)} onToggleTricky={handleToggleTricky} />}

      <div className="flex items-center justify-between gap-3 pt-2 lg:col-start-2 lg:row-start-3 lg:mx-auto lg:w-full lg:max-w-xl lg:pt-0">
        <button type="button" onClick={handlePrev} disabled={currentIndex === 0} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-card)] bg-[var(--bg-card)] px-4 text-sm font-semibold text-[var(--fg)] shadow-[var(--shadow-sm)] transition-colors duration-150 hover:bg-[var(--bg-muted)] disabled:cursor-not-allowed disabled:opacity-40">
          <ChevronLeft size={18} aria-hidden="true" /><span>Previous</span>
        </button>
        <button type="button" onClick={handleToggleFlip} className="flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-muted)] px-4 text-sm font-semibold text-[var(--fg)] transition-colors duration-150 hover:border-[var(--primary)]">
          <FlipHorizontal2 size={18} aria-hidden="true" /><span className="hidden sm:inline">Flip</span>
        </button>
        <button type="button" onClick={handleNext} disabled={currentIndex === totalCards - 1} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-colors duration-150 hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-40">
          <span>Next</span><ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="hidden items-center justify-center gap-5 pt-1 text-[11px] font-medium text-[var(--fg-muted)] sm:flex lg:col-start-1 lg:row-start-3 lg:flex-col lg:items-start lg:justify-end lg:gap-2 lg:pt-0">
        <span className="flex items-center gap-1"><kbd className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-muted)] px-1.5 py-0.5">Space</kbd> Flip</span>
        <span className="flex items-center gap-1"><kbd className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-muted)] px-1.5 py-0.5">←</kbd> Previous</span>
        <span className="flex items-center gap-1"><kbd className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-muted)] px-1.5 py-0.5">→</kbd> Next</span>
      </div>
    </div>
  );
}
