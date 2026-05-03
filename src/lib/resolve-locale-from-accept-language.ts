import type { Locale } from "@/i18n/config";
import { defaultLocale, locales } from "@/i18n/config";

/**
 * Picks the first supported app locale (en | es) from an Accept-Language header.
 * Falls back to defaultLocale when nothing matches.
 */
export function resolveLocaleFromAcceptLanguage(
  header: string | null | undefined
): Locale {
  if (!header?.trim()) return defaultLocale;

  const parts = header
    .split(",")
    .map((part, index) => {
      const trimmed = part.trim();
      const [tagPart, ...paramParts] = trimmed.split(";");
      const tag = tagPart?.toLowerCase();
      const qParam = paramParts.find((p) => p.trim().startsWith("q="));
      const qValue = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      const quality =
        Number.isFinite(qValue) && qValue >= 0 && qValue <= 1 ? qValue : 0;
      return { tag, quality, index };
    })
    .sort((a, b) => {
      // Higher q first; keep header order for same q.
      if (b.quality !== a.quality) return b.quality - a.quality;
      return a.index - b.index;
    });

  for (const part of parts) {
    const tag = part.tag;
    if (!tag) continue;
    const primary = tag.split("-")[0];
    if (primary === "en") return "en";
    if (primary === "es") return "es";
  }

  return defaultLocale;
}

export function isAppLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (locales as readonly string[]).includes(value)
  );
}
