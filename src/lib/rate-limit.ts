import "server-only";

/**
 * Rate limiting for the public write endpoints.
 *
 * `POST /api/booking` is public and unauthenticated by design — it *is* the
 * booking flow — and it writes a row on every call. Without a limit, a script
 * can create ten thousand bookings in a minute and bury the real ones.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * READ THIS BEFORE TRUSTING IT
 *
 * The counter lives in the process's memory. That is genuinely useful in
 * development and on a single long-lived server, and it is genuinely WEAK on
 * Vercel, where each serverless instance keeps its own counter and instances
 * come and go. An attacker spread across enough cold starts gets more than the
 * limit suggests.
 *
 * It is a speed bump, not a wall. It raises the cost of casual abuse to
 * something above zero, which is where we are starting from today.
 *
 * The real fix is a shared store — Vercel's firewall, or Upstash Redis keyed the
 * same way. `check()` is deliberately shaped like those so swapping the backing
 * store means changing this file and nothing else.
 * ─────────────────────────────────────────────────────────────────────────────
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

/** Stop the Map growing without bound in a long-lived process. */
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 60_000;

function sweep(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export type RateLimitRule = {
  /** Distinguishes one endpoint's budget from another's. */
  name: string;
  /** Requests permitted per window. */
  limit: number;
  windowMs: number;
};

/** Five bookings per ten minutes is far above a real guest, far below a script. */
export const BOOKING_LIMIT: RateLimitRule = {
  name: "booking",
  limit: 5,
  windowMs: 10 * 60_000,
};

/** Uploads are already admin-gated; this is a backstop against a runaway loop. */
export const UPLOAD_LIMIT: RateLimitRule = {
  name: "upload",
  limit: 60,
  windowMs: 10 * 60_000,
};

/**
 * Consume one unit of the caller's budget. Throws once it is spent.
 *
 * Keyed on the client IP. On Vercel `x-forwarded-for` is set by the platform
 * and cannot be spoofed by the client; running anywhere else, it is a header
 * like any other and a determined caller can forge it. Another reason this is
 * a speed bump.
 */
export function rateLimit(request: Request, rule: RateLimitRule): void {
  const now = Date.now();
  sweep(now);

  const key = `${rule.name}:${clientIp(request)}`;
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + rule.windowMs });
    return;
  }

  existing.count += 1;

  if (existing.count > rule.limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000),
    );
    throw new RateLimitError(
      `Too many requests. Try again in ${retryAfterSeconds} seconds.`,
      retryAfterSeconds,
    );
  }
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Left-most entry is the original client; the rest are proxies.
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export class RateLimitError extends Error {
  readonly retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
