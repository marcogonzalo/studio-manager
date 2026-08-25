import { describe, expect, it } from "vitest";
import {
  DEFAULT_BUDGET_SETTINGS,
  isAllSpacesVisible,
  mergeBudgetSettings,
  normalizeBudgetSettings,
  parseBudgetSettings,
  getSelectedSpaceIds,
  resolveBudgetSettingsForPresentation,
  shouldShowProductField,
  isSensitiveProductDataVisible,
  productFieldsFromSensitiveToggle,
  toStoredVisibleSpaceIds,
} from "./budget-settings";
import { getPlanConfigForDisplay } from "./plan-copy";

describe("resolveBudgetSettingsForPresentation", () => {
  it("returns null for BASE plan", () => {
    expect(
      resolveBudgetSettingsForPresentation(
        { phase_filter: "design" },
        getPlanConfigForDisplay("BASE")
      )
    ).toBeNull();
  });

  it("returns settings for PRO plan", () => {
    const settings = { phase_filter: "design" as const };
    expect(
      resolveBudgetSettingsForPresentation(
        settings,
        getPlanConfigForDisplay("PRO")
      )
    ).toEqual(settings);
  });
});

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

  it("respects explicit visibility for sensitive fields", () => {
    expect(
      shouldShowProductField(
        { product_fields: { model: true, supplier: false, sku: true } },
        "sku"
      )
    ).toBe(false);
    expect(
      shouldShowProductField(
        { product_fields: { model: true, supplier: false, sku: true } },
        "model"
      )
    ).toBe(true);
  });
});

describe("sensitive product data toggle", () => {
  it("is on only when model and supplier are both enabled", () => {
    expect(isSensitiveProductDataVisible(null)).toBe(false);
    expect(
      isSensitiveProductDataVisible({
        product_fields: { model: true, supplier: true, sku: false },
      })
    ).toBe(true);
    expect(
      isSensitiveProductDataVisible({
        product_fields: { model: true, supplier: false, sku: false },
      })
    ).toBe(false);
  });

  it("maps toggle to model and supplier, never sku", () => {
    expect(productFieldsFromSensitiveToggle(true)).toEqual({
      model: true,
      supplier: true,
      sku: false,
    });
    expect(productFieldsFromSensitiveToggle(false)).toEqual({
      model: false,
      supplier: false,
      sku: false,
    });
  });
});

describe("space selection helpers", () => {
  const allIds = ["space-a", "__unassigned_space__"];

  it("returns all ids when stored value is null", () => {
    expect(getSelectedSpaceIds(null, allIds)).toEqual(allIds);
  });

  it("stores null when every space is selected", () => {
    expect(toStoredVisibleSpaceIds(allIds, allIds)).toBeNull();
  });

  it("stores explicit ids for partial selection", () => {
    expect(toStoredVisibleSpaceIds(["space-a"], allIds)).toEqual(["space-a"]);
  });
});
