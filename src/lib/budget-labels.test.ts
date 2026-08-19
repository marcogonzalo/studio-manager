import { describe, expect, it } from "vitest";
import {
  getLocalizedCategoryOptions,
  getLocalizedSubcategoryOptions,
} from "./budget-labels";
import type { BudgetCategory } from "@/types";
import en from "@/i18n/messages/en/app-common.json";
import es from "@/i18n/messages/es/app-common.json";

const EN_CATEGORIES: Record<BudgetCategory, string> = {
  construction: "Construction",
  own_fees: "Own Fees",
  external_services: "External Services",
  operations: "Operating Expenses",
};

describe("getLocalizedCategoryOptions", () => {
  it("maps all category keys through translator", () => {
    const opts = getLocalizedCategoryOptions((key) => EN_CATEGORIES[key]);

    expect(opts).toHaveLength(4);
    expect(opts.map((o) => o.value)).toEqual([
      "construction",
      "own_fees",
      "external_services",
      "operations",
    ]);
    expect(opts.find((o) => o.value === "construction")).toEqual({
      value: "construction",
      label: "Construction",
    });
    expect(opts.find((o) => o.value === "own_fees")).toEqual({
      value: "own_fees",
      label: "Own Fees",
    });
  });
});

describe("getLocalizedSubcategoryOptions", () => {
  it("returns empty array when category is empty", () => {
    expect(getLocalizedSubcategoryOptions("", (key) => key)).toEqual([]);
  });

  it("returns empty array for unknown category", () => {
    expect(
      getLocalizedSubcategoryOptions("unknown" as BudgetCategory, (key) => key)
    ).toEqual([]);
  });

  it("maps subcategory keys through translator for known category", () => {
    const opts = getLocalizedSubcategoryOptions("construction", (key) =>
      key === "construction.demolition" ? "Demolition" : key
    );

    expect(opts.length).toBeGreaterThan(0);
    expect(opts.find((o) => o.value === "demolition")).toEqual({
      value: "demolition",
      label: "Demolition",
    });
    expect(opts.every((o) => o.value && o.label)).toBe(true);
  });
});

describe("BudgetCategory / BudgetSubcategory i18n", () => {
  it("keeps the same keys in ES and EN", () => {
    expect(Object.keys(en.BudgetCategory)).toEqual(
      Object.keys(es.BudgetCategory)
    );
    expect(Object.keys(en.BudgetSubcategory)).toEqual(
      Object.keys(es.BudgetSubcategory)
    );
    for (const category of Object.keys(
      en.BudgetSubcategory
    ) as BudgetCategory[]) {
      expect(Object.keys(en.BudgetSubcategory[category])).toEqual(
        Object.keys(es.BudgetSubcategory[category])
      );
    }
  });

  it("uses English labels from app-common messages", () => {
    const opts = getLocalizedCategoryOptions((key) => en.BudgetCategory[key]);
    expect(opts.find((o) => o.value === "construction")?.label).toBe(
      "Construction"
    );
    expect(opts.find((o) => o.value === "own_fees")?.label).toBe("Own Fees");

    const subOpts = getLocalizedSubcategoryOptions("construction", (key) =>
      key === "construction.demolition"
        ? en.BudgetSubcategory.construction.demolition
        : key
    );
    expect(subOpts.find((o) => o.value === "demolition")?.label).toBe(
      "Demolition"
    );
  });
});
