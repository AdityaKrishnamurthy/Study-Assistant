// lib/prompt.ts — Prompt construction for Gemini
// Takes a topic and mode, returns the instruction prompt.
// Includes a tiny few-shot example shape per DESIGN.md's prompting strategy.

export type DeckMode = "flashcards" | "quiz";

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

export function buildPrompt(topic: string, mode: DeckMode): string {
  const example = mode === "flashcards" ? FLASHCARD_EXAMPLE : QUIZ_EXAMPLE;

  const modeInstructions =
    mode === "flashcards"
      ? `Generate a set of 5–15 flashcards about the given topic. Each card has a "front" (question or term) and a "back" (answer or definition).`
      : `Generate a set of 5–15 multiple-choice quiz questions about the given topic. Each question must have 4 choices, exactly one correct answer identified by "correctIndex" (0-based index into the choices array), and a short explanation of why the correct answer is right.`;

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
