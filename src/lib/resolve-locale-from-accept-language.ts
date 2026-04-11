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
    .map((p) => p.trim().split(";")[0]?.toLowerCase());
  for (const tag of parts) {
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
