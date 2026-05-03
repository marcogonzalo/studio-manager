import { cache } from "react";
import { headers } from "next/headers";
import { resolveLocaleFromAcceptLanguage } from "@/lib/resolve-locale-from-accept-language";

/** Locale for /view-project from Accept-Language (deduped per request). */
export const getViewProjectLocale = cache(async () => {
  const h = await headers();
  return resolveLocaleFromAcceptLanguage(h.get("accept-language"));
});
