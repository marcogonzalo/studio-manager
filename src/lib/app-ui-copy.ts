import type { Locale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";
import {
  isAppLocale,
  resolveLocaleFromAcceptLanguage,
} from "@/lib/resolve-locale-from-accept-language";
import en from "@/i18n/messages/en/app-common.json";
import es from "@/i18n/messages/es/app-common.json";

type CommonMessages = typeof es;

const MESSAGES: Record<Locale, CommonMessages> = { en, es };

export function getAppUiCopy(lang: Locale = defaultLocale) {
  const messages = MESSAGES[lang] ?? MESSAGES.es;
  return {
    errors: messages.AppErrors,
    validation: messages.AppValidation,
  };
}

export function interpolateAppCopy(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] === undefined ? `{${key}}` : String(vars[key])
  );
}

export function localeFromCookieHeader(
  cookieHeader: string | null | undefined
): Locale | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)NEXT_LOCALE=(en|es)\b/);
  return isAppLocale(match?.[1]) ? match[1] : null;
}

/** Request locale: NEXT_LOCALE cookie, then Accept-Language. */
export function localeFromRequest(request: Request): Locale {
  const fromCookie = localeFromCookieHeader(request.headers.get("cookie"));
  if (fromCookie) return fromCookie;
  return resolveLocaleFromAcceptLanguage(
    request.headers.get("accept-language")
  );
}

/** Client crash pages: account cookie, then browser language. */
export function localeFromDocument(): Locale {
  if (typeof document === "undefined") return defaultLocale;
  const fromCookie = localeFromCookieHeader(document.cookie);
  if (fromCookie) return fromCookie;
  const nav = navigator.language?.toLowerCase() ?? "";
  return nav.startsWith("en") ? "en" : defaultLocale;
}
