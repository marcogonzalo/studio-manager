import { describe, expect, it } from "vitest";
import {
  formatCurrencyWithLang,
  formatNumberWithLang,
  getCurrencySymbolWithLang,
} from "./formatting";

/** Intl may insert NBSP / narrow NBSP around currency symbols. */
function normalizeIntl(value: string): string {
  return value.replace(/[\u00a0\u202f]/g, " ");
}

describe("formatCurrencyWithLang", () => {
  it("formats USD in English as US locale ($1,234.56)", () => {
    expect(normalizeIntl(formatCurrencyWithLang(1234.5, "USD", "en"))).toBe(
      "$1,234.50"
    );
  });

  it("formats USD in Spanish as ES locale (1.234,50 US$)", () => {
    expect(normalizeIntl(formatCurrencyWithLang(1234.5, "USD", "es"))).toBe(
      "1234,50 US$"
    );
  });

  it("formats EUR in English with en-US separators", () => {
    expect(normalizeIntl(formatCurrencyWithLang(120, "EUR", "en"))).toBe(
      "€120.00"
    );
  });

  it("formats EUR in Spanish with es-ES separators", () => {
    expect(normalizeIntl(formatCurrencyWithLang(120, "EUR", "es"))).toBe(
      "120,00 €"
    );
  });

  it("appends ?? when currency code is missing or unknown", () => {
    expect(formatCurrencyWithLang(10, undefined, "en")).toContain("??");
    expect(formatCurrencyWithLang(10, "XXX", "es")).toContain("??");
  });
});

describe("formatNumberWithLang", () => {
  it("uses dot thousands and comma decimals for es", () => {
    expect(normalizeIntl(formatNumberWithLang(1234.5, "es"))).toBe("1234,5");
  });

  it("uses comma thousands and dot decimals for en", () => {
    expect(normalizeIntl(formatNumberWithLang(1234.5, "en"))).toBe("1,234.5");
  });
});

describe("getCurrencySymbolWithLang", () => {
  it("returns $ for USD in English", () => {
    expect(getCurrencySymbolWithLang("USD", "en")).toBe("$");
  });

  it("returns US$ for USD in Spanish", () => {
    expect(getCurrencySymbolWithLang("USD", "es")).toBe("US$");
  });
});
