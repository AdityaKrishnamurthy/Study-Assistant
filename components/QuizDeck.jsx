"use client";

import React, { useState } from "react";
import { CircleCheck, ListChecks, RefreshCw } from "lucide-react";
import QuizQuestion from "./QuizQuestion";

export default function QuizDeck({ deck, onReset }) {
  const originalQuestions = deck?.questions || [];
  const [phase, setPhase] = useState("first-pass");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [firstPassScore, setFirstPassScore] = useState(0);
  const [wrongQuestionIds, setWrongQuestionIds] = useState(new Set());
  const [retestQuestions, setRetestQuestions] = useState([]);

  const activeQuestions = phase === "retest" ? retestQuestions : originalQuestions;
  const currentQuestion = activeQuestions[currentIndex] || null;
  const totalQuestions = activeQuestions.length;

  const handleAnswer = (choiceIndex) => {
    if (hasAnswered || !currentQuestion) return;
    setSelectedChoice(choiceIndex);
    setHasAnswered(true);
    const isCorrect = choiceIndex === currentQuestion.correctIndex;

    if (phase === "first-pass") {
      if (isCorrect) setFirstPassScore((previous) => previous + 1);
      else setWrongQuestionIds((previous) => new Set(previous).add(currentQuestion.id));
    } else if (phase === "retest" && isCorrect) {
      setWrongQuestionIds((previous) => {
        const next = new Set(previous);
        next.delete(currentQuestion.id);
        return next;
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((previous) => previous + 1);
      setSelectedChoice(null);
      setHasAnswered(false);
      return;
    }

    if (phase === "first-pass") {
      setPhase("summary");
    } else if (phase === "retest") {
      const remainingWrong = originalQuestions.filter((question) => wrongQuestionIds.has(question.id));
      if (remainingWrong.length > 0) {
        setRetestQuestions(remainingWrong);
        setCurrentIndex(0);
        setSelectedChoice(null);
        setHasAnswered(false);
      } else {
        setPhase("done");
      }
    }
  };

  const handleStartRetest = () => {
    const wrongList = originalQuestions.filter((question) => wrongQuestionIds.has(question.id));
    if (wrongList.length === 0) return;
    setRetestQuestions(wrongList);
    setCurrentIndex(0);
    setSelectedChoice(null);
    setHasAnswered(false);
    setPhase("retest");
  };

  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;
  const isRetest = phase === "retest";

  return (
    <div className="flex flex-col h-full min-h-0 w-full max-w-2xl space-y-2 sm:space-y-3 lg:grid lg:h-full lg:min-h-0 lg:max-w-5xl lg:grid-cols-[minmax(14rem,17rem)_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-6 lg:space-y-0">
      <div className="flex shrink-0 items-center justify-between gap-2 rounded-[var(--radius-lg)] border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2 sm:px-4 sm:py-3 lg:col-span-2 lg:row-start-1 lg:h-fit">
        <div className="min-w-0">
          <span className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[var(--tracking-wide)] ${isRetest ? "text-[var(--warning)]" : "text-[var(--primary)]"}`}>
            {isRetest ? <RefreshCw size={14} aria-hidden="true" /> : <ListChecks size={14} aria-hidden="true" />}
            {isRetest ? "Retest phase" : "Quiz deck"}
          </span>
          <h2 className="mt-0.5 break-words font-[var(--font-display)] text-base font-medium leading-[var(--leading-tight)] text-[var(--fg)] sm:text-lg lg:text-xl">{deck.topic}</h2>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto lg:self-stretch">
          {phase === "first-pass" && <span className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-2 font-[var(--font-mono)] text-xs text-[var(--fg-muted)]">Score <span className="font-semibold text-[var(--primary)]">{firstPassScore}</span> / {currentIndex + (hasAnswered ? 1 : 0)}</span>}
          <button type="button" onClick={onReset} className="min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] px-3 text-xs font-semibold text-[var(--fg-muted)] transition-colors duration-150 hover:text-[var(--primary)]">Edit notes</button>
        </div>
      </div>

      {(phase === "first-pass" || phase === "retest") && (
        <div className="flex-1 min-h-0 flex flex-col space-y-2 sm:space-y-3 lg:contents">
          <div className="shrink-0 space-y-1.5 lg:col-start-1 lg:row-start-2 lg:self-start">
            <div className="flex items-center justify-between px-1 font-[var(--font-mono)] text-xs text-[var(--fg-muted)]">
              <span>{isRetest ? `Retest item ${currentIndex + 1} of ${totalQuestions}` : `Question ${currentIndex + 1} of ${totalQuestions}`}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-[var(--radius-full)] bg-[var(--bg-muted)]">
              <div className={`h-full rounded-[var(--radius-full)] transition-all duration-300 ${isRetest ? "bg-[var(--warning)]" : "bg-[var(--primary)]"}`} style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          {currentQuestion && <QuizQuestion question={currentQuestion} onAnswer={handleAnswer} selectedChoice={selectedChoice} hasAnswered={hasAnswered} onNext={handleNextQuestion} isLastQuestion={currentIndex === totalQuestions - 1} isRetest={isRetest} />}
        </div>
      )}

      {phase === "summary" && (
        <div className="animate-fade-in space-y-6 rounded-[var(--radius-xl)] border border-[var(--border-card)] bg-[var(--bg-card)] p-8 text-center shadow-[var(--shadow-lg)] lg:col-span-2 lg:max-h-full lg:self-center lg:overflow-y-auto">
          <div className="mx-auto grid size-20 place-items-center rounded-[var(--radius-full)] bg-[var(--bg-muted)] text-[var(--primary)]"><ListChecks size={40} aria-hidden="true" /></div>
          <div className="space-y-2">
            <h3 className="font-[var(--font-display)] text-2xl text-[var(--fg)]">Quiz complete</h3>
            <p className="text-sm text-[var(--fg-muted)]">Your first-pass result:</p>
          </div>
          <div className="mx-auto w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-input)] p-6">
            <div className="font-[var(--font-mono)] text-3xl font-bold text-[var(--fg)]">{firstPassScore} / {originalQuestions.length}</div>
            <div className="mt-2 text-sm font-semibold text-[var(--fg-muted)]">{Math.round((firstPassScore / originalQuestions.length) * 100)}% accuracy</div>
          </div>
          <div className="flex flex-col justify-center gap-3 pt-1 sm:flex-row">
            {wrongQuestionIds.size > 0 ? (
              <button type="button" onClick={handleStartRetest} className="flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--warning)]/40 bg-[var(--warning-bg)] px-5 text-sm font-semibold text-[var(--warning)] transition-colors duration-150 hover:border-[var(--warning)]"><RefreshCw size={16} aria-hidden="true" /> Retest {wrongQuestionIds.size} missed question{wrongQuestionIds.size > 1 ? "s" : ""}</button>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--success)]/30 bg-[var(--success-bg)] px-4 py-3 text-sm font-semibold text-[var(--success)]"><CircleCheck size={17} aria-hidden="true" /> Perfect first pass</div>
            )}
            <button type="button" onClick={onReset} className="min-h-12 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-muted)] px-5 text-sm font-semibold text-[var(--fg)] transition-colors duration-150 hover:border-[var(--primary)]">Create new deck</button>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="animate-fade-in space-y-6 rounded-[var(--radius-xl)] border border-[var(--success)]/30 bg-[var(--bg-card)] p-8 text-center shadow-[var(--shadow-lg)] lg:col-span-2 lg:max-h-full lg:self-center lg:overflow-y-auto">
          <div className="mx-auto grid size-20 place-items-center rounded-[var(--radius-full)] border border-[var(--success)]/25 bg-[var(--success-bg)] text-[var(--success)]"><CircleCheck size={40} aria-hidden="true" /></div>
          <div className="space-y-2">
            <h3 className="font-[var(--font-display)] text-2xl text-[var(--fg)]">Retest complete</h3>
            <p className="mx-auto max-w-md text-sm leading-[var(--leading-relaxed)] text-[var(--fg-muted)]">You answered every previously missed question correctly.</p>
          </div>
          <button type="button" onClick={onReset} className="min-h-12 rounded-[var(--radius-md)] bg-[var(--primary)] px-6 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-colors duration-150 hover:bg-[var(--primary-hover)]">Create another study deck</button>
        </div>
      )}
    </div>
  );
}
