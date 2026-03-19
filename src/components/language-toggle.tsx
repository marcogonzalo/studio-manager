"use client";

import { useLocale } from "next-intl";
import { Globe2 } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";

export function LanguageToggle() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const newLocale: Locale = locale === "en" ? "es" : "en";

    // next-intl "as-needed" should omit the default-locale prefix, but when
    // switching from /en/... it can sometimes generate redundant URLs like
    // "/es/precios". We build the destination URL explicitly from routing
    // pathnames and the "as-needed" prefix strategy.
    const currentFullPath =
      typeof window !== "undefined" ? window.location.pathname : "";

    const normalizePath = (p: string): string => {
      // Remove trailing slashes except for root "/"
      if (!p) return "/";
      if (p === "/") return "/";
      return p.replace(/\/+$/, "");
    };

    // Base path without any locale prefix (e.g. "/pricing" instead of "/en/pricing")
    // Used both for routeKey matching and as fallback navigation.
    let pathWithoutLocalePrefix = currentFullPath || pathname;
    {
      const currentLocalePrefix = `/${locale}`;
      if (pathWithoutLocalePrefix === currentLocalePrefix) {
        pathWithoutLocalePrefix = "/";
      } else if (
        pathWithoutLocalePrefix.startsWith(`${currentLocalePrefix}/`)
      ) {
        pathWithoutLocalePrefix = pathWithoutLocalePrefix.slice(
          currentLocalePrefix.length
        );
      }

      pathWithoutLocalePrefix = normalizePath(pathWithoutLocalePrefix);
    }

    if (currentFullPath) {
      type ReplaceHref = Parameters<typeof router.replace>[0];

      // Current locale might or might not have a prefix in the URL:
      // - ES default: "/precios" (no "/es")
      // - EN: "/en/pricing"

      type Locales = "en" | "es";
      const pathnames = routing.pathnames as unknown as Record<
        string,
        Partial<Record<Locales, string>>
      >;

      const routeKey = Object.keys(pathnames).find((key) => {
        const localizedPath = pathnames[key]?.[locale];
        if (!localizedPath) return false;
        return normalizePath(localizedPath) === pathWithoutLocalePrefix;
      });

      if (routeKey) {
        const destinationPathname = pathnames[routeKey]?.[newLocale];

        if (typeof destinationPathname === "string") {
          const normalizedDestination = normalizePath(destinationPathname);
          const isDefaultLocale = newLocale === routing.defaultLocale;
          const destinationFullPath = isDefaultLocale
            ? normalizedDestination
            : normalizedDestination === "/"
              ? `/${newLocale}`
              : `/${newLocale}${normalizedDestination}`;

          type ReplaceHref = Parameters<typeof router.replace>[0];
          router.replace(destinationFullPath as ReplaceHref);
          return;
        }
      }
    }

    // Fallback: use the path without locale prefix, so next-intl can apply
    // the correct "/en" prefix only when needed (defaultLocale stays unprefixed).
    type ReplaceHref = Parameters<typeof router.replace>[0];
    router.replace(pathWithoutLocalePrefix as ReplaceHref, {
      locale: newLocale,
    });
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
