import { describe, it, expect } from "vitest";
import {
  buildNameMap,
  parseBooleanCell,
  resolveBudgetLineRow,
  resolveProductRow,
} from "./resolve-row";
import type { ColumnMapping } from "./auto-map";

const productMappings: ColumnMapping[] = [
  { sourceHeader: "Name", fieldKey: "name", confidence: "exact" },
  { sourceHeader: "Qty", fieldKey: "quantity", confidence: "alias" },
  { sourceHeader: "Cost", fieldKey: "unit_cost", confidence: "alias" },
  { sourceHeader: "Markup", fieldKey: "markup", confidence: "exact" },
  { sourceHeader: "Space", fieldKey: "space", confidence: "exact" },
  { sourceHeader: "Supplier", fieldKey: "supplier", confidence: "exact" },
];

describe("parseBooleanCell", () => {
  it("accepts yes/no variants", () => {
    expect(parseBooleanCell("Sí")).toBe(true);
    expect(parseBooleanCell("yes")).toBe(true);
    expect(parseBooleanCell("0")).toBe(false);
    expect(parseBooleanCell("")).toBeNull();
  });
});

describe("resolveProductRow", () => {
  it("creates lookups for unknown space/supplier and leaves empty space as General", () => {
    const lookup = {
      spacesByName: buildNameMap([{ id: "s1", name: "Kitchen" }]),
      suppliersByName: buildNameMap([]),
    };
    const withSpace = resolveProductRow({
      source: {
        Name: "Chair",
        Qty: "2",
        Cost: "100",
        Markup: "20",
        Space: "Living",
        Supplier: "Acme",
      },
      mappings: productMappings,
      lookup,
    });
    expect(withSpace.space).toEqual({ status: "create", name: "Living" });
    expect(withSpace.supplier).toEqual({ status: "create", name: "Acme" });
    expect(withSpace.unit_price).toBe("120.00");

    const emptySpace = resolveProductRow({
      source: {
        Name: "Chair",
        Qty: "1",
        Cost: "50",
        Markup: "10",
        Space: "",
        Supplier: "",
      },
      mappings: productMappings,
      lookup,
    });
    expect(emptySpace.space.status).toBe("empty");
  });
});

describe("resolveBudgetLineRow", () => {
  it("flags needsCategory and falls back subcategory to other", () => {
    const row = resolveBudgetLineRow({
      source: {
        Category: "",
        Subcategory: "Masonry",
        Description: "Walls",
      },
      mappings: [
        { sourceHeader: "Category", fieldKey: "category", confidence: "exact" },
        {
          sourceHeader: "Subcategory",
          fieldKey: "subcategory",
          confidence: "exact",
        },
        {
          sourceHeader: "Description",
          fieldKey: "description",
          confidence: "exact",
        },
      ],
      lookup: { spacesByName: new Map(), suppliersByName: new Map() },
      translateCategory: (k) => k,
      translateSubcategory: (_c, k) => k,
      translatePhase: (k) => k,
    });
    expect(row.needsCategory).toBe(true);
    expect(row.errors).toContain("needs_category");
  });

  it("matches category labels and subcategory", () => {
    const row = resolveBudgetLineRow({
      source: {
        Category: "Construction",
        Subcategory: "Masonry",
        Description: "Walls",
      },
      mappings: [
        { sourceHeader: "Category", fieldKey: "category", confidence: "exact" },
        {
          sourceHeader: "Subcategory",
          fieldKey: "subcategory",
          confidence: "exact",
        },
        {
          sourceHeader: "Description",
          fieldKey: "description",
          confidence: "exact",
        },
      ],
      lookup: { spacesByName: new Map(), suppliersByName: new Map() },
      translateCategory: (k) => (k === "construction" ? "Construction" : k),
      translateSubcategory: (_c, k) => (k === "masonry" ? "Masonry" : k),
      translatePhase: (k) => k,
    });
    expect(row.category).toBe("construction");
    expect(row.subcategory).toBe("masonry");
    expect(row.needsCategory).toBe(false);
  });
});
