# Study Assistant — AI Flashcards & Quizzes

Study Assistant is an interactive web application that transforms raw lecture notes or any topic prompt into structured, stateful **Flashcard Decks** and self-retrieval **Quiz Decks** with instant feedback and retest queues.

Built with **Next.js (App Router)**, **TypeScript** data contracts, and **Tailwind CSS**, with a resilient 5-tier multi-provider AI backend supporting Groq (`llama-3.3-70b-versatile`), NVIDIA NIM (`meta/llama-3.1-8b-instruct`), Mistral (`mistral-small-latest`), Google Gemini Direct (`gemini-2.0-flash`), and OpenRouter (`google/gemini-2.5-flash`).

---

## 🚀 Setup Instructions

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/AdityaKrishnamurthy/Study-Assistant.git
cd study-assistant
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
GROQ_API_KEY=your_groq_api_key_here
NVIDIA_API_KEY=your_nvidia_api_key_here
MISTRAL_API_KEY=your_mistral_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```
> **Note:** At least one valid API key is required. The server route uses a 5-tier automatic fallback chain:
> 1. `Groq (llama-3.3-70b-versatile)` (Primary — ~200ms latency)
> 2. `NVIDIA NIM (meta/llama-3.1-8b-instruct)` (Fallback 1)
> 3. `Mistral (mistral-small-latest)` (Fallback 2)
> 4. `Gemini Direct (gemini-2.0-flash)` (Fallback 3)
> 5. `OpenRouter (google/gemini-2.5-flash)` (Fallback 4)

### 📝 Test Data
You can copy sample study notes from this link for quick generation testing:
👉 **[Sample Study Notes](https://katb.in/odavuharile)**

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
- **Resilient Fallback Architecture:** Designed with a 5-tier multi-provider fallback chain (`Groq` ➔ `NVIDIA` ➔ `Mistral` ➔ `Gemini Direct` ➔ `OpenRouter`) so client requests seamlessly failover if any provider hits rate limits or quota boundaries.
- **UI Design System:** Built using specialized **frontend design skills** for modern, crafted visual aesthetics (tailored HSL color palette, DM Serif Display typography, custom scrollbars, and dynamic viewport constraints) rather than generic templates.
- **Agent Governance & Workflow (`AGENTS.md`):** Strict agent execution rules were enforced via `AGENTS.md` to govern AI behavior, requiring pre-flight drift checks, strict schema adherence, zero silent fixes, and milestone-based git commits.
- **Planning & Execution:** All work was executed in numbered milestone plans (`plans/001` through `plans/008`) following strict git workflow conventions.

---

## ⏱️ Time Spent

Total development time: **~4.1 hours** (245 minutes)

| Plan / Milestone | Task | Actual Time |
|---|---|---|
| **001** | Project setup, git exclusions, env config | ~15 min |
| **002** | Schema data contract, prompt builder, API route & fallback | ~35 min |
| **003** | Input screen & explicit 4-state UI machine | ~25 min |
| **004** | Interactive 3D Flashcard viewer & keyboard shortcuts | ~15 min |
| **005** | Interactive Quiz UI & Retest loop queue | ~20 min |
| **006** | Mobile responsiveness polish & scroll bounds | ~15 min |
| **007** | README & submission audit | ~15 min |
| **008** | Graph Paper UI revamp, theme toggle, and desktop grid layout | ~35 min |
| **009** | Mobile touch fix, HMR allowed origins & viewport height constraint (`h-full`) | ~35 min |
| **010** | 5-tier LLM provider integration (Groq, NVIDIA, Mistral), benchmarking & docs | ~35 min |

---

## ⚠️ Known Limitations & Stretch Goals

- **Session Persistence:** Decks live in React state during active sessions (stretch goal: `localStorage` save/reload).
- **Streaming Output:** Decks generate atomically via validated JSON responses rather than token streaming to ensure 100% data contract integrity.
