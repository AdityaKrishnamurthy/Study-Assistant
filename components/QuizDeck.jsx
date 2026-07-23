// components/QuizDeck.jsx — Quiz deck manager with scoring & interactive retest loop queue
"use client";

import React, { useState } from "react";
import QuizQuestion from "./QuizQuestion";

export default function QuizDeck({ deck, onReset }) {
  const originalQuestions = deck?.questions || [];

  // Core state machine
  const [phase, setPhase] = useState("first-pass"); // "first-pass" | "summary" | "retest" | "done"
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Scoring & Retest Queue Tracking
  const [firstPassScore, setFirstPassScore] = useState(0);
  const [wrongQuestionIds, setWrongQuestionIds] = useState(new Set());
  const [retestQuestions, setRetestQuestions] = useState([]);

  // Active question set based on phase
  const activeQuestions = phase === "retest" ? retestQuestions : originalQuestions;
  const currentQuestion = activeQuestions[currentIndex] || null;
  const totalQuestions = activeQuestions.length;

  const handleAnswer = (choiceIndex) => {
    if (hasAnswered || !currentQuestion) return;

    setSelectedChoice(choiceIndex);
    setHasAnswered(true);

    const isCorrect = choiceIndex === currentQuestion.correctIndex;

    if (phase === "first-pass") {
      if (isCorrect) {
        setFirstPassScore((prev) => prev + 1);
      } else {
        setWrongQuestionIds((prev) => new Set(prev).add(currentQuestion.id));
      }
    } else if (phase === "retest") {
      if (isCorrect) {
        // Correct in retest: remove from wrong set
        setWrongQuestionIds((prev) => {
          const next = new Set(prev);
          next.delete(currentQuestion.id);
          return next;
        });
      }
      // If wrong again in retest, it stays in wrongQuestionIds
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedChoice(null);
      setHasAnswered(false);
    } else {
      // Reached end of current set
      if (phase === "first-pass") {
        setPhase("summary");
      } else if (phase === "retest") {
        // Check if there are still wrong questions remaining
        const remainingWrong = originalQuestions.filter((q) => wrongQuestionIds.has(q.id));
        if (remainingWrong.length > 0) {
          // Restart retest for remaining wrong questions
          setRetestQuestions(remainingWrong);
          setCurrentIndex(0);
          setSelectedChoice(null);
          setHasAnswered(false);
        } else {
          // Retest completely cleared!
          setPhase("done");
        }
      }
    }
  };

  const handleStartRetest = () => {
    const wrongList = originalQuestions.filter((q) => wrongQuestionIds.has(q.id));
    if (wrongList.length === 0) return;

    setRetestQuestions(wrongList);
    setCurrentIndex(0);
    setSelectedChoice(null);
    setHasAnswered(false);
    setPhase("retest");
  };

  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
            {phase === "retest" ? "🔁 Retest Phase" : "❓ Quiz Deck"}
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight leading-snug">{deck.topic}</h2>
        </div>

        <div className="flex items-center gap-3">
          {phase === "first-pass" && (
            <span className="text-xs font-semibold px-3 py-1.5 bg-slate-950/80 rounded-lg border border-slate-800 text-slate-300">
              Score: <span className="text-indigo-400">{firstPassScore}</span> / {currentIndex + (hasAnswered ? 1 : 0)}
            </span>
          )}

          <button
            onClick={onReset}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
          >
            Edit Notes
          </button>
        </div>
      </div>

      {/* FIRST-PASS / RETEST QUESTION VIEW */}
      {(phase === "first-pass" || phase === "retest") && (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 px-1">
              <span>
                {phase === "retest" ? `Retest Item ${currentIndex + 1} of ${totalQuestions}` : `Question ${currentIndex + 1} of ${totalQuestions}`}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  phase === "retest"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500"
                    : "bg-gradient-to-r from-indigo-500 to-purple-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {currentQuestion && (
            <QuizQuestion
              question={currentQuestion}
              onAnswer={handleAnswer}
              selectedChoice={selectedChoice}
              hasAnswered={hasAnswered}
              onNext={handleNextQuestion}
              isLastQuestion={currentIndex === totalQuestions - 1}
              isRetest={phase === "retest"}
            />
          )}
        </div>
      )}

      {/* SUMMARY SCREEN (End of first pass per DESIGN.md) */}
      {phase === "summary" && (
        <div className="p-8 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-4xl shadow-xl shadow-indigo-600/30">
            📊
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">Quiz Complete!</h3>
            <p className="text-sm text-slate-400">Here is your official first-pass score:</p>
          </div>

          {/* Score Badge */}
          <div className="p-6 bg-slate-950/80 rounded-xl border border-slate-800/80 inline-block w-full max-w-sm">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              {firstPassScore} / {originalQuestions.length}
            </div>
            <div className="text-sm font-semibold text-slate-300 mt-2">
              ({Math.round((firstPassScore / originalQuestions.length) * 100)}% Accuracy)
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            {wrongQuestionIds.size > 0 ? (
              <button
                onClick={handleStartRetest}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <span>🔁</span>
                <span>Retest {wrongQuestionIds.size} Missed Question{wrongQuestionIds.size > 1 ? "s" : ""}</span>
              </button>
            ) : (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-semibold">
                🎉 Perfect Score! You mastered all questions on your first try!
              </div>
            )}

            <button
              onClick={onReset}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              Create New Deck
            </button>
          </div>
        </div>
      )}

      {/* RETEST DONE SCREEN */}
      {phase === "done" && (
        <div className="p-8 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-emerald-500/30 shadow-2xl text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/20">
            🎓
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">Retest Mastery Achieved!</h3>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              You have successfully retested and answered all previously missed questions correctly.
            </p>
          </div>

          <button
            onClick={onReset}
            className="px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/25"
          >
            Create Another Study Deck
          </button>
        </div>
      )}
    </div>
  );
}
