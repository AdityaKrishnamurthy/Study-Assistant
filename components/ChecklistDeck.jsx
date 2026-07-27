"use client";

import React, { useState } from "react";
import { Check, CheckSquare, ListTodo, RotateCcw, Sparkles } from "lucide-react";

/**
 * @typedef {import('@/lib/schema').Deck & { mode: 'checklist' }} ChecklistDeckType
 * @param {{ deck: ChecklistDeckType; onReset: () => void }} props
 */
export default function ChecklistDeck({ deck, onReset }) {
  const [checkedIds, setCheckedIds] = useState(/** @type {Set<string>} */ (new Set()));

  if (!deck || !Array.isArray(deck.items)) return null;

  const items = deck.items;
  const totalItems = items.length;
  const checkedCount = checkedIds.size;
  const isComplete = totalItems > 0 && checkedCount === totalItems;
  const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const toggleItem = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleResetChecklist = () => {
    setCheckedIds(new Set());
  };

  return (
    <div className="flex flex-col h-full min-h-0 w-full max-w-2xl space-y-2 sm:space-y-3 lg:max-w-3xl">
      {/* Header Box */}
      <div className="flex shrink-0 items-center justify-between gap-2 rounded-[var(--radius-lg)] border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2 sm:px-4 sm:py-3 shadow-[var(--shadow-sm)]">
        <div className="min-w-0">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-[var(--primary)]">
            <ListTodo size={14} aria-hidden="true" /> Study Checklist
          </span>
          <h2 className="mt-0.5 truncate font-[var(--font-display)] text-base sm:text-lg lg:text-xl font-medium leading-[var(--leading-tight)] text-[var(--fg)]">
            {deck.topic}
          </h2>
        </div>
        <div className="flex items-center gap-2 self-center">
          <button
            type="button"
            onClick={onReset}
            className="min-h-9 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] px-3 text-xs font-semibold text-[var(--fg-muted)] transition-colors duration-150 hover:text-[var(--primary)]"
          >
            Edit notes
          </button>
        </div>
      </div>

      {/* Progress Bar Header */}
      <div className="shrink-0 space-y-1.5">
        <div className="flex items-center justify-between px-1 font-[var(--font-mono)] text-xs text-[var(--fg-muted)]">
          <span>{checkedCount} of {totalItems} reviewed</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-[var(--radius-full)] bg-[var(--bg-muted)]">
          <div
            className="h-full rounded-[var(--radius-full)] bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Checklist Card & Items */}
      <div className="flex-1 min-h-0 flex flex-col rounded-[var(--radius-xl)] border border-[var(--border-card)] bg-[var(--bg-card)] p-3 sm:p-4 lg:p-6 shadow-[var(--shadow-md)] overflow-hidden">
        {isComplete ? (
          <div className="animate-fade-in flex flex-1 flex-col items-center justify-center text-center p-4 space-y-4">
            <div className="mx-auto grid size-16 place-items-center rounded-[var(--radius-full)] bg-[var(--success-bg)] text-[var(--success)]">
              <Sparkles size={32} aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="font-[var(--font-display)] text-xl font-semibold text-[var(--fg)]">
                Checklist Complete! 🎉
              </h3>
              <p className="text-xs sm:text-sm text-[var(--fg-muted)] max-w-sm">
                You've reviewed all {totalItems} concepts in this study checklist. Great job!
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetChecklist}
                className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-xs sm:text-sm font-semibold text-[var(--fg)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <RotateCcw size={14} aria-hidden="true" /> Reset checklist
              </button>
              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--primary-hover)]"
              >
                New deck
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 custom-scrollbar space-y-2.5 overflow-y-auto pr-1">
            {items.map((item, index) => {
              const isChecked = checkedIds.has(item.id);
              return (
                <div
                  key={item.id || index}
                  onClick={() => toggleItem(item.id)}
                  tabIndex={0}
                  role="checkbox"
                  aria-checked={isChecked}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      toggleItem(item.id);
                    }
                  }}
                  className={`group flex items-start gap-3 rounded-[var(--radius-lg)] border p-3 cursor-pointer transition-all duration-150 ${
                    isChecked
                      ? "border-[var(--border)] bg-[var(--bg-muted)]/50 opacity-75"
                      : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--primary)] shadow-[var(--shadow-sm)]"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-colors ${
                      isChecked
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                        : "border-[var(--border)] bg-[var(--bg-input)] group-hover:border-[var(--primary)]"
                    }`}
                  >
                    {isChecked && <Check size={13} strokeWidth={3} aria-hidden="true" />}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <h4
                      className={`text-xs sm:text-sm font-semibold leading-[var(--leading-tight)] transition-colors ${
                        isChecked ? "text-[var(--fg-muted)] line-through" : "text-[var(--fg)]"
                      }`}
                    >
                      {item.title}
                    </h4>
                    <p
                      className={`text-xs leading-[var(--leading-relaxed)] transition-colors ${
                        isChecked ? "text-[var(--fg-muted)]/70" : "text-[var(--fg-muted)]"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
