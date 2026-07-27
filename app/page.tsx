"use client";

/**
 * app/page.tsx — Main Application Controller & View Router
 * 
 * High-level purpose:
 * - Manages application state lifecycle (`idle`, `loading`, `success`, `empty`, `error`).
 * - Orchestrates AI deck generation via `lib/client.ts` with race-condition protection.
 * - Handles local session persistence (saving generated decks, loading previous sessions, clearing sessions).
 * - Dynamically renders the appropriate view based on `status` and `deck.mode` (Flashcards, Quiz, or Checklist).
 */

import React, { useEffect, useRef, useState } from "react";
import { BookOpen, RotateCcw } from "lucide-react";
import InputScreen from "@/components/InputScreen";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import FlashcardDeck from "@/components/FlashcardDeck";
import QuizDeck from "@/components/QuizDeck";
import ChecklistDeck from "@/components/ChecklistDeck";
import ThemeToggle from "@/components/ThemeToggle";
import { generateDeck, type ClientErrorKind } from "@/lib/client";
import type { Deck } from "@/lib/schema";
import type { DeckMode } from "@/lib/prompt";
import {
  clearAllSessions,
  deleteSession,
  getSessions,
  saveSession,
  updateSessionProgress,
  type SavedSession,
} from "@/lib/sessions";

type AppStatus = "idle" | "loading" | "success" | "empty" | "error";

export default function Home() {
  const [status, setStatus] = useState<AppStatus>("idle");
  const [deck, setDeck] = useState<Deck | null>(null);
  const [errorKind, setErrorKind] = useState<ClientErrorKind>("network");
  const [errorMessage, setErrorMessage] = useState("");
  const [lastTopic, setLastTopic] = useState("");
  const [lastMode, setLastMode] = useState<DeckMode>("flashcards");
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeCheckedIds, setActiveCheckedIds] = useState<string[]>([]);
  const latestRequestIdRef = useRef(0);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const handleGenerate = async (topic: string, mode: DeckMode) => {
    const requestId = ++latestRequestIdRef.current;
    setLastTopic(topic);
    setLastMode(mode);
    setStatus("loading");

    try {
      const result = await generateDeck(topic, mode);
      if (requestId !== latestRequestIdRef.current) return;

      if (result.ok) {
        setDeck(result.deck);
        setStatus("success");
        const newId = saveSession(result.deck);
        setActiveSessionId(newId);
        setActiveCheckedIds([]);
        setSessions(getSessions());
      } else if (result.kind === "empty") {
        setDeck(null);
        setStatus("empty");
      } else {
        setDeck(null);
        setErrorKind(result.kind);
        setErrorMessage(result.message || "");
        setStatus("error");
      }
    } catch (err: unknown) {
      if (requestId !== latestRequestIdRef.current) return;
      setDeck(null);
      setErrorKind("network");
      setErrorMessage(err instanceof Error ? err.message : "Request failed");
      setStatus("error");
    }
  };

  const handleLoadSession = (session: SavedSession) => {
    setDeck(session.deck);
    setLastTopic(session.topic);
    setLastMode(session.mode);
    setActiveSessionId(session.id);
    setActiveCheckedIds(Array.isArray(session.checkedIds) ? session.checkedIds : []);
    setStatus("success");
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    setSessions(getSessions());
  };

  const handleClearSessions = () => {
    clearAllSessions();
    setSessions([]);
  };

  const handleRetry = () => {
    if (lastTopic) handleGenerate(lastTopic, lastMode);
  };

  const handleReset = () => setStatus("idle");

  return (
    <main className="flex h-full flex-col overflow-hidden bg-transparent text-[var(--fg)]">
      <header className="w-full shrink-0 border-b border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-3 py-2 sm:px-6 sm:py-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] text-left text-[var(--fg)]"
          >
            <span className="grid size-7 sm:size-9 place-items-center rounded-[var(--radius-md)] bg-[var(--primary)] text-white">
              <BookOpen size={19} aria-hidden="true" />
            </span>
            <span className="text-base font-semibold tracking-[-0.02em] sm:text-lg">Study Assistant</span>
          </button>

          <div className="flex items-center gap-2">
            {status !== "idle" && (
              <button
                type="button"
                onClick={handleReset}
                className="flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm font-medium text-[var(--fg-muted)] transition-colors duration-150 hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <RotateCcw size={16} aria-hidden="true" />
                <span className="hidden sm:inline">New deck</span>
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="custom-scrollbar mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-y-auto overscroll-contain p-2 sm:p-4 lg:p-6">
        {status === "idle" && (
          <div className="enter-fade my-auto flex w-full justify-center">
            <InputScreen
              onGenerate={handleGenerate}
              isLoading={false}
              initialTopic={lastTopic}
              initialMode={lastMode}
              savedSessions={sessions}
              onLoadSession={handleLoadSession}
              onDeleteSession={handleDeleteSession}
              onClearSessions={handleClearSessions}
            />
          </div>
        )}
        {status === "loading" && <div className="enter-fade my-auto flex w-full justify-center"><LoadingState mode={lastMode} /></div>}
        {status === "empty" && <div className="enter-fade my-auto flex w-full justify-center"><EmptyState onRetry={handleRetry} onReset={handleReset} /></div>}
        {status === "error" && <div className="enter-fade my-auto flex w-full justify-center"><ErrorState kind={errorKind} customMessage={errorMessage} onRetry={handleRetry} onReset={handleReset} /></div>}
        {status === "success" && deck && (
          <div className="enter-fade my-auto flex w-full h-full min-h-0 items-center justify-center">
            {deck.mode === "flashcards" ? (
              <FlashcardDeck deck={deck} onReset={handleReset} />
            ) : deck.mode === "quiz" ? (
              <QuizDeck deck={deck} onReset={handleReset} />
            ) : (
              <ChecklistDeck
                deck={deck}
                onReset={handleReset}
                initialCheckedIds={activeCheckedIds}
                onProgressChange={(ids: string[]) => {
                  setActiveCheckedIds(ids);
                  if (activeSessionId) {
                    updateSessionProgress(activeSessionId, ids);
                    setSessions(getSessions());
                  }
                }}
              />
            )}
          </div>
        )}
      </section>

      <footer className="w-full shrink-0 border-t border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 text-center font-[var(--font-mono)] text-[11px] text-[var(--fg-muted)] sm:py-2.5 sm:text-xs">
        Study Assistant
      </footer>
    </main>
  );
}
