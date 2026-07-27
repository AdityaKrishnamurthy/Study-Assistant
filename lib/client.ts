/**
 * lib/client.ts — Client-side API Client for Study Deck Generation
 * 
 * High-level purpose:
 * - Provides `generateDeck()` function consumed by UI components (`app/page.tsx`).
 * - Enforces a 12-second client-side timeout using `AbortController` and `AbortSignal.any`.
 * - Handles HTTP response parsing and maps network/server errors into strongly-typed `ClientErrorKind` results.
 */

import type { Deck, DeckError } from "./schema";
import type { DeckMode } from "./prompt";

export type ClientErrorKind = DeckError | "timeout" | "network" | "rate_limit" | "provider_error";

export type GenerateDeckResult =
  | { ok: true; deck: Deck }
  | { ok: false; kind: ClientErrorKind; message?: string };

const TIMEOUT_MS = 12000; // 12 second client-side timeout

export async function generateDeck(
  topic: string,
  mode: DeckMode,
  signal?: AbortSignal
): Promise<GenerateDeckResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Combine parent signal (if any) with our timeout signal
  const combinedSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, mode }),
      signal: combinedSignal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);

    if (response.ok && data && typeof data === "object" && "mode" in data) {
      return { ok: true, deck: data as Deck };
    }

    // Server returned a known error kind
    if (data && typeof data === "object" && "kind" in data) {
      return {
        ok: false,
        kind: data.kind as ClientErrorKind,
        message: data.message,
      };
    }

    if (response.status === 429) {
      return { ok: false, kind: "rate_limit", message: "Rate limit exceeded" };
    }

    return { ok: false, kind: "provider_error", message: "Server returned error status" };
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError" || controller.signal.aborted) {
        return { ok: false, kind: "timeout", message: "Request timed out" };
      }
    }

    return { ok: false, kind: "network", message: "Network request failed" };
  }
}
