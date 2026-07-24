# Study Assistant — AI Flashcards & Quizzes

Study Assistant is an interactive web application that transforms raw lecture notes or any topic prompt into structured, stateful **Flashcard Decks** and self-retrieval **Quiz Decks** with instant feedback and retest queues.

Built with **Next.js (App Router)**, **TypeScript** data contracts, and **Tailwind CSS**, with a resilient multi-provider AI backend supporting OpenRouter (Gemini Flash) as the main provider and direct Google Gemini API as fallback.

---

## 🚀 Setup Instructions

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd study-assistant
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note:** At least one valid API key is required. The server route uses a 2-tier automatic fallback chain: `OpenRouter (Gemini Flash)` (Main) ➔ `Gemini Direct` (Fallback).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Usage Guide

- **Flashcard Mode:** Enter any topic or paste study notes, toggle to **Flashcards**, and click **Generate**. Tap/click cards or press `Space` to flip between question and answer. Use `←` / `→` arrows to navigate. Bookmark tricky cards with ⭐ for focused review.
- **Quiz Mode:** Enter a topic, select **Quiz Mode**, and take an interactive test with instant choice validation, immediate correct/incorrect feedback, and educational explanations.
- **Retest Loop:** After finishing a quiz, hit **Retest Missed Questions** to cycle only missed questions until mastery is achieved.

---

## 🤖 AI Usage & Architecture Note

This project was built using an **AI-Assisted Spec & Execution Methodology**:

- **System Prompting & Data Safety:** All LLM calls pass through `app/api/generate/route.ts` (server-side only). No API keys ship to client code.
- **Strict Data Contract (`lib/schema.ts`):** The application never trusts raw LLM outputs. Model outputs are validated against the `Deck` data contract, code fences (\`\`\`json) are stripped, and errors are categorized into tagged `kind` states (`parse`, `shape`, `empty`, `rate_limit`, `network`).
- **Resilient Fallback Architecture:** Designed with multi-provider fallback (OpenRouter with Gemini Flash as main ➔ Gemini Direct API as fallback) so client requests seamlessly failover if a primary provider hits rate limits or quota boundaries.
- **Planning & Execution:** All work was executed in numbered milestone plans (`plans/001` through `plans/008`) following strict git workflow conventions.

---

## ⏱️ Time Spent

Total development time: **~2.9 hours** (175 minutes)

| Plan | Task | Actual Time |
|---|---|---|
| **001** | Project setup, git exclusions, env config | ~15 min |
| **002** | Schema data contract, prompt builder, API route & fallback | ~35 min |
| **003** | Input screen & explicit 4-state UI machine | ~25 min |
| **004** | Interactive 3D Flashcard viewer & keyboard shortcuts | ~15 min |
| **005** | Interactive Quiz UI & Retest loop queue | ~20 min |
| **006** | Mobile responsiveness polish & scroll bounds | ~15 min |
| **007** | README & submission audit | ~15 min |
| **008** | Graph Paper UI revamp, themes, and responsive polish | ~35 min |

---

## ⚠️ Known Limitations & Stretch Goals

- **Session Persistence:** Decks live in React state during active sessions (stretch goal: `localStorage` save/reload).
- **Streaming Output:** Decks generate atomically via validated JSON responses rather than token streaming to ensure 100% data contract integrity.
