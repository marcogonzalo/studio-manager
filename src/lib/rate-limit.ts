/**
 * In-memory rate limiter for API routes (auth, upload, account/delete).
 * Uses fixed 60s window per IP and route group. Suitable for single-instance
 * or Edge; for multi-instance production consider Redis (e.g. @upstash/ratelimit).
 */

/** Mensaje único para el usuario cuando se excede el rate limit (auth, upload, account/delete). */
export const RATE_LIMIT_MESSAGE =
  "Has excedido el límite de solicitudes. Por favor, espera 30 segundos e intenta de nuevo.";

const WINDOW_MS = 60_000;

type RouteGroup =
  | "auth"
  | "upload"
  | "account-delete"
  | "contact"
  | "view-project";

const LIMITS: Record<RouteGroup, number> = {
  auth: 10,
  upload: 20,
  "account-delete": 5,
  contact: 5,
  "view-project": 120,
};

interface Entry {
  count: number;
  resetAt: number;
}

// Use a global store that persists across requests in the same Edge Runtime instance
// Note: In production with multiple Edge instances, consider using Redis/Upstash
declare global {
  var __rateLimitStore: Map<string, Entry> | undefined;
}

const store = globalThis.__rateLimitStore ?? new Map<string, Entry>();

// Always assign to globalThis to ensure persistence across hot reloads in development
globalThis.__rateLimitStore = store;

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

export function getRouteGroup(
  pathname: string,
  method?: string
): RouteGroup | null {
  if (pathname.startsWith("/api/auth")) return "auth";
  if (pathname.startsWith("/api/upload")) return "upload";
  if (pathname === "/api/account/delete") return "account-delete";
  if (pathname === "/contact" && method === "POST") return "contact";
  if (pathname.startsWith("/view-project/")) return "view-project";
  return null;
}

function getIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  const host = headers.get("host");
  if (host?.includes("localhost") || host?.includes("127.0.0.1")) {
    return `localhost-${host}`;
  }
  return "unknown";
}

export function getClientIp(request: Request): string {
  return getIpFromHeaders(request.headers);
}

/** For use in Server Actions where only headers() is available. */
export function getClientIpFromHeaders(headers: Headers): string {
  return getIpFromHeaders(headers);
}

/**
 * Mask share token for logging (never log the full token).
 * Returns e.g. "a1b2…x9z0" so logs can identify the path without exposing the secret.
 */
export function maskShareToken(token: string): string {
  if (!token || token.length <= 8) return "***";
  return `${token.slice(0, 4)}…${token.slice(-4)}`;
}

/** Path with token masked for logging (e.g. /view-project/a1b2…x9z0/products). */
export function maskViewProjectPath(pathname: string): string {
  const match = pathname.match(/^\/view-project\/([^/]+)(\/.*)?$/);
  if (!match) return pathname;
  const [, token, rest = ""] = match;
  return `/view-project/${maskShareToken(token)}${rest}`;
}
