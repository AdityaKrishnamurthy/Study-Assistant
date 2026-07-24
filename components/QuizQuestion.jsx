"use client";

import React from "react";
import { CircleCheck, CircleX, Info, ListChecks, RefreshCw } from "lucide-react";

export default function QuizQuestion({ question, onAnswer, selectedChoice, hasAnswered, onNext, isLastQuestion, isRetest = false }) {
  if (!question) return null;

  const choices = question.choices || [];
  const correctIndex = question.correctIndex;
  const choiceLabels = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="space-y-6 rounded-[var(--radius-xl)] border border-[var(--border-card)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-md)] sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border px-3 py-1 text-xs font-semibold uppercase tracking-[var(--tracking-wide)] ${
            isRetest ? "border-[var(--warning)]/30 bg-[var(--warning-bg)] text-[var(--warning)]" : "border-[var(--border)] bg-[var(--bg-muted)] text-[var(--primary)]"
          }`}>
            {isRetest ? <RefreshCw size={13} aria-hidden="true" /> : <ListChecks size={13} aria-hidden="true" />}
            {isRetest ? "Retest item" : "Question"}
          </span>
          {hasAnswered && (
            <span className={`inline-flex items-center gap-1 rounded-[var(--radius-full)] border px-2.5 py-1 text-xs font-semibold ${
              selectedChoice === correctIndex ? "border-[var(--success)]/30 bg-[var(--success-bg)] text-[var(--success)]" : "border-[var(--error)]/30 bg-[var(--error-bg)] text-[var(--error)]"
            }`}>
              {selectedChoice === correctIndex ? <CircleCheck size={14} aria-hidden="true" /> : <CircleX size={14} aria-hidden="true" />}
              {selectedChoice === correctIndex ? "Correct" : "Incorrect"}
            </span>
          )}
        </div>

        <h3 className="font-[var(--font-display)] text-xl leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-[var(--fg)] sm:text-2xl">
          {question.question}
        </h3>

        <div className="space-y-3 pt-1">
          {choices.map((choiceText, index) => {
            const isSelected = selectedChoice === index;
            const isCorrect = index === correctIndex;
            let choiceStyle = "border-[var(--border)] bg-[var(--bg-muted)] text-[var(--fg)] hover:border-[var(--primary)] hover:bg-[var(--bg-input)]";
            let labelStyle = "border-[var(--border)] bg-[var(--bg-card)] text-[var(--fg-muted)]";
            let resultIcon = null;

            if (hasAnswered) {
              if (isCorrect) {
                choiceStyle = "border-[var(--success)] bg-[var(--success-bg)] text-[var(--success)]";
                labelStyle = "border-[var(--success)] bg-[var(--success)] text-white";
                resultIcon = <CircleCheck className="ml-auto shrink-0" size={20} aria-hidden="true" />;
              } else if (isSelected) {
                choiceStyle = "border-[var(--error)] bg-[var(--error-bg)] text-[var(--error)]";
                labelStyle = "border-[var(--error)] bg-[var(--error)] text-white";
                resultIcon = <CircleX className="ml-auto shrink-0" size={20} aria-hidden="true" />;
              } else {
                choiceStyle = "border-[var(--border)] bg-[var(--bg-muted)] text-[var(--fg-muted)] opacity-50";
              }
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() => !hasAnswered && onAnswer(index)}
                disabled={hasAnswered}
                className={`flex min-h-12 w-full items-center gap-3 rounded-[var(--radius-md)] border p-3.5 text-left text-sm font-medium leading-[var(--leading-body)] transition-[transform,color,background-color,border-color] duration-[80ms] ${
                  hasAnswered ? "" : "active:scale-[0.97]"
                } ${choiceStyle}`}
              >
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border font-[var(--font-mono)] text-xs font-medium ${labelStyle}`}>
                  {choiceLabels[index] || index + 1}
                </span>
                <span className="flex-1">{choiceText}</span>
                {resultIcon}
              </button>
            );
          })}
        </div>

        {hasAnswered && (
          <div className="animate-fade-in space-y-4 pt-1">
            <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-muted)] p-4 sm:p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[var(--tracking-wide)] text-[var(--primary)]"><Info size={14} aria-hidden="true" /> Explanation</div>
              <p className="text-sm leading-[var(--leading-relaxed)] text-[var(--fg-muted)]">{question.explanation}</p>
            </div>
            <button type="button" onClick={onNext} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-6 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-colors duration-150 hover:bg-[var(--primary-hover)]">
              {isLastQuestion ? "Finish and view results" : "Next question"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
