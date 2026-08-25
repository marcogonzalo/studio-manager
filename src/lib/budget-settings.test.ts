import { describe, expect, it } from "vitest";
import {
  DEFAULT_BUDGET_SETTINGS,
  isAllSpacesVisible,
  mergeBudgetSettings,
  normalizeBudgetSettings,
  parseBudgetSettings,
  shouldShowProductField,
} from "./budget-settings";

describe("parseBudgetSettings", () => {
  it("returns empty object for null/undefined/empty", () => {
    expect(parseBudgetSettings(null)).toEqual({});
    expect(parseBudgetSettings(undefined)).toEqual({});
    expect(parseBudgetSettings({})).toEqual({});
  });

  it("parses valid settings", () => {
    expect(
      parseBudgetSettings({
        phase_filter: "design",
        sort_field: "supplier",
        sort_direction: "desc",
        product_fields: { model: true, supplier: false, sku: true },
        visible_space_ids: ["space-1"],
      })
    ).toEqual({
      phase_filter: "design",
      sort_field: "supplier",
      sort_direction: "desc",
      product_fields: { model: true, supplier: false, sku: true },
      visible_space_ids: ["space-1"],
    });
  });

  it("rejects invalid keys", () => {
    expect(parseBudgetSettings({ unknown: true })).toEqual({});
  });
});

describe("normalizeBudgetSettings", () => {
  it("applies defaults", () => {
    expect(normalizeBudgetSettings(null)).toEqual(DEFAULT_BUDGET_SETTINGS);
  });

  it("merges partial settings", () => {
    expect(
      normalizeBudgetSettings({
        sort_direction: "desc",
        product_fields: { model: true, supplier: false, sku: false },
      })
    ).toEqual({
      ...DEFAULT_BUDGET_SETTINGS,
      sort_direction: "desc",
      product_fields: { model: true, supplier: false, sku: false },
    });
  });
});

describe("mergeBudgetSettings", () => {
  it("merges product_fields without dropping other keys", () => {
    const merged = mergeBudgetSettings(
      { sort_field: "alphabetical" },
      { product_fields: { model: true, supplier: true, sku: false } }
    );
    expect(merged.sort_field).toBe("alphabetical");
    expect(merged.product_fields).toEqual({
      model: true,
      supplier: true,
      sku: false,
    });
  });
});

describe("isAllSpacesVisible", () => {
  it("treats null/undefined as all spaces", () => {
    expect(isAllSpacesVisible(null)).toBe(true);
    expect(isAllSpacesVisible(undefined)).toBe(true);
  });

  it("treats explicit array as filtered", () => {
    expect(isAllSpacesVisible([])).toBe(false);
    expect(isAllSpacesVisible(["a"])).toBe(false);
  });
});

describe("shouldShowProductField", () => {
  it("defaults to hidden", () => {
    expect(shouldShowProductField(null, "model")).toBe(false);
    expect(shouldShowProductField(null, "supplier")).toBe(false);
    expect(shouldShowProductField(null, "sku")).toBe(false);
  });

  it("respects explicit visibility", () => {
    expect(
      shouldShowProductField(
        { product_fields: { model: true, supplier: false, sku: true } },
        "sku"
      )
    ).toBe(true);
  });
});
