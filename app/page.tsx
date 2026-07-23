// app/page.tsx — Main Study Assistant Page with state machine & race-condition protection
"use client";

import React, { useState, useRef } from "react";
import InputScreen from "@/components/InputScreen";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import FlashcardDeck from "@/components/FlashcardDeck";
import { generateDeck, type ClientErrorKind } from "@/lib/client";
import type { Deck } from "@/lib/schema";
import type { DeckMode } from "@/lib/prompt";

type AppStatus = "idle" | "loading" | "success" | "empty" | "error";

export default function Home() {
  const [status, setStatus] = useState<AppStatus>("idle");
  const [deck, setDeck] = useState<Deck | null>(null);
  const [errorKind, setErrorKind] = useState<ClientErrorKind>("network");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [lastTopic, setLastTopic] = useState<string>("");
  const [lastMode, setLastMode] = useState<DeckMode>("flashcards");

  // Monotonically increasing requestId ref to prevent race conditions per DESIGN.md
  const latestRequestIdRef = useRef<number>(0);

  const handleGenerate = async (topic: string, mode: DeckMode) => {
    // Increment request ID for stale response protection
    const requestId = ++latestRequestIdRef.current;

    setLastTopic(topic);
    setLastMode(mode);
    setStatus("loading");

    try {
      const result = await generateDeck(topic, mode);

      // Race condition check: discard if a newer request was initiated
      if (requestId !== latestRequestIdRef.current) {
        console.warn(`Discarding stale response for request #${requestId} (latest is #${latestRequestIdRef.current})`);
        return;
      }

      if (result.ok) {
        setDeck(result.deck);
        setStatus("success");
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

  const handleRetry = () => {
    if (lastTopic) {
      handleGenerate(lastTopic, lastMode);
    }
  };

  const handleReset = () => {
    setStatus("idle");
  };

  return (
    <main className="min-h-screen flex flex-col justify-between p-4 sm:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4 mb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-indigo-500/20">
            📚
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Study Assistant</span>
        </div>

        {status !== "idle" && (
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
          >
            ← New Deck
          </button>
        )}
      </header>

      {/* Main Content Area — Explicit rendering for each of the 4 core states */}
      <div className="flex-1 flex items-center justify-center w-full max-w-5xl mx-auto my-auto py-6">
        {status === "idle" && (
          <InputScreen
            onGenerate={handleGenerate}
            isLoading={false}
            initialTopic={lastTopic}
            initialMode={lastMode}
          />
        )}

        {status === "loading" && (
          <LoadingState mode={lastMode} />
        )}

        {status === "empty" && (
          <EmptyState onRetry={handleRetry} onReset={handleReset} />
        )}

        {status === "error" && (
          <ErrorState
            kind={errorKind}
            customMessage={errorMessage}
            onRetry={handleRetry}
            onReset={handleReset}
          />
        )}

        {status === "success" && deck && (
          deck.mode === "flashcards" ? (
            <FlashcardDeck deck={deck} onReset={handleReset} />
          ) : (
            <div className="w-full max-w-3xl bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    ❓ Quiz Deck
                  </span>
                  <h2 className="text-2xl font-bold text-white tracking-tight mt-1">{deck.topic}</h2>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/20"
                >
                  Create Another
                </button>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto max-h-[400px]">
                <div className="flex justify-between items-center text-slate-500 pb-2 mb-2 border-b border-slate-900">
                  <span>QUIZ CONTRACT PREVIEW (PLAN 005 WILL RENDER INTERACTIVE QUIZ)</span>
                  <span>{deck.questions.length} questions</span>
                </div>
                <pre>{JSON.stringify(deck, null, 2)}</pre>
              </div>
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center py-4 border-t border-slate-900 text-xs text-slate-600">
        Study Assistant • AI-generated flashcards & quiz decks
      </footer>
    </main>
  );
}
