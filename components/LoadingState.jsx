// components/LoadingState.jsx — Loading screen with progressive message after 6s
"use client";

import React, { useState, useEffect } from "react";

export default function LoadingState({ mode = "flashcards" }) {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    // Show progressive message after 6 seconds per DESIGN.md
    const timer = setTimeout(() => {
      setIsSlow(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto p-8 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl text-center space-y-6 animate-pulse">
      {/* Animated Spinner Icon */}
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
        <div className="w-16 h-16 rounded-full border-4 border-t-indigo-500 border-r-indigo-500 border-b-purple-500 border-l-transparent animate-spin" />
        <span className="absolute text-xl">{mode === "flashcards" ? "🎴" : "❓"}</span>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white tracking-tight">
          Generating your {mode === "flashcards" ? "flashcard deck" : "quiz questions"}...
        </h3>
        <p className="text-sm text-slate-400">
          {isSlow ? "Still working... refining questions and formatting cards." : "Analyzing study notes and structuring interactive material."}
        </p>
      </div>

      {/* Skeleton Cards Preview */}
      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3 text-left">
        <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-slate-800/60 rounded w-1/2 animate-pulse" />
        <div className="h-3 bg-slate-800/40 rounded w-5/6 animate-pulse" />
      </div>

      {isSlow && (
        <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-medium text-amber-400 animate-fade-in">
          ⏳ Deep analysis in progress — almost done!
        </div>
      )}
    </div>
  );
}
