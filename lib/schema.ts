// lib/schema.ts — Data contract for Study Assistant
// This is the single source of truth for the Deck shape.
// The API route never trusts raw model output — it always goes through parseDeck.

// ─── Types ───────────────────────────────────────────────────────────

export type Flashcard = {
  id: string;
  front: string;
  back: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  choices: string[];       // length 2–6
  correctIndex: number;    // index into choices
  explanation: string;     // shown after answering
};

export type ChecklistItem = {
  id: string;
  title: string;
  description: string;
};

export type Deck =
  | { mode: "flashcards"; topic: string; cards: Flashcard[] }
  | { mode: "quiz"; topic: string; questions: QuizQuestion[] }
  | { mode: "checklist"; topic: string; items: ChecklistItem[] };

// ─── Result type ─────────────────────────────────────────────────────

export type DeckError = "parse" | "shape" | "empty";

export type ParseDeckResult =
  | { ok: true; deck: Deck }
  | { ok: false; kind: DeckError };

// ─── Validators (manual — no Zod dependency) ─────────────────────────

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isFlashcard(v: unknown): v is Flashcard {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    isNonEmptyString(obj.id) &&
    isNonEmptyString(obj.front) &&
    isNonEmptyString(obj.back)
  );
}

function isQuizQuestion(v: unknown): v is QuizQuestion {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  if (!isNonEmptyString(obj.id)) return false;
  if (!isNonEmptyString(obj.question)) return false;
  if (!isNonEmptyString(obj.explanation)) return false;
  if (!Array.isArray(obj.choices)) return false;
  if (obj.choices.length < 2 || obj.choices.length > 6) return false;
  if (!obj.choices.every((c: unknown) => isNonEmptyString(c))) return false;
  if (typeof obj.correctIndex !== "number") return false;
  if (
    !Number.isInteger(obj.correctIndex) ||
    (obj.correctIndex as number) < 0 ||
    (obj.correctIndex as number) >= obj.choices.length
  ) {
    return false;
  }
  return true;
}

function isChecklistItem(v: unknown): v is ChecklistItem {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    isNonEmptyString(obj.id) &&
    isNonEmptyString(obj.title) &&
    isNonEmptyString(obj.description)
  );
}

function isDeck(v: unknown): v is Deck {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  if (!isNonEmptyString(obj.topic)) return false;

  if (obj.mode === "flashcards") {
    if (!Array.isArray(obj.cards)) return false;
    return obj.cards.every(isFlashcard);
  }

  if (obj.mode === "quiz") {
    if (!Array.isArray(obj.questions)) return false;
    return obj.questions.every(isQuizQuestion);
  }

  if (obj.mode === "checklist") {
    if (!Array.isArray(obj.items)) return false;
    return obj.items.every(isChecklistItem);
  }

  return false;
}

// ─── stripCodeFence ──────────────────────────────────────────────────
// Models sometimes wrap JSON in ```json ... ``` even when told not to.

function stripCodeFence(text: string): string {
  let s = text.trim();
  // Strip leading ```json or ```
  if (s.startsWith("```json")) {
    s = s.slice(7);
  } else if (s.startsWith("```")) {
    s = s.slice(3);
  }
  // Strip trailing ```
  if (s.endsWith("```")) {
    s = s.slice(0, -3);
  }
  return s.trim();
}

// ─── parseDeck ───────────────────────────────────────────────────────

export function parseDeck(raw: unknown): ParseDeckResult {
  // If raw is already an object (e.g. pre-parsed), skip JSON.parse
  let parsed: unknown;

  if (typeof raw === "string") {
    const stripped = stripCodeFence(raw);
    try {
      parsed = JSON.parse(stripped);
    } catch {
      return { ok: false, kind: "parse" };
    }
  } else {
    parsed = raw;
  }

  // Validate shape
  if (!isDeck(parsed)) {
    return { ok: false, kind: "shape" };
  }

  // Empty check — valid shape but zero items
  if (parsed.mode === "flashcards" && parsed.cards.length === 0) {
    return { ok: false, kind: "empty" };
  }
  if (parsed.mode === "quiz" && parsed.questions.length === 0) {
    return { ok: false, kind: "empty" };
  }
  if (parsed.mode === "checklist" && parsed.items.length === 0) {
    return { ok: false, kind: "empty" };
  }

  return { ok: true, deck: parsed };
}
