// app/api/generate/route.ts — The ONLY place that calls the LLM.
// Reads GEMINI_API_KEY from process.env (server-only).
// Validates all model output through parseDeck before returning to client.

import { NextRequest, NextResponse } from "next/server";
import { parseDeck } from "@/lib/schema";
import { buildPrompt, type DeckMode } from "@/lib/prompt";

// ─── Request validation ──────────────────────────────────────────────

function isValidMode(v: unknown): v is DeckMode {
  return v === "flashcards" || v === "quiz";
}

// ─── Gemini API call ─────────────────────────────────────────────────

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
    // Distinguish rate-limit from other provider errors
    if (res.status === 429) {
      throw new Error("RATE_LIMIT");
    }
    throw new Error(`PROVIDER_ERROR: ${res.status}`);
  }

  const data = await res.json();

  // Extract text from Gemini response
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("PROVIDER_ERROR: no text in response");
  }

  return text;
}

// ─── POST handler ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables");
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

    // Build prompt and call Gemini
    const prompt = buildPrompt(topic.trim(), mode);
    const rawText = await callGemini(prompt, apiKey);

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

    // Map known error types to specific kinds
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
