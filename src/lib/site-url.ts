/** Apex HTTPS origin used for canonical URLs, sitemap, robots, and JSON-LD. */
export const CANONICAL_SITE_ORIGIN = "https://veta.pro";

function normalizeSiteOrigin(raw: string): string {
  const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  parsed.protocol = "https:";
  parsed.hostname = parsed.hostname.replace(/^www\./i, "");
  parsed.pathname = "";
  parsed.search = "";
  parsed.hash = "";
  return parsed.origin;
}

/**
 * Public site origin for SEO metadata (metadataBase, canonical, sitemap).
 * Always normalizes to apex HTTPS without www.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    return normalizeSiteOrigin(fromEnv);
  }

  if (process.env.VERCEL_ENV === "production") {
    return CANONICAL_SITE_ORIGIN;
  }

  if (process.env.VERCEL_URL) {
    return normalizeSiteOrigin(`https://${process.env.VERCEL_URL}`);
  }

  return CANONICAL_SITE_ORIGIN;
}

/** True when the request host is a non-canonical www variant of veta.pro. */
export function isWwwVetaHost(host: string | null | undefined): boolean {
  if (!host) return false;
  return host.replace(/:\d+$/, "").toLowerCase() === "www.veta.pro";
}
