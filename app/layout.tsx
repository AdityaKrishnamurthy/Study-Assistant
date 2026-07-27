/**
 * app/layout.tsx — Root Layout Component for Study Assistant
 * 
 * High-level purpose:
 * - Configures global fonts using `next/font/google` CSS variables.
 * - Imports base stylesheet (`globals.css`).
 * - Defines page metadata (title, description) for SEO.
 * - Wraps all page content inside <html> and <body> elements with global CSS variables and classes.
 * - In development mode, dynamically injects the `react-grab` script for developer inspection on desktop localhost.
 */

import type { Metadata } from "next";

import { DM_Serif_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Study Assistant — AI Flashcards & Quizzes",
  description: "Turn your notes into interactive study decks and self-retrieval quizzes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        {process.env.NODE_ENV === "development" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                  if (isLocal && !isMobile) {
                    const script = document.createElement('script');
                    script.src = '//unpkg.com/react-grab/dist/index.global.js';
                    script.crossOrigin = 'anonymous';
                    document.head.appendChild(script);
                  }
                })();
              `
            }}
          />
        )}
      </head>

      <body className="h-full bg-[var(--bg)] text-[var(--fg)] selection:bg-[var(--primary)] selection:text-white">
        {children}
      </body>
    </html>
  );
}
