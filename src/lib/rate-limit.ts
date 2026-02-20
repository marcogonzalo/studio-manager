/**
 * In-memory rate limiter for API routes (auth, upload, account/delete).
 * Uses fixed 60s window per IP and route group. Suitable for single-instance
 * or Edge; for multi-instance production consider Redis (e.g. @upstash/ratelimit).
 */

const WINDOW_MS = 60_000;

type RouteGroup = "auth" | "upload" | "account-delete";

const LIMITS: Record<RouteGroup, number> = {
  auth: 10,
  upload: 20,
  "account-delete": 5,
};

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

function prune(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

export function checkRateLimit(
  ip: string,
  routeGroup: RouteGroup
): { allowed: boolean; remaining: number; resetAt: number } {
  const limit = LIMITS[routeGroup];
  const key = `${ip}:${routeGroup}`;
  const now = Date.now();

  // Prune expired entries occasionally (every ~100 checks we might prune once)
  if (Math.random() < 0.01) prune();

  let entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(key, entry);
  }

  entry.count += 1;
  const allowed = entry.count <= limit;
  const remaining = Math.max(0, limit - entry.count);

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

export function getRouteGroup(pathname: string): RouteGroup | null {
  if (pathname.startsWith("/api/auth")) return "auth";
  if (pathname.startsWith("/api/upload")) return "upload";
  if (pathname === "/api/account/delete") return "account-delete";
  return null;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
