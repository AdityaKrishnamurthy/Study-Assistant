// app/api/generate/route.ts — The ONLY place that calls the LLM.
// Supports multi-provider fallback chain:
// 1. Groq (llama-3.3-70b-versatile)
// 2. NVIDIA NIM (meta/llama-3.1-8b-instruct)
// 3. Mistral (mistral-small-latest)
// 4. Gemini Direct (gemini-2.0-flash)
// 5. OpenRouter (google/gemini-2.5-flash)
// Reads API keys from process.env (server-only).
// Validates all model output through parseDeck before returning to client.

import { NextRequest, NextResponse } from "next/server";
import { parseDeck } from "@/lib/schema";
import { buildPrompt, type DeckMode } from "@/lib/prompt";

// ─── Request validation ──────────────────────────────────────────────

function isValidMode(v: unknown): v is DeckMode {
  return v === "flashcards" || v === "quiz" || v === "checklist";
}

// ─── Helper for OpenAI-compatible providers ──────────────────────────

async function callOpenAICompatible(
  url: string,
  apiKey: string,
  model: string,
  prompt: string,
  providerName: string,
  extraHeaders: Record<string, string> = {}
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("RATE_LIMIT");
    }
    throw new Error(`${providerName}_ERROR: ${res.status}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string") {
    throw new Error(`${providerName}_ERROR: no text in response`);
  }

  return text;
}

// ─── 1. Groq (llama-3.3-70b-versatile) ────────────────────────────────

async function callGroq(prompt: string, apiKey: string): Promise<string> {
  return callOpenAICompatible(
    "https://api.groq.com/openai/v1/chat/completions",
    apiKey,
    "llama-3.3-70b-versatile",
    prompt,
    "GROQ"
  );
}

// ─── 2. NVIDIA NIM (meta/llama-3.1-8b-instruct) ──────────────────────

async function callNvidia(prompt: string, apiKey: string): Promise<string> {
  return callOpenAICompatible(
    "https://integrate.api.nvidia.com/v1/chat/completions",
    apiKey,
    "meta/llama-3.1-8b-instruct",
    prompt,
    "NVIDIA"
  );
}

// ─── 3. Mistral (mistral-small-latest) ───────────────────────────────

async function callMistral(prompt: string, apiKey: string): Promise<string> {
  return callOpenAICompatible(
    "https://api.mistral.ai/v1/chat/completions",
    apiKey,
    "mistral-small-latest",
    prompt,
    "MISTRAL"
  );
}

// ─── 4. Gemini Direct (gemini-2.0-flash) ──────────────────────────────

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

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
    throw new Error(`GEMINI_ERROR: ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("GEMINI_ERROR: no text in Gemini response");
  }

  return text;
}

// ─── 5. OpenRouter (google/gemini-2.5-flash) ─────────────────────────

async function callOpenRouter(prompt: string, apiKey: string): Promise<string> {
  return callOpenAICompatible(
    "https://openrouter.ai/api/v1/chat/completions",
    apiKey,
    "google/gemini-2.5-flash",
    prompt,
    "OPENROUTER",
    {
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Study Assistant",
    }
  );
}

// ─── Multi-provider fallback executor ─────────────────────────────

async function callLLM(prompt: string): Promise<string> {
  const providers = [
    { name: "Groq", key: process.env.GROQ_API_KEY, fn: callGroq },
    { name: "NVIDIA", key: process.env.NVIDIA_API_KEY, fn: callNvidia },
    { name: "Mistral", key: process.env.MISTRAL_API_KEY, fn: callMistral },
    { name: "Gemini Direct", key: process.env.GEMINI_API_KEY, fn: callGemini },
    { name: "OpenRouter", key: process.env.OPENROUTER_API_KEY, fn: callOpenRouter },
  ];

  const availableProviders = providers.filter((p) => Boolean(p.key));
  if (availableProviders.length === 0) {
    throw new Error("NO_API_KEY");
  }

  for (let i = 0; i < availableProviders.length; i++) {
    const provider = availableProviders[i];
    try {
      return await provider.fn(prompt, provider.key!);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const nextProvider = availableProviders[i + 1];
      if (nextProvider) {
        console.warn(`${provider.name} failed (${msg}), trying ${nextProvider.name} fallback...`);
      } else {
        console.error(`All configured providers failed. Last error on ${provider.name}:`, msg);
        throw error;
      }
    }
  }

  throw new Error("NO_API_KEY");
}

// ─── POST handler ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Validate at least one API key exists
    if (
      !process.env.GROQ_API_KEY &&
      !process.env.NVIDIA_API_KEY &&
      !process.env.MISTRAL_API_KEY &&
      !process.env.GEMINI_API_KEY &&
      !process.env.OPENROUTER_API_KEY
    ) {
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
        { kind: "shape", message: "mode must be 'flashcards', 'quiz', or 'checklist'" },
        { status: 400 }
      );
    }

    // Build prompt and call multi-provider LLM chain
    const prompt = buildPrompt(topic.trim(), mode);
    const rawText = await callLLM(prompt);

    // Validate model output through parseDeck — never trust raw output
    const result = parseDeck(rawText);

    if (result.ok) {
      return NextResponse.json(result.deck, { status: 200 });
    }

    // Log raw response for debugging
    console.error(`parseDeck failed (kind: ${result.kind}). Raw model output:`, rawText);

    if (result.kind === "empty") {
      return NextResponse.json(
        { kind: "empty", message: "The AI didn't generate any cards" },
        { status: 422 }
      );
    }

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

    if (message.includes("_ERROR")) {
      return NextResponse.json(
        { kind: "provider_error", message: "AI provider error" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { kind: "network", message: "Failed to reach AI provider" },
      { status: 502 }
    );
  }
}
