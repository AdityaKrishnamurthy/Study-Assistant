"use client";

/**
 * components/ThemeToggle.jsx — Light / Dark Theme Switcher
 * 
 * High-level purpose:
 * - Toggles application theme between `light` and `dark` modes.
 * - Mutates `document.documentElement.dataset.theme` attribute for instant CSS variable switching.
 * - Reads and saves preference to `window.localStorage` ('theme') with fallback to system prefers-color-scheme.
 */

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    let storedTheme = null;
    try {
      storedTheme = window.localStorage.getItem("theme");
    } catch {
      // Theme selection still works when storage is unavailable.
    }

    const initialTheme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    document.documentElement.dataset.theme = initialTheme;
    const frame = window.requestAnimationFrame(() => setTheme(initialTheme));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem("theme", nextTheme);
    } catch {
      // Keep the active theme even when persistence is unavailable.
    }
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--fg-muted)] shadow-[var(--shadow-sm)] transition-colors duration-150 hover:border-[var(--primary)] hover:text-[var(--primary)]"
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
