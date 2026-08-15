# Study Assistant — AI Flashcards & Quizzes

Study Assistant is an interactive web application that transforms raw lecture notes or any topic prompt into structured, stateful **Flashcard Decks**, self-retrieval **Quiz Decks**, and interactive concept **Checklists** with instant feedback, progress tracking, and retest queues.

Built with **Next.js (App Router)**, **TypeScript** data contracts, and **Tailwind CSS**, with a resilient 5-tier multi-provider AI backend supporting Groq (`openai/gpt-oss-120b`), NVIDIA NIM (`meta/llama-3.1-8b-instruct`), Mistral (`mistral-small-latest`), Google Gemini Direct (`gemini-2.0-flash`), and OpenRouter (`google/gemini-2.5-flash`).

---

## 🎥 Demo Video (Desktop & Mobile)

Watch the feature walkthrough demonstrating Desktop and Mobile viewports:

<a href="https://youtu.be/tXTwr28cEvY" target="_blank" rel="noopener noreferrer">
  <img src="https://i.ytimg.com/vi/tXTwr28cEvY/maxresdefault.jpg?v=2" alt="Study Assistant Demo - Desktop & Mobile Walkthrough" width="100%" />
</a>

👉 <a href="https://youtu.be/tXTwr28cEvY" target="_blank" rel="noopener noreferrer"><strong>Watch Demo Video on YouTube</strong></a>

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
> 1. `Groq (openai/gpt-oss-120b)` (Primary — ~1s latency)
> 2. `NVIDIA NIM (meta/llama-3.1-8b-instruct)` (Fallback 1)
> 3. `Mistral (mistral-small-latest)` (Fallback 2)
> 4. `Gemini Direct (gemini-2.0-flash)` (Fallback 3)
> 5. `OpenRouter (google/gemini-2.5-flash)` (Fallback 4)

### 📝 Test Data
You can copy sample study notes from this link for quick generation testing:  
👉 <a href="https://katb.in/sevuzugusiy" target="_blank" rel="noopener noreferrer"><strong>Sample Study Notes</strong></a>

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Usage Guide

- **Flashcard Mode:** Enter any topic or paste study notes, toggle to **Flashcards**, and click **Generate**. Tap/click cards or press `Space` to flip between question and answer. Use `←` / `→` arrows to navigate. Bookmark tricky cards with ⭐ for focused review.
- **Quiz Mode:** Enter a topic, select **Quiz Mode**, and take an interactive test with instant choice validation, immediate correct/incorrect feedback, and educational explanations.
- **Checklist Mode:** Select **Checklist**, and generate a structured study checklist of key concepts. Check items off as you review them to track progress percentage.
- **Retest Loop:** After finishing a quiz, hit **Retest Missed Questions** to cycle only missed questions until mastery is achieved.
- **Recent Decks & Persistence:** Generated decks and checklist progress automatically save locally. Reload any recent deck instantly from the Input Screen without calling the AI API again.

---

## 🤖 AI Usage & Architecture Note

This project was built using an **AI-Assisted Spec & Execution Methodology**:

- **System Prompting & Data Safety:** All LLM calls pass through `app/api/generate/route.ts` (server-side only). No API keys ship to client code.
- **Strict Data Contract (`lib/schema.ts`):** The application never trusts raw LLM outputs. Model outputs are validated against the `Deck` data contract, code fences (\`\`\`json) are stripped, and errors are categorized into tagged `kind` states (`parse`, `shape`, `empty`, `rate_limit`, `network`).
- **Resilient Fallback Architecture:** Designed with a 5-tier multi-provider fallback chain (`Groq` ➔ `NVIDIA` ➔ `Mistral` ➔ `Gemini Direct` ➔ `OpenRouter`) so client requests seamlessly failover if any provider hits rate limits or quota boundaries.
- **UI Design System:** Built using specialized **frontend design skills** for modern, crafted visual aesthetics (tailored HSL color palette, DM Serif Display typography, custom scrollbars, and dynamic viewport constraints) rather than generic templates.
- **Agent Governance & Workflow (`AGENTS.md`):** Strict agent execution rules were enforced via `AGENTS.md` to govern AI behavior, requiring pre-flight drift checks, strict schema adherence, zero silent fixes, and milestone-based git commits.
- **Planning & Execution:** All work was executed in numbered milestone plans (`plans/001` through `plans/012`) following strict git workflow conventions.

---

## ⏱️ Time Spent

Total development time: **~7.7 hours** (462 minutes)

| Plan / Milestone | Task | Actual Time |
|---|---|---|
| **001** | Project setup, git exclusions, env config | ~15 min |
| **002** | Schema data contract, prompt builder, API route & fallback | ~35 min |
| **003** | Input screen & explicit 4-state UI machine | ~25 min |
| **004** | Interactive 3D Flashcard viewer & keyboard shortcuts | ~20 min |
| **005** | Interactive Quiz UI & Retest loop queue | ~25 min |
| **006** | Mobile responsiveness polish & scroll bounds | ~35 min |
| **007** | README & submission audit | ~15 min |
| **008** | Graph Paper UI revamp, theme toggle, and desktop grid layout | ~65 min |
| **009** | Mobile touch fix, HMR allowed origins & viewport height constraint (`h-full`) | ~60 min |
| **010** | 5-tier LLM provider integration (Groq, NVIDIA, Mistral), benchmarking & docs | ~45 min |
| **011** | Save/reload sessions (`localStorage`), Recent Decks UI & progress persistence | ~40 min |
| **012** | Multiple block types: Checklist study format (`ChecklistDeck`) | ~52 min |
| **013** | Demo video & documentation finalization | ~30 min |

---

## ⚠️ Known Limitations & Stretch Goals

- **Atomic Deck Generation vs. Token Streaming:** Decks generate atomically via validated JSON responses rather than token streaming to ensure 100% data contract integrity (`lib/schema.ts`).
- **Multi-Turn Deck Refinement Loop:** Currently, changing topics generates a new deck from scratch rather than performing an in-place edit on existing cards.

### ✅ Completed Stretch Goals
- **Session Persistence (`localStorage`):** Decks and checklist completion progress automatically persist locally and reload instantly from the Recent Decks panel without calling the AI API again.
- **Multiple Block Types (Checklist Mode):** Extended schema and prompt strategy to support 3 study modes: 3D Flashcards, Interactive Quizzes, and Concept Checklists.
- **5-Tier AI Failover Chain:** Multi-provider failover backend across Groq, NVIDIA NIM, Mistral, Gemini Direct, and OpenRouter.
