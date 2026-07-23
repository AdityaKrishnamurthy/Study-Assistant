// components/Flashcard.jsx — Interactive 3D Flip Card Component
"use client";

import React from "react";

export default function Flashcard({
  card,
  isFlipped,
  onFlip,
  isTricky,
  onToggleTricky,
}) {
  if (!card) return null;

  return (
    <div className="w-full max-w-xl mx-auto perspective-1000">
      <div
        onClick={onFlip}
        tabIndex={0}
        role="button"
        aria-label={`Flashcard: ${isFlipped ? "Answer" : "Question"}. Click to flip.`}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onFlip();
          }
        }}
        className={`relative w-full h-[320px] sm:h-[360px] rounded-2xl cursor-pointer select-none transition-transform duration-500 transform-style-3d shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* FRONT SIDE */}
        <div className="absolute inset-0 w-full h-full rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-indigo-500/30 flex flex-col justify-between backface-hidden shadow-indigo-500/10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 rounded-full border border-indigo-500/20">
              <span>❓</span> Question
            </span>

            {/* Tricky Star Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleTricky(card.id);
              }}
              title={isTricky ? "Marked as tricky" : "Mark card as tricky"}
              className={`p-2 rounded-lg text-sm transition-all ${
                isTricky
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-slate-800/60 text-slate-400 hover:text-amber-300 hover:bg-slate-800"
              }`}
            >
              {isTricky ? "⭐ Tricky" : "☆ Mark Tricky"}
            </button>
          </div>

          <div className="my-auto py-2 text-center overflow-y-auto max-h-[180px] sm:max-h-[220px] break-words custom-scrollbar">
            <h3 className="text-xl sm:text-2xl font-bold text-white leading-relaxed tracking-tight">
              {card.front}
            </h3>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 animate-pulse pt-2 shrink-0">
            <span>🔄</span>
            <span>Click or press Space to flip</span>
          </div>
        </div>

        {/* BACK SIDE */}
        <div className="absolute inset-0 w-full h-full rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-purple-500/30 flex flex-col justify-between backface-hidden rotate-y-180 shadow-purple-500/10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 rounded-full border border-purple-500/20">
              <span>💡</span> Answer
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleTricky(card.id);
              }}
              className={`p-2 rounded-lg text-sm transition-all ${
                isTricky
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-slate-800/60 text-slate-400 hover:text-amber-300 hover:bg-slate-800"
              }`}
            >
              {isTricky ? "⭐ Tricky" : "☆ Mark Tricky"}
            </button>
          </div>

          <div className="my-auto py-2 text-center overflow-y-auto max-h-[180px] sm:max-h-[220px] break-words custom-scrollbar">
            <p className="text-lg sm:text-xl font-medium text-slate-100 leading-relaxed">
              {card.back}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-purple-400">
            <span>🔄</span>
            <span>Click or press Space to see question</span>
          </div>
        </div>
      </div>
    </div>
  );
}
