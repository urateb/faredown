import type { NextRequest } from 'next/server';

/**
 * Fixed-window rate limiting, per client, per route.
 *
 * The upstream provider charges per call, so an unthrottled public endpoint is
 * a billing incident waiting to happen. Like the cache, this lives in process
 * memory: it holds back casual abuse from one client without adding a database,
 * but it does not coordinate across serverless instances and should be replaced
 * by a shared store before this handles serious traffic.
 */
interface Window {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window rolls over, for the `Retry-After` header. */
  retryAfterSeconds: number;
}

const windows = new Map<string, Window>();

export function resetRateLimits(): void {
  windows.clear();
}

/** Best-effort client identity. Behind a proxy, `x-forwarded-for` is the real address. */
export function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  return first || request.headers.get('x-real-ip') || 'anonymous';
}

export function rateLimit(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  return { allowed: true, remaining: limit - existing.count, retryAfterSeconds };
}
