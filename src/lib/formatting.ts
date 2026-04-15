import type { Locale } from "@/i18n/config";
import { CURRENCIES } from "@/lib/currencies";

export type AppDateFormatPattern = "YYYY-MM-DD" | "MM/DD/YYYY" | "DD/MM/YYYY";

export function intlLocaleForAppLang(lang: Locale): string {
  return lang === "en" ? "en-US" : "es-ES";
}

export function defaultDateFormatForLocale(lang: Locale): AppDateFormatPattern {
  return lang === "en" ? "MM/DD/YYYY" : "DD/MM/YYYY";
}

export function isAppDateFormatPattern(
  value: unknown
): value is AppDateFormatPattern {
  return (
    value === "YYYY-MM-DD" || value === "MM/DD/YYYY" || value === "DD/MM/YYYY"
  );
}

export function formatDateByPattern(
  date: Date | string | number,
  pattern: AppDateFormatPattern
): string {
  const d =
    typeof date === "object" && "getTime" in date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  switch (pattern) {
    case "YYYY-MM-DD":
      return `${y}-${m}-${day}`;
    case "MM/DD/YYYY":
      return `${m}/${day}/${y}`;
    case "DD/MM/YYYY":
      return `${day}/${m}/${y}`;
  }
}

function hasGranularDateOptions(opts: Intl.DateTimeFormatOptions): boolean {
  return (
    opts.day !== undefined ||
    opts.month !== undefined ||
    opts.year !== undefined ||
    opts.weekday !== undefined ||
    opts.hour !== undefined ||
    opts.minute !== undefined ||
    opts.second !== undefined
  );
}

export function formatDateIntl(
  date: Date | string | number,
  lang: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const d =
    typeof date === "object" && "getTime" in date ? date : new Date(date);
  const locale = intlLocaleForAppLang(lang);
  const opts = options ?? { dateStyle: "short" as const };
  const formatOpts = hasGranularDateOptions(opts)
    ? opts
    : { dateStyle: "short" as const, ...opts };
  return new Intl.DateTimeFormat(locale, formatOpts).format(d);
}

export interface FormatCurrencyOptions {
  maxFractionDigits?: number;
}

export function formatCurrencyWithLang(
  amount: number,
  currencyCode: string | undefined,
  lang: Locale,
  options?: FormatCurrencyOptions
): string {
  const maxFrac = options?.maxFractionDigits ?? 2;
  const minFrac = Math.min(maxFrac, 2);
  const locale = intlLocaleForAppLang(lang);
  const hasValidCurrency =
    currencyCode && currencyCode.trim() && CURRENCIES[currencyCode];
  if (!hasValidCurrency) {
    return `${amount.toLocaleString(locale, {
      minimumFractionDigits: minFrac,
      maximumFractionDigits: maxFrac,
    })} ??`;
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac,
  }).format(amount);
}

export function formatNumberWithLang(
  amount: number,
  lang: Locale,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(intlLocaleForAppLang(lang), options).format(
    amount
  );
}

export function getCurrencySymbolWithLang(
  currencyCode: string | undefined,
  lang: Locale
): string {
  const hasValidCurrency =
    currencyCode && currencyCode.trim() && CURRENCIES[currencyCode];
  if (!hasValidCurrency) return "??";
  return (
    new Intl.NumberFormat(intlLocaleForAppLang(lang), {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? "??"
  );
}
