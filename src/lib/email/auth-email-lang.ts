import type { Locale } from "@/i18n/config";
import {
  isAppLocale,
  resolveLocaleFromAcceptLanguage,
} from "@/lib/resolve-locale-from-accept-language";

/**
 * Resolves en | es for transactional / auth-related emails.
 * Prefer an explicit value from the client; otherwise Accept-Language.
 */
export function resolveEmailLocale(
  explicit: unknown,
  acceptLanguage: string | null | undefined
): Locale {
  if (isAppLocale(explicit)) return explicit;
  return resolveLocaleFromAcceptLanguage(acceptLanguage);
}
