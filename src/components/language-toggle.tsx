"use client";

import { useLocale } from "next-intl";
import { Globe2 } from "lucide-react";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";

type Locales = "en" | "es";
type PathnamesMap = Record<string, Partial<Record<Locales, string>>>;

function normalizePath(p: string): string {
  if (!p) return "/";
  if (p === "/") return "/";
  return p.replace(/\/+$/, "");
}

function getPathWithoutLocalePrefix(
  currentFullPath: string,
  currentLocale: Locales
): string {
  const currentPrefix = `/${currentLocale}`;
  let pathWithoutPrefix = currentFullPath;
  if (pathWithoutPrefix === currentPrefix) {
    pathWithoutPrefix = "/";
  } else if (pathWithoutPrefix.startsWith(`${currentPrefix}/`)) {
    pathWithoutPrefix = pathWithoutPrefix.slice(currentPrefix.length);
  }
  return normalizePath(pathWithoutPrefix);
}

function isBlogPath(pathWithoutPrefix: string): boolean {
  return (
    pathWithoutPrefix === "/blog" || pathWithoutPrefix.startsWith("/blog/")
  );
}

function fallbackBlogDestination(
  newLocale: Locales,
  defaultLocale: string
): string {
  return newLocale === defaultLocale ? "/blog" : "/en/blog";
}

/**
 * Builds the canonical destination URL for a locale switch.
 *
 * Strategy (localePrefix: "as-needed"):
 *  - ES (default): no prefix → "/precios", "/"
 *  - EN: "/en" prefix → "/en/pricing", "/en"
 *
 * We resolve the destination by:
 * 1. Stripping the current locale prefix from window.location.pathname.
 * 2. Finding the route key whose current-locale slug matches that path.
 * 3. Looking up the new-locale slug for that route key.
 * 4. Prepending "/en" only when the new locale is not the default.
 */
function buildDestinationUrl(
  currentFullPath: string,
  currentLocale: Locales,
  newLocale: Locales,
  defaultLocale: string
): string {
  const pathnames = routing.pathnames as unknown as PathnamesMap;
  const pathWithoutPrefix = getPathWithoutLocalePrefix(
    currentFullPath,
    currentLocale
  );

  // Find the route key whose current-locale slug matches the stripped path.
  const routeKey = Object.keys(pathnames).find((key) => {
    const slug = pathnames[key]?.[currentLocale];
    return slug !== undefined && normalizePath(slug) === pathWithoutPrefix;
  });

  // Resolve the destination slug for the new locale.
  const destinationSlug =
    routeKey !== undefined
      ? normalizePath(pathnames[routeKey]?.[newLocale] ?? "/")
      : pathWithoutPrefix;

  // Apply "as-needed" prefix: default locale has no prefix.
  if (newLocale === defaultLocale) {
    return destinationSlug;
  }
  return destinationSlug === "/"
    ? `/${newLocale}`
    : `/${newLocale}${destinationSlug}`;
}

async function resolveDestinationUrl(
  currentFullPath: string,
  currentLocale: Locales,
  newLocale: Locales,
  defaultLocale: string
): Promise<string> {
  const pathWithoutPrefix = getPathWithoutLocalePrefix(
    currentFullPath,
    currentLocale
  );

  if (isBlogPath(pathWithoutPrefix)) {
    try {
      const params = new URLSearchParams({
        from: currentLocale,
        to: newLocale,
        path: pathWithoutPrefix,
      });
      const res = await fetch(`/api/blog/locale-target?${params}`, {
        method: "GET",
        credentials: "same-origin",
      });
      if (res.ok) {
        const data: unknown = await res.json();
        if (
          typeof data === "object" &&
          data !== null &&
          "path" in data &&
          typeof (data as { path: unknown }).path === "string"
        ) {
          const p = (data as { path: string }).path;
          if (p.startsWith("/") && !p.includes("//")) {
            return p;
          }
        }
      }
    } catch {
      // use fallback below
    }
    return fallbackBlogDestination(newLocale, defaultLocale);
  }

  return buildDestinationUrl(
    currentFullPath,
    currentLocale,
    newLocale,
    defaultLocale
  );
}

export function LanguageToggle() {
  const locale = useLocale() as Locale;

  const toggleLocale = () => {
    void (async () => {
      const newLocale: Locale = locale === "en" ? "es" : "en";
      const currentFullPath =
        typeof window !== "undefined" ? window.location.pathname : "/";

      const destination = await resolveDestinationUrl(
        currentFullPath,
        locale,
        newLocale,
        routing.defaultLocale
      );

      // Navigate using the browser directly to avoid next-intl re-applying
      // locale prefix logic on top of the already-resolved canonical URL.
      window.location.href = destination;
    })();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      aria-label={`Switch to ${locale === "en" ? "Español" : "English"}`}
      className="gap-1.5 text-sm font-medium"
    >
      <Globe2 className="h-4 w-4" />
      {locale === "en" ? "ES" : "EN"}
    </Button>
  );
}
