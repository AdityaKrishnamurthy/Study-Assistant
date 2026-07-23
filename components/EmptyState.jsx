// components/EmptyState.jsx — Empty state component with calmer tone per DESIGN.md
"use client";

import React from "react";

export default function EmptyState({ onRetry, onReset }) {
  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
        📭
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white tracking-tight">No Cards Generated</h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          The AI didn&apos;t generate any cards — try rephrasing your notes or providing a more detailed topic.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        {onReset && (
          <button
            onClick={onReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
          >
            <span>✏️</span>
            <span>Try Different Notes</span>
          </button>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            Retry Same Input
          </button>
        )}
      </div>
    </div>
  );
}
