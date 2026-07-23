// components/QuizQuestion.jsx — Single quiz question component with instant feedback & explanation
"use client";

import React from "react";

export default function QuizQuestion({
  question,
  onAnswer,
  selectedChoice,
  hasAnswered,
  onNext,
  isLastQuestion,
  isRetest = false,
}) {
  if (!question) return null;

  const choices = question.choices || [];
  const correctIndex = question.correctIndex;

  const handleSelectChoice = (index) => {
    if (hasAnswered) return; // Prevent changing answer once locked in
    onAnswer(index);
  };

  const choiceLabels = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Question Card */}
      <div className="p-6 sm:p-8 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${
              isRetest
                ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                : "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
            }`}
          >
            {isRetest ? "🔁 Retest Item" : "❓ Question"}
          </span>

          {hasAnswered && (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                selectedChoice === correctIndex
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
              }`}
            >
              {selectedChoice === correctIndex ? "✓ Correct!" : "✗ Incorrect"}
            </span>
          )}
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white leading-relaxed tracking-tight">
          {question.question}
        </h3>

        {/* Choices List */}
        <div className="space-y-3 pt-2">
          {choices.map((choiceText, index) => {
            const isSelected = selectedChoice === index;
            const isCorrect = index === correctIndex;

            let buttonStyle = "bg-slate-950/80 text-slate-200 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50";
            let labelStyle = "bg-slate-800 text-slate-400";
            let icon = null;

            if (hasAnswered) {
              if (isCorrect) {
                buttonStyle = "bg-emerald-950/40 text-emerald-100 border-emerald-500/60 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/50";
                labelStyle = "bg-emerald-500 text-slate-950 font-bold";
                icon = <span className="text-emerald-400 font-bold text-lg ml-auto">✓</span>;
              } else if (isSelected) {
                buttonStyle = "bg-rose-950/40 text-rose-100 border-rose-500/60 shadow-lg shadow-rose-950/50 ring-1 ring-rose-500/50";
                labelStyle = "bg-rose-500 text-white font-bold";
                icon = <span className="text-rose-400 font-bold text-lg ml-auto">✗</span>;
              } else {
                buttonStyle = "bg-slate-950/40 text-slate-500 border-slate-900 opacity-60";
                labelStyle = "bg-slate-900 text-slate-600";
              }
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectChoice(index)}
                disabled={hasAnswered}
                className={`w-full p-4 rounded-xl border font-medium text-left text-sm sm:text-base transition-all duration-200 flex items-center gap-3.5 focus:outline-none ${buttonStyle}`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${labelStyle}`}
                >
                  {choiceLabels[index] || index + 1}
                </span>
                <span className="flex-1 leading-snug">{choiceText}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Immediate Explanation Card (shows as soon as user answers) */}
        {hasAnswered && (
          <div className="mt-6 p-4 sm:p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <span>💡</span> Explanation
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}

        {/* Next Question Action Button */}
        {hasAnswered && (
          <div className="pt-2">
            <button
              onClick={onNext}
              className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2"
            >
              <span>{isLastQuestion ? "Finish & View Results" : "Next Question"}</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
