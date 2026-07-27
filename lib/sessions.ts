// lib/sessions.ts — Client-side session persistence using localStorage
import type { Deck } from "./schema";
import type { DeckMode } from "./prompt";

export type SavedSession = {
  id: string;
  topic: string;
  mode: DeckMode;
  deck: Deck;
  savedAt: string; // ISO date string
  checkedIds?: string[]; // persisted checklist progress
};

const STORAGE_KEY = "study-assistant-sessions";
const MAX_SESSIONS = 20;

function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function getSessions(): SavedSession[] {
  if (!isLocalStorageAvailable()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter valid session items gracefully
    return parsed.filter((item: unknown): item is SavedSession => {
      if (typeof item !== "object" || item === null) return false;
      const s = item as Record<string, unknown>;
      return (
        typeof s.id === "string" &&
        typeof s.topic === "string" &&
        (s.mode === "flashcards" || s.mode === "quiz" || s.mode === "checklist") &&
        typeof s.deck === "object" &&
        s.deck !== null &&
        typeof s.savedAt === "string"
      );
    });
  } catch {
    return [];
  }
}

export function saveSession(deck: Deck): string {
  if (!isLocalStorageAvailable()) return "";

  try {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newSession: SavedSession = {
      id,
      topic: deck.topic,
      mode: deck.mode,
      deck,
      savedAt: new Date().toISOString(),
    };

    const existing = getSessions();
    // Prepend new session and enforce MAX_SESSIONS cap (FIFO eviction for oldest)
    const updated = [newSession, ...existing.filter((s) => s.topic !== deck.topic || s.mode !== deck.mode)].slice(
      0,
      MAX_SESSIONS
    );

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return id;
  } catch (err) {
    console.warn("Failed to save session to localStorage:", err);
    return "";
  }
}

export function deleteSession(id: string): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const existing = getSessions();
    const updated = existing.filter((s) => s.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to delete session from localStorage:", err);
  }
}

export function clearAllSessions(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Failed to clear sessions from localStorage:", err);
  }
}

export function updateSessionProgress(sessionId: string, checkedIds: string[]): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const existing = getSessions();
    const updated = existing.map((s) =>
      s.id === sessionId ? { ...s, checkedIds } : s
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to update session progress:", err);
  }
}
