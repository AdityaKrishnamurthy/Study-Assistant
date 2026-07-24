// app/api/generate/route.ts — The ONLY place that calls the LLM.
// Supports multi-provider fallback: OpenRouter (google/gemini-2.5-flash) -> Gemini Direct (gemini-2.0-flash).
// Reads API keys from process.env (server-only).
// Validates all model output through parseDeck before returning to client.

import { NextRequest, NextResponse } from "next/server";
import { parseDeck } from "@/lib/schema";
import { buildPrompt, type DeckMode } from "@/lib/prompt";

// ─── Request validation ──────────────────────────────────────────────

function isValidMode(v: unknown): v is DeckMode {
  return v === "flashcards" || v === "quiz";
}

// ─── Provider: OpenRouter (google/gemini-2.5-flash) ──────────────────

async function callOpenRouter(prompt: string, apiKey: string): Promise<string> {
  const url = "https://openrouter.ai/api/v1/chat/completions";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Study Assistant",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("RATE_LIMIT");
    }
    throw new Error(`PROVIDER_ERROR: ${res.status}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string") {
    throw new Error("PROVIDER_ERROR: no text in OpenRouter response");
  }

  return text;
}

// ─── Provider: Gemini Direct (gemini-2.0-flash) ──────────────────────

const GEMINI_MODEL = "gemini-2.0-flash";

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("RATE_LIMIT");
    }
    throw new Error(`PROVIDER_ERROR: ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("PROVIDER_ERROR: no text in Gemini response");
  }

  return text;
}

// ─── Multi-provider call: OpenRouter -> Gemini Direct fallback ────────

async function callLLM(prompt: string): Promise<string> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // 1. Primary: OpenRouter (google/gemini-2.5-flash)
  if (openRouterKey) {
    try {
      return await callOpenRouter(prompt, openRouterKey);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`OpenRouter failed (${msg}), trying Gemini Direct fallback...`);
    }
  }

  // 2. Fallback: Gemini Direct (gemini-2.0-flash)
  if (geminiKey) {
    return await callGemini(prompt, geminiKey);
  }

  throw new Error("NO_API_KEY");
}

// ─── POST handler ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Validate at least one API key exists
    if (!process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY) {
      console.error("No API keys configured");
      return NextResponse.json(
        { kind: "provider_error", message: "API key not configured" },
        { status: 500 }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { kind: "parse", message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { topic, mode } = body as Record<string, unknown>;

    if (typeof topic !== "string" || topic.trim().length === 0) {
      return NextResponse.json(
        { kind: "shape", message: "topic is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!isValidMode(mode)) {
      return NextResponse.json(
        { kind: "shape", message: "mode must be 'flashcards' or 'quiz'" },
        { status: 400 }
      );
    }

    // Build prompt and call LLM (OpenRouter -> Gemini Direct)
    const prompt = buildPrompt(topic.trim(), mode);
    const rawText = await callLLM(prompt);

    // Validate model output through parseDeck — never trust raw output
    const result = parseDeck(rawText);

    if (result.ok) {
      return NextResponse.json(result.deck, { status: 200 });
    }

    // Log the raw response for debugging, never send to client
    console.error(`parseDeck failed (kind: ${result.kind}). Raw model output:`, rawText);

    if (result.kind === "empty") {
      return NextResponse.json(
        { kind: "empty", message: "The AI didn't generate any cards" },
        { status: 422 }
      );
    }

    // "parse" or "shape" — model returned garbage
    return NextResponse.json(
      { kind: result.kind, message: "Couldn't read the AI's response" },
      { status: 502 }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("API route error:", message);

    if (message === "NO_API_KEY") {
      return NextResponse.json(
        { kind: "provider_error", message: "No API key configured" },
        { status: 500 }
      );
    }

    if (message === "RATE_LIMIT") {
      return NextResponse.json(
        { kind: "rate_limit", message: "Rate limited by AI provider — try again in a moment" },
        { status: 429 }
      );
    }

    if (message.startsWith("PROVIDER_ERROR")) {
      return NextResponse.json(
        { kind: "provider_error", message: "AI provider error" },
        { status: 502 }
      );
    }

    // Network / unknown errors
    return NextResponse.json(
      { kind: "network", message: "Failed to reach AI provider" },
      { status: 502 }
    );
  }
}
