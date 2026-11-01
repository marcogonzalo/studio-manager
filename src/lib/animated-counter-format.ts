import { formatCurrency } from "@/lib/utils";

export function formatAnimatedCounterValue(
  value: number,
  options: {
    decimals?: number;
    currencyCode?: string;
    locale?: string;
  } = {}
): string {
  const { decimals = 0, currencyCode, locale = "es-ES" } = options;
  if (currencyCode) {
    return formatCurrency(value, currencyCode, {
      maxFractionDigits: decimals,
    });
  }
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
