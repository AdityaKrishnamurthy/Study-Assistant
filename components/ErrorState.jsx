// components/ErrorState.jsx — Error screen mapping specific failure kinds to designated human copy
"use client";

import React from "react";

const ERROR_MESSAGES = {
  parse: "Couldn't read the AI's response",
  shape: "Couldn't read the AI's response",
  timeout: "Request timed out — try again",
  rate_limit: "Rate limited by AI provider — try again in a moment",
  network: "Network request failed — please check your connection and try again",
  provider_error: "AI provider service error — please try again in a moment",
};

export default function ErrorState({ kind = "network", customMessage, onRetry, onReset }) {
  const displayMessage = ERROR_MESSAGES[kind] || customMessage || "An unexpected error occurred. Please try again.";

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-rose-500/30 shadow-2xl text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-3xl">
        ⚠️
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white tracking-tight">Generation Failed</h3>
        <p className="text-sm text-slate-300 leading-relaxed">{displayMessage}</p>
        {kind && (
          <p className="text-xs text-slate-500 font-mono pt-1">
            Error code: <span className="text-rose-400">{kind}</span>
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            <span>Retry</span>
          </button>
        )}

        {onReset && (
          <button
            onClick={onReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            Edit Notes
          </button>
        )}
      </div>
    </div>
  );
}
