"use client";

import React, { useState } from "react";
import { History, Layers, ListChecks, ListTodo, LoaderCircle, Trash2, TriangleAlert } from "lucide-react";

/**
 * @typedef {import('@/lib/sessions').SavedSession} SavedSession
 * @param {{
 *   onGenerate: (topic: string, mode: import('@/lib/prompt').DeckMode) => void;
 *   isLoading: boolean;
 *   initialTopic?: string;
 *   initialMode?: import('@/lib/prompt').DeckMode;
 *   savedSessions?: SavedSession[];
 *   onLoadSession?: (session: SavedSession) => void;
 *   onDeleteSession?: (id: string) => void;
 *   onClearSessions?: () => void;
 * }} props
 */
export default function InputScreen({
  onGenerate,
  isLoading,
  initialTopic = "",
  initialMode = "flashcards",
  savedSessions = /** @type {SavedSession[]} */ ([]),
  onLoadSession,
  onDeleteSession,
  onClearSessions,
}) {
  const [topic, setTopic] = useState(initialTopic);
  const [mode, setMode] = useState(initialMode);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) {
      setValidationError("Enter a topic or paste your study notes to continue.");
      return;
    }
    setValidationError("");
    onGenerate(trimmed, mode);
  };

  const isFlashcards = mode === "flashcards";

  return (
    <div className="w-full max-w-2xl rounded-[var(--radius-xl)] border border-[var(--border-card)] bg-[var(--bg-card)] p-4 sm:p-6 lg:p-8 shadow-[var(--shadow-lg)]">
      <div className="mb-5 sm:mb-7 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-[var(--primary)]">Study workspace</p>
        <h1 className="font-[var(--font-display)] text-3xl leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-[var(--fg)] sm:text-4xl">
          Turn your notes into a study deck
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-[var(--leading-relaxed)] text-[var(--fg-muted)] sm:text-base">
          Paste your material or name a topic, then choose how you want to practice it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset>
          <legend className="mb-2 block text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-[var(--fg-muted)]">Study format</legend>
          <div className="grid grid-cols-3 gap-1.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-muted)] p-1.5">
            <button
              type="button"
              onClick={() => setMode("flashcards")}
              disabled={isLoading}
              aria-pressed={mode === "flashcards"}
              className={`flex min-h-11 items-center justify-center gap-1.5 rounded-[var(--radius-md)] px-2 text-xs sm:text-sm font-semibold transition-colors duration-150 ${
                mode === "flashcards"
                  ? "bg-[var(--bg-card)] text-[var(--fg)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              <Layers size={16} aria-hidden="true" />
              Flashcards
            </button>
            <button
              type="button"
              onClick={() => setMode("quiz")}
              disabled={isLoading}
              aria-pressed={mode === "quiz"}
              className={`flex min-h-11 items-center justify-center gap-1.5 rounded-[var(--radius-md)] px-2 text-xs sm:text-sm font-semibold transition-colors duration-150 ${
                mode === "quiz"
                  ? "bg-[var(--bg-card)] text-[var(--fg)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              <ListChecks size={16} aria-hidden="true" />
              Quiz
            </button>
            <button
              type="button"
              onClick={() => setMode("checklist")}
              disabled={isLoading}
              aria-pressed={mode === "checklist"}
              className={`flex min-h-11 items-center justify-center gap-1.5 rounded-[var(--radius-md)] px-2 text-xs sm:text-sm font-semibold transition-colors duration-150 ${
                mode === "checklist"
                  ? "bg-[var(--bg-card)] text-[var(--fg)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              <ListTodo size={16} aria-hidden="true" />
              Checklist
            </button>
          </div>
        </fieldset>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="topic-input" className="text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-[var(--fg-muted)]">
              Topic or study notes
            </label>
            <span className="font-[var(--font-mono)] text-xs text-[var(--fg-muted)]">
              {topic.length > 0 ? `${topic.length} characters` : "Paste notes or type a topic"}
            </span>
          </div>
          <textarea
            id="topic-input"
            value={topic}
            onChange={(event) => {
              setTopic(event.target.value);
              if (validationError) setValidationError("");
            }}
            disabled={isLoading}
            rows={6}
            placeholder="For example: Photosynthesis light-dependent reactions, or paste your lecture notes here..."
            className={`min-h-36 w-full resize-y rounded-[var(--radius-lg)] border bg-[var(--bg-input)] p-4 text-base leading-[var(--leading-body)] text-[var(--fg)] placeholder:text-[var(--fg-muted)] transition-colors duration-150 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25 ${
              validationError ? "border-[var(--error)]" : "border-[var(--border)]"
            }`}
          />
          {validationError && (
            <p className="animate-fade-in mt-2 flex items-center gap-1.5 text-sm font-medium text-[var(--error)]" role="alert">
              <TriangleAlert size={15} aria-hidden="true" />
              {validationError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-colors duration-150 hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <><LoaderCircle size={19} className="animate-spin" aria-hidden="true" /> Building your deck...</>
          ) : (
            <>
              {mode === "flashcards" ? <Layers size={19} aria-hidden="true" /> : mode === "quiz" ? <ListChecks size={19} aria-hidden="true" /> : <ListTodo size={19} aria-hidden="true" />} Create {mode === "flashcards" ? "Flashcards" : mode === "quiz" ? "Quiz" : "Checklist"}
            </>
          )}
        </button>
      </form>

      {Array.isArray(savedSessions) && savedSessions.length > 0 && (
        <div className="mt-5 border-t border-[var(--border)] pt-4 sm:mt-8 sm:pt-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-[var(--fg-muted)]">
              <History size={14} aria-hidden="true" /> Recent Decks ({savedSessions.length})
            </span>
            {onClearSessions && (
              <button
                type="button"
                onClick={onClearSessions}
                className="text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--error)] transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="custom-scrollbar max-h-36 sm:max-h-48 space-y-2 overflow-y-auto pr-1">
            {savedSessions.map((session) => {
              const isFlashcardMode = session.mode === "flashcards";
              const isQuizMode = session.mode === "quiz";
              const itemCount = isFlashcardMode
                ? session.deck?.cards?.length || 0
                : isQuizMode
                ? session.deck?.questions?.length || 0
                : session.deck?.items?.length || 0;
              const modeText = isFlashcardMode
                ? `${itemCount} cards`
                : isQuizMode
                ? `${itemCount} questions`
                : `${itemCount} items`;
              const dateStr = session.savedAt
                ? new Date(session.savedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                : "";

              return (
                <div
                  key={session.id}
                  className="group flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-muted)]/60 p-2.5 transition-colors hover:border-[var(--primary)] hover:bg-[var(--bg-card)]"
                >
                  <button
                    type="button"
                    onClick={() => onLoadSession && onLoadSession(session)}
                    className="flex flex-1 items-center gap-2.5 min-w-0 text-left"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--primary)]">
                      {isFlashcardMode ? <Layers size={14} aria-hidden="true" /> : isQuizMode ? <ListChecks size={14} aria-hidden="true" /> : <ListTodo size={14} aria-hidden="true" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors">
                        {session.topic}
                      </p>
                      <p className="text-[11px] text-[var(--fg-muted)]">
                        {modeText} {dateStr && `• ${dateStr}`}
                      </p>
                    </div>
                  </button>

                  {onDeleteSession && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      title="Delete saved deck"
                      aria-label="Delete saved deck"
                      className="p-1.5 text-[var(--fg-muted)] hover:text-[var(--error)] transition-colors rounded-[var(--radius-sm)]"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
