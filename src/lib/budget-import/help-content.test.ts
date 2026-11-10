import { describe, it, expect } from "vitest";
import {
  buildBudgetImportHelpModel,
  helpModelContainsPlanName,
} from "./help-content";
import { PRODUCT_IMPORT_FIELDS, BUDGET_LINE_IMPORT_FIELDS } from "./fields";

describe("buildBudgetImportHelpModel", () => {
  const model = buildBudgetImportHelpModel({
    locale: "en",
    translateLabel: (k) => k,
    translateCategory: (k) => k,
    translateSubcategory: (_c, k) => k,
    translatePhase: (k) => k,
  });

  it("includes every product and budget-line field", () => {
    const productIds = new Set(model.products.map((p) => p.id));
    for (const field of PRODUCT_IMPORT_FIELDS) {
      expect(productIds.has(field.key)).toBe(true);
    }
    const lineIds = new Set(model.budgetLines.map((p) => p.id));
    for (const field of BUDGET_LINE_IMPORT_FIELDS) {
      expect(lineIds.has(field.key)).toBe(true);
    }
  });

  it("lists categories and phases", () => {
    expect(model.categories.length).toBeGreaterThan(0);
    expect(model.phases.length).toBe(6);
  });

  it("never contains plan names", () => {
    expect(helpModelContainsPlanName(model)).toBe(false);
  });

  it("adds contextual tax note when project applies multitax", () => {
    const applies = buildBudgetImportHelpModel({
      locale: "en",
      translateLabel: (k) => k,
      translateCategory: (k) => k,
      translateSubcategory: (_c, k) => k,
      translatePhase: (k) => k,
      taxAppliesToProject: true,
    });
    const doesNot = buildBudgetImportHelpModel({
      locale: "en",
      translateLabel: (k) => k,
      translateCategory: (k) => k,
      translateSubcategory: (_c, k) => k,
      translatePhase: (k) => k,
      taxAppliesToProject: false,
    });
    expect(applies.tax.join(" ")).toMatch(/will be applied/i);
    expect(doesNot.tax.join(" ")).toMatch(/will be ignored/i);
  });
});
