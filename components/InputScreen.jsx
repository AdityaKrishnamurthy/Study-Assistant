"use client";

import React, { useState } from "react";
import { Layers, ListChecks, LoaderCircle, TriangleAlert } from "lucide-react";

export default function InputScreen({ onGenerate, isLoading, initialTopic = "", initialMode = "flashcards" }) {
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
          <div className="grid grid-cols-2 gap-1.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-muted)] p-1.5">
            <button
              type="button"
              onClick={() => setMode("flashcards")}
              disabled={isLoading}
              aria-pressed={isFlashcards}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-3 text-sm font-semibold transition-colors duration-150 ${
                isFlashcards
                  ? "bg-[var(--bg-card)] text-[var(--fg)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              <Layers size={17} aria-hidden="true" />
              Flashcards
            </button>
            <button
              type="button"
              onClick={() => setMode("quiz")}
              disabled={isLoading}
              aria-pressed={!isFlashcards}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-3 text-sm font-semibold transition-colors duration-150 ${
                !isFlashcards
                  ? "bg-[var(--bg-card)] text-[var(--fg)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              <ListChecks size={17} aria-hidden="true" />
              Quiz
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
            <>{isFlashcards ? <Layers size={19} aria-hidden="true" /> : <ListChecks size={19} aria-hidden="true" />} Create {isFlashcards ? "Flashcards" : "Quiz"}</>
          )}
        </button>
      </form>
    </div>
  );
}
