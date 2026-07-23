// components/InputScreen.jsx — Input screen with textarea, mode toggle, generate button
"use client";

import React, { useState } from "react";

export default function InputScreen({ onGenerate, isLoading, initialTopic = "", initialMode = "flashcards" }) {
  const [topic, setTopic] = useState(initialTopic);
  const [mode, setMode] = useState(initialMode);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) {
      setValidationError("Please enter a topic or paste your study notes.");
      return;
    }
    setValidationError("");
    onGenerate(trimmed, mode);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl transition-all duration-300">
      <div className="mb-6 text-center">
        <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-3">
          AI Study Assistant
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Turn your notes into study decks
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Paste study material or type any topic to generate instant interactive flashcards or quiz decks.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mode Toggle */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Choose Deck Type
          </label>
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => setMode("flashcards")}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                mode === "flashcards"
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <span>🎴</span>
              <span>Flashcards</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("quiz")}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                mode === "quiz"
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <span>❓</span>
              <span>Quiz Mode</span>
            </button>
          </div>
        </div>

        {/* Input Textarea */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="topic-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Topic or Study Notes
            </label>
            <span className="text-xs text-slate-500">
              {topic.length > 0 ? `${topic.length} chars` : "Paste raw text or type topic"}
            </span>
          </div>

          <div className="relative">
            <textarea
              id="topic-input"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (validationError) setValidationError("");
              }}
              disabled={isLoading}
              rows={5}
              placeholder="e.g. Photosynthesis light-dependent reactions, or paste your lecture notes here..."
              className={`w-full p-4 bg-slate-950/80 text-white placeholder-slate-500 rounded-xl border ${
                validationError ? "border-rose-500/80 focus:ring-rose-500" : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
              } focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 resize-y min-h-[130px]`}
            />
          </div>

          {validationError && (
            <p className="mt-2 text-xs font-medium text-rose-400 flex items-center gap-1.5">
              <span>⚠️</span> {validationError}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 hover:bg-right transition-all duration-300 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Generating Deck...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Generate {mode === "flashcards" ? "Flashcards" : "Quiz Deck"}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
