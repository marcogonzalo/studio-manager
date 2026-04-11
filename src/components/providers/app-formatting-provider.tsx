"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Locale } from "@/i18n/config";
import {
  type AppDateFormatPattern,
  formatCurrencyWithLang,
  formatDateByPattern,
  formatDateIntl,
  formatNumberWithLang,
  getCurrencySymbolWithLang,
} from "@/lib/formatting";
import type { FormatCurrencyOptions } from "@/lib/utils";

type AppFormattingContextValue = {
  lang: Locale;
  dateFormat: AppDateFormatPattern;
  formatDate: (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ) => string;
  formatCurrency: (
    amount: number,
    currencyCode?: string,
    options?: FormatCurrencyOptions
  ) => string;
  formatNumber: (amount: number, options?: Intl.NumberFormatOptions) => string;
  getCurrencySymbol: (currencyCode?: string) => string;
};

const AppFormattingContext = createContext<AppFormattingContextValue | null>(
  null
);

export function AppFormattingProvider({
  lang,
  dateFormat,
  children,
}: {
  lang: Locale;
  dateFormat: AppDateFormatPattern;
  children: ReactNode;
}) {
  const formatDate = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      const opts = options ?? {};
      const hasGranular =
        opts.day !== undefined ||
        opts.month !== undefined ||
        opts.year !== undefined ||
        opts.weekday !== undefined ||
        opts.hour !== undefined ||
        opts.minute !== undefined ||
        opts.second !== undefined;
      if (!hasGranular && Object.keys(opts).length === 0) {
        return formatDateByPattern(date, dateFormat);
      }
      return formatDateIntl(date, lang, options);
    },
    [dateFormat, lang]
  );

  const formatCurrency = useCallback(
    (amount: number, currencyCode?: string, options?: FormatCurrencyOptions) =>
      formatCurrencyWithLang(amount, currencyCode, lang, options),
    [lang]
  );

  const formatNumber = useCallback(
    (amount: number, options?: Intl.NumberFormatOptions) =>
      formatNumberWithLang(amount, lang, options),
    [lang]
  );

  const getCurrencySymbol = useCallback(
    (currencyCode?: string) => getCurrencySymbolWithLang(currencyCode, lang),
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      dateFormat,
      formatDate,
      formatCurrency,
      formatNumber,
      getCurrencySymbol,
    }),
    [
      lang,
      dateFormat,
      formatDate,
      formatCurrency,
      formatNumber,
      getCurrencySymbol,
    ]
  );

  return (
    <AppFormattingContext.Provider value={value}>
      {children}
    </AppFormattingContext.Provider>
  );
}

export function useAppFormatting(): AppFormattingContextValue {
  const ctx = useContext(AppFormattingContext);
  if (!ctx) {
    throw new Error(
      "useAppFormatting must be used within AppFormattingProvider"
    );
  }
  return ctx;
}
