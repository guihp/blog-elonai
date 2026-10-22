// Fixed-window limiter kept in memory. On serverless hosting each instance has its own window, which is still
// enough to slow down password guessing and spam; the admin login also adds a delay and a lockout.
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    if (hits.size > 10_000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    return { ok: true, retryAfter: 0 };
  }
  entry.count++;
  return { ok: entry.count <= limit, retryAfter: Math.ceil((entry.reset - now) / 1000) };
}

export function resetLimit(key: string) {
  hits.delete(key);
}
