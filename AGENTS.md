# AGENTS.md — Study Assistant

You are executing, not designing. All design decisions live in `DESIGN.md`.
All work is broken into numbered plans in `plans/`. Work one plan at a time,
in order, unless told otherwise.

## Before touching code
1. Read `DESIGN.md` in full.
2. Read `plans/README.md` and `plans/PLANS.md` in full, then read the plan
   file you're about to execute in full.
3. Run the plan's drift-check command. If the repo doesn't match what the
   plan assumed, stop and report the mismatch — don't improvise a fix.

## Ground rules
- Follow the plan step by step. If a step's stated result doesn't happen,
  stop and report — do not silently "improve" or reinterpret the step.
- No dependencies beyond what a plan explicitly names. If you think you need
  one, stop and ask.
- Small, meaningful commits. One commit per completed plan step group, not
  one commit per plan and not one commit for the whole project.
- Never put the AI API key in any client-side file, any file under `src/`,
  `app/`, `components/`, or anything that ships to the browser. It lives in
  `.env.local` only and is read exclusively inside `app/api/**/route.ts`.
- TypeScript is used for the data contract (`lib/schema.ts`) even though the
  project overall doesn't require it end-to-end — the contract is the part
  that most needs to not silently drift.

## Project shape
- Next.js App Router.
- `app/api/generate/route.ts` — the only place that calls the LLM.
- `lib/schema.ts` — the structured-output contract + validator.
- `lib/prompt.ts` — prompt construction.
- `components/` — presentational + stateful UI, no direct API calls except
  through `lib/client.ts`.

## When you're done with a plan
Update the plan's Status line (`Status: done`) and note the actual time
spent vs. estimated, in the plan file itself. Update the corresponding row in
`plans/PLANS.md` in the same completed plan's final commit, including the
status and progress summary. Update the corresponding row in the `README.md`
**Time Spent** table in that same final commit, including its task summary and
actual time; update the total there as well. This keeps the time audit honest
rather than guessed.

## Stop conditions
Stop and ask the user (don't just pick something) if:
- A plan's drift-check fails.
- You're about to add a package not named in the plan.
- You're about to spend more than ~25% over a plan's time estimate.
- The LLM provider's actual response shape doesn't match what `DESIGN.md`
  assumed (this is expected to happen — see DESIGN.md's failure-handling
  section for what to do instead of guessing).

## Git workflow
- Commit at the end of every step GROUP within a plan (not per plan,
  not per file) — a step group is verified/working before you commit it.
- Commits are milestone-based: trigger a commit when a step group's own
  stated verification passes, not on a timer.
- Commit message format: `<plan-number>: <short description>`, e.g.
  `007: add complete README with setup, usage, AI-usage note, and time audit`. Do NOT include "Step Group" or "Step Group X" in commit messages.
- If something breaks mid-plan and can't be fixed quickly, STOP and ask
  me before running `git reset --hard` or discarding any work. Propose
  the revert, don't execute it unprompted.
- Never amend or rebase commits without being asked. History stays
  linear so I can revert cleanly myself if needed.
