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
  it("maps all category keys through translator and sorts by label", () => {
    const opts = getLocalizedCategoryOptions((key) => EN_CATEGORIES[key], "en");

    expect(opts).toHaveLength(4);
    expect(opts.map((o) => o.label)).toEqual([
      "Construction",
      "External Services",
      "Operating Expenses",
      "Own Fees",
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

  it("sorts Spanish category labels alphabetically", () => {
    const opts = getLocalizedCategoryOptions(
      (key) => es.BudgetCategory[key],
      "es"
    );

    expect(opts.map((o) => o.label)).toEqual([
      "Gastos Operativos",
      "Honorarios Propios",
      "Obra",
      "Servicios Externos",
    ]);
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

  it("sorts subcategory labels alphabetically for the locale", () => {
    const opts = getLocalizedSubcategoryOptions(
      "operations",
      (key) => {
        const [, subcategory] = key.split(".");
        return es.BudgetSubcategory.operations[
          subcategory as keyof typeof es.BudgetSubcategory.operations
        ];
      },
      "es"
    );

    expect(opts.map((o) => o.label)).toEqual([
      "Aduanas",
      "Almacenamiento",
      "Embalaje",
      "Ensamblaje",
      "Envío",
      "Manipulación",
      "Otros",
      "Seguros",
      "Transporte",
    ]);
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
