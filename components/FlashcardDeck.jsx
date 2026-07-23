// components/FlashcardDeck.jsx — Container managing flashcard navigation, keyboard shortcuts, and state
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Flashcard from "./Flashcard";

export default function FlashcardDeck({ deck, onReset }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [trickyCardIds, setTrickyCardIds] = useState(new Set());
  const [filterTrickyOnly, setFilterTrickyOnly] = useState(false);

  const rawCards = deck?.cards || [];

  // Filter cards if "Tricky Only" filter is active
  const activeCards = filterTrickyOnly
    ? rawCards.filter((card) => trickyCardIds.has(card.id))
    : rawCards;

  const currentCard = activeCards[currentIndex] || null;
  const totalCards = activeCards.length;

  const handleNext = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, totalCards]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleToggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleToggleTricky = useCallback((cardId) => {
    setTrickyCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept keypresses if user is typing inside an input/textarea
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === " ") {
        e.preventDefault();
        handleToggleFlip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, handleToggleFlip]);

  // Handle empty state if filtering tricky cards when none marked
  if (filterTrickyOnly && activeCards.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto p-8 bg-slate-900/90 rounded-2xl border border-slate-800 text-center space-y-4">
        <span className="text-4xl">⭐</span>
        <h3 className="text-xl font-bold text-white">No Tricky Cards Marked</h3>
        <p className="text-sm text-slate-400">
          Click &quot;☆ Mark Tricky&quot; on any card to review it separately.
        </p>
        <button
          onClick={() => setFilterTrickyOnly(false)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all"
        >
          View All Cards ({rawCards.length})
        </button>
      </div>
    );
  }

  const progressPercent = totalCards > 0 ? Math.round(((currentIndex + 1) / totalCards) * 100) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            🎴 Flashcard Deck
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight leading-snug">{deck.topic}</h2>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {trickyCardIds.size > 0 && (
            <button
              onClick={() => {
                setFilterTrickyOnly(!filterTrickyOnly);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTrickyOnly
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
              }`}
            >
              ⭐ {filterTrickyOnly ? "Show All" : `Tricky Only (${trickyCardIds.size})`}
            </button>
          )}

          <button
            onClick={onReset}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
          >
            Edit Notes
          </button>
        </div>
      </div>

      {/* Progress Bar & Counter */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400 px-1">
          <span>Card {currentIndex + 1} of {totalCards}</span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Interactive 3D Card Display */}
      {currentCard && (
        <Flashcard
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={handleToggleFlip}
          isTricky={trickyCardIds.has(currentCard.id)}
          onToggleTricky={handleToggleTricky}
        />
      )}

      {/* Navigation Buttons & Keyboard Hints */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <span>←</span>
          <span>Previous</span>
        </button>

        <button
          onClick={handleToggleFlip}
          className="px-5 py-3.5 rounded-xl font-semibold text-sm text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all flex items-center justify-center gap-1.5"
        >
          <span>🔄</span>
          <span className="hidden sm:inline">Flip</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === totalCards - 1}
          className="flex-1 py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <span>Next</span>
          <span>→</span>
        </button>
      </div>

      {/* Keyboard Shortcuts Hint Bar */}
      <div className="hidden sm:flex items-center justify-center gap-6 text-[11px] font-medium text-slate-500 pt-2">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">Space</kbd> Flip
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">←</kbd> Previous
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">→</kbd> Next
        </span>
      </div>
    </div>
  );
}
