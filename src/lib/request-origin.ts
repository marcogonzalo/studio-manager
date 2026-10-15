/**
 * Browser-reachable origin for auth redirects.
 * Next `dev --hostname 0.0.0.0` makes `request.url` / Host use 0.0.0.0;
 * browsers cannot open that address (connection timeout), and cookies set on
 * 0.0.0.0 are not sent to localhost — so PKCE + session look like “no login”.
 */

const NON_PUBLIC_HOSTNAMES = new Set(["0.0.0.0", "[::]", "::", "[::0]", "::0"]);

function firstHeaderValue(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  return first || null;
}

export function isNonPublicHostname(hostname: string): boolean {
  return NON_PUBLIC_HOSTNAMES.has(hostname.toLowerCase());
}

/**
 * Rewrite unbound listen addresses in an absolute URL (emailRedirectTo, etc.).
 * Leaves normal localhost / public hosts unchanged.
 */
export function toPublicAppUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    if (isNonPublicHostname(url.hostname)) {
      url.hostname = "localhost";
      if (!url.port) url.port = "3000";
      url.protocol = "http:";
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

/** Client-side: never use window.location.origin when it is 0.0.0.0 / ::. */
export function getBrowserAppOrigin(): string {
  if (typeof window === "undefined") return "http://localhost:3000";
  return toPublicAppUrl(window.location.origin).replace(/\/$/, "");
}

/**
 * Resolve a public origin from the incoming request.
 * Prefers x-forwarded-* / Host, never returns 0.0.0.0 / ::.
 */
export function getPublicRequestOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = firstHeaderValue(
    request.headers.get("x-forwarded-host")
  );
  const headerHost = firstHeaderValue(request.headers.get("host"));
  const rawHost = forwardedHost || headerHost || url.host;

  const forwardedProto = firstHeaderValue(
    request.headers.get("x-forwarded-proto")
  );
  let protocol = (
    forwardedProto || url.protocol.replace(":", "")
  ).toLowerCase();
  if (protocol !== "http" && protocol !== "https") {
    protocol = "http";
  }

  let hostname = rawHost;
  let port = "";
  if (rawHost.startsWith("[")) {
    const end = rawHost.indexOf("]");
    hostname = end >= 0 ? rawHost.slice(0, end + 1) : rawHost;
    port = end >= 0 && rawHost[end + 1] === ":" ? rawHost.slice(end + 2) : "";
  } else {
    const colon = rawHost.lastIndexOf(":");
    if (colon > 0 && /^\d+$/.test(rawHost.slice(colon + 1))) {
      hostname = rawHost.slice(0, colon);
      port = rawHost.slice(colon + 1);
    }
  }

  if (isNonPublicHostname(hostname)) {
    hostname = "localhost";
    if (!port) port = url.port || "3000";
    protocol = "http";
  }

  return port
    ? `${protocol}://${hostname}:${port}`
    : `${protocol}://${hostname}`;
}
