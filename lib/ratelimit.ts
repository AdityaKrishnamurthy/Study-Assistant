/**
 * lib/ratelimit.ts — Server-Side Sliding Window Rate Limiter
 * 
 * High-level purpose:
 * - Protects the backend AI generation endpoint (`/api/generate`) and multi-provider API keys
 *   from brute-force abuse, malicious automated traffic, and rapid spamming.
 * - Zero external dependencies (no Redis required); operates in-memory with automatic stale-entry cleanup.
 * - Enforces a configurable sliding window limit (default: 5 requests per 60 seconds per IP).
 * - Standard HTTP 429 compliance with Retry-After and X-RateLimit-* response headers.
 */

import type { NextRequest } from "next/server";

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  retryAfterSeconds: number;
};

// Configuration defaults
const DEFAULT_MAX_REQUESTS = 5;
const DEFAULT_WINDOW_MS = 60 * 1000; // 60 seconds

// In-memory sliding window store: IP -> array of request timestamps (epoch ms)
const ipRequestLog = new Map<string, number[]>();

// Last cleanup timestamp
let lastCleanupTime = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Clean up stale IP records older than the sliding window to prevent memory leaks.
 */
function cleanupStaleEntries(now: number, windowMs: number): void {
  if (now - lastCleanupTime < CLEANUP_INTERVAL_MS) {
    return;
  }
  lastCleanupTime = now;
  const threshold = now - windowMs;

  for (const [ip, timestamps] of ipRequestLog.entries()) {
    const validTimestamps = timestamps.filter((t) => t > threshold);
    if (validTimestamps.length === 0) {
      ipRequestLog.delete(ip);
    } else {
      ipRequestLog.set(ip, validTimestamps);
    }
  }
}

/**
 * Extract client IP address from standard proxy/CDN headers.
 */
export function getClientIp(request: NextRequest): string {
  // Check Cloudflare
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp && cfIp.trim().length > 0) {
    return cfIp.trim();
  }

  // Check X-Forwarded-For (take the first client IP in chain)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor && forwardedFor.trim().length > 0) {
    const parts = forwardedFor.split(",");
    const clientIp = parts[0]?.trim();
    if (clientIp) {
      return clientIp;
    }
  }

  // Check X-Real-IP
  const realIp = request.headers.get("x-real-ip");
  if (realIp && realIp.trim().length > 0) {
    return realIp.trim();
  }

  return "127.0.0.1";
}

/**
 * Check if the incoming request from a client IP is allowed within the sliding window.
 */
export function checkRateLimit(
  request: NextRequest,
  options?: { maxRequests?: number; windowMs?: number }
): RateLimitResult {
  const now = Date.now();
  const envLimit = Number(process.env.RATE_LIMIT_MAX_PER_MINUTE);
  const maxRequests =
    options?.maxRequests ?? (!isNaN(envLimit) && envLimit > 0 ? envLimit : DEFAULT_MAX_REQUESTS);
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;

  // Run periodic garbage collection
  cleanupStaleEntries(now, windowMs);

  const ip = getClientIp(request);
  const existingTimestamps = ipRequestLog.get(ip) || [];

  // Filter timestamps to only include those within the sliding window
  const windowStart = now - windowMs;
  const activeTimestamps = existingTimestamps.filter((t) => t > windowStart);

  if (activeTimestamps.length >= maxRequests) {
    // Earliest timestamp within the current active window determines the reset time
    const oldestInWindow = activeTimestamps[0];
    const msUntilOldestExpires = Math.max(0, oldestInWindow + windowMs - now);
    const retryAfterSeconds = Math.max(1, Math.ceil(msUntilOldestExpires / 1000));
    const resetSeconds = retryAfterSeconds;

    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetSeconds,
      retryAfterSeconds,
    };
  }

  // Under limit: record new request timestamp
  activeTimestamps.push(now);
  ipRequestLog.set(ip, activeTimestamps);

  const remaining = Math.max(0, maxRequests - activeTimestamps.length);
  const oldestInWindow = activeTimestamps[0];
  const resetSeconds = Math.max(1, Math.ceil((oldestInWindow + windowMs - now) / 1000));

  return {
    allowed: true,
    limit: maxRequests,
    remaining,
    resetSeconds,
    retryAfterSeconds: 0,
  };
}

/**
 * Format rate limit result into standard HTTP headers.
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetSeconds),
  };
}

/**
 * Reset memory store (primarily for unit testing).
 */
export function _resetRateLimitStore(): void {
  ipRequestLog.clear();
}
