/**
 * lib/prompt.ts — Prompt Construction for LLM Study Deck Generation
 * 
 * High-level purpose:
 * - Constructs system prompts and few-shot JSON format examples for LLM generation.
 * - Supports three study modes: `flashcards`, `quiz`, and `checklist`.
 * - Instructs the LLM to output ONLY raw valid JSON (no markdown formatting, no extra commentary).
 */

export type DeckMode = "flashcards" | "quiz" | "checklist";

const FLASHCARD_EXAMPLE = JSON.stringify(
  {
    mode: "flashcards",
    topic: "Example Topic",
    cards: [
      { id: "1", front: "Question?", back: "Answer." },
    ],
  },
  null,
  2
);

const QUIZ_EXAMPLE = JSON.stringify(
  {
    mode: "quiz",
    topic: "Example Topic",
    questions: [
      {
        id: "1",
        question: "What is X?",
        choices: ["A", "B", "C", "D"],
        correctIndex: 0,
        explanation: "A is correct because...",
      },
    ],
  },
  null,
  2
);

const CHECKLIST_EXAMPLE = JSON.stringify(
  {
    mode: "checklist",
    topic: "Example Topic",
    items: [
      {
        id: "1",
        title: "Key concept name",
        description: "What the student should understand or be able to explain.",
      },
    ],
  },
  null,
  2
);

export function buildPrompt(topic: string, mode: DeckMode): string {
  const example =
    mode === "flashcards"
      ? FLASHCARD_EXAMPLE
      : mode === "quiz"
      ? QUIZ_EXAMPLE
      : CHECKLIST_EXAMPLE;

  const modeInstructions =
    mode === "flashcards"
      ? `Generate a set of 5–15 flashcards about the given topic. Each card has a "front" (question or term) and a "back" (answer or definition).`
      : mode === "quiz"
      ? `Generate a set of 5–15 multiple-choice quiz questions about the given topic. Each question must have 4 choices, exactly one correct answer identified by "correctIndex" (0-based index into the choices array), and a short explanation of why the correct answer is right.`
      : `Generate a set of 5–15 study checklist items about the given topic. Each item has a "title" (short concept name) and a "description" (what the student should understand or be able to demonstrate).`;

  return `You are a study-material generator. ${modeInstructions}

Return ONLY valid JSON matching this exact shape — no prose, no markdown code fences, no extra keys:

${example}

Rules:
- Every "id" must be a unique string (use "1", "2", "3", etc.).
- The "topic" field must reflect the actual topic, not the example.
- Do not wrap the JSON in code fences or add any text before/after it.
- If mode is "quiz", "correctIndex" must be a valid index into the "choices" array.
- Generate substantive, educational content — not trivial or obvious questions.

Topic: ${topic}`;
}
