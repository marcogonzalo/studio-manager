import { describe, expect, it } from "vitest";
import {
  BUDGET_CATEGORY_DISPLAY_ORDER,
  BUDGET_PHASE_DISPLAY_ORDER,
  UNASSIGNED_SPACE_KEY,
  compareBudgetLines,
  groupBudgetLinesByPhaseThenCategory,
  groupItemsBySpaceThenCreatedAt,
  orderedBudgetCategoryKeys,
  orderedBudgetPhaseKeys,
  sortBudgetLines,
  sortProjectItemsBySpaceThenCreatedAt,
  sortSpacesByCreatedAt,
  uniqueSpaceKeysByCreatedAt,
} from "./project-list-order";

describe("project-list-order", () => {
  it("defines canonical phase then category order", () => {
    expect([...BUDGET_PHASE_DISPLAY_ORDER]).toEqual([
      "diagnosis",
      "design",
      "executive",
      "budget",
      "construction",
      "delivery",
      "no_phase",
    ]);
    expect([...BUDGET_CATEGORY_DISPLAY_ORDER]).toEqual([
      "own_fees",
      "external_services",
      "construction",
      "operations",
    ]);
  });

  it("sorts budget lines by phase, category, created_at, then id", () => {
    const lines = [
      {
        id: "z",
        phase: "design",
        category: "construction",
        created_at: "2026-01-02T00:00:00Z",
      },
      {
        id: "a",
        phase: "design",
        category: "construction",
        created_at: "2026-01-02T00:00:00Z",
      },
      {
        id: "b",
        phase: "diagnosis",
        category: "operations",
        created_at: "2026-01-03T00:00:00Z",
      },
      {
        id: "c",
        phase: "diagnosis",
        category: "own_fees",
        created_at: "2026-01-04T00:00:00Z",
      },
      {
        id: "d",
        phase: null,
        category: "own_fees",
        created_at: "2026-01-01T00:00:00Z",
      },
    ];

    expect(sortBudgetLines(lines).map((line) => line.id)).toEqual([
      "c",
      "b",
      "a",
      "z",
      "d",
    ]);
  });

  it("places unknown phase and category after known ones", () => {
    const cmp = compareBudgetLines(
      { phase: "mystery", category: "zzz", created_at: "2026-01-01T00:00:00Z" },
      {
        phase: "delivery",
        category: "operations",
        created_at: "2026-01-02T00:00:00Z",
      }
    );
    expect(cmp).toBeGreaterThan(0);
  });

  it("lists unknown phases after canonical ones", () => {
    const grouped = groupBudgetLinesByPhaseThenCategory([
      {
        id: "x",
        phase: "mystery",
        category: "own_fees",
        created_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "y",
        phase: "design",
        category: "own_fees",
        created_at: "2026-01-01T00:00:00Z",
      },
    ]);
    expect(Object.keys(grouped)).toEqual(["design", "mystery"]);
  });

  it("groups budget lines by phase then category in display order", () => {
    const grouped = groupBudgetLinesByPhaseThenCategory([
      {
        id: "1",
        phase: "construction",
        category: "operations",
        created_at: "2026-01-02T00:00:00Z",
      },
      {
        id: "2",
        phase: "construction",
        category: "own_fees",
        created_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "3",
        phase: "design",
        category: "construction",
        created_at: "2026-01-01T00:00:00Z",
      },
    ]);

    expect(Object.keys(grouped)).toEqual(["design", "construction"]);
    expect(Object.keys(grouped.construction)).toEqual([
      "own_fees",
      "operations",
    ]);
    expect(grouped.construction.own_fees.map((line) => line.id)).toEqual(["2"]);
  });

  it("orders grouped phase and category keys with extras last", () => {
    expect(
      orderedBudgetPhaseKeys({
        mystery: {},
        design: {},
      })
    ).toEqual(["design", "mystery"]);
    expect(
      orderedBudgetCategoryKeys({
        custom: {},
        construction: {},
        own_fees: {},
      })
    ).toEqual(["own_fees", "construction", "custom"]);
  });

  it("returns empty grouping for empty budget lines", () => {
    expect(groupBudgetLinesByPhaseThenCategory([])).toEqual({});
  });

  it("sorts spaces by created_at then id", () => {
    const spaces = sortSpacesByCreatedAt([
      { id: "b", name: "Bath", created_at: "2026-01-02T00:00:00Z" },
      { id: "a", name: "Kitchen", created_at: "2026-01-01T00:00:00Z" },
      { id: "c", name: "Later", created_at: "2026-01-01T00:00:00Z" },
    ]);
    expect(spaces.map((space) => space.id)).toEqual(["a", "c", "b"]);
  });

  it("puts items without a space last, then by space created_at then item created_at", () => {
    const items = sortProjectItemsBySpaceThenCreatedAt([
      {
        id: "p3",
        created_at: "2026-01-01T00:00:00Z",
        space: { name: "Kitchen", created_at: "2026-02-01T00:00:00Z" },
        space_id: "k",
      },
      {
        id: "p1",
        created_at: "2026-01-03T00:00:00Z",
        space: { name: "Bath", created_at: "2026-01-01T00:00:00Z" },
        space_id: "b",
      },
      {
        id: "p2",
        created_at: "2026-01-02T00:00:00Z",
        space: { name: "Bath", created_at: "2026-01-01T00:00:00Z" },
        space_id: "b",
      },
      {
        id: "p1b",
        created_at: "2026-01-02T00:00:00Z",
        space: { name: "Bath", created_at: "2026-01-01T00:00:00Z" },
        space_id: "b",
      },
      {
        id: "loose",
        created_at: "2026-01-01T00:00:00Z",
        space_id: null,
      },
    ]);

    expect(items.map((item) => item.id)).toEqual([
      "p1b",
      "p2",
      "p1",
      "p3",
      "loose",
    ]);
  });

  it("groups items by space using created_at, unassigned last", () => {
    const groups = groupItemsBySpaceThenCreatedAt(
      [
        {
          id: "sofa",
          created_at: "2026-01-02T00:00:00Z",
          space_name: "Living",
          space_created_at: "2026-03-01T00:00:00Z",
        },
        {
          id: "tap",
          created_at: "2026-01-01T00:00:00Z",
          space_name: "Bath",
          space_created_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "mirror",
          created_at: "2026-01-02T00:00:00Z",
          space_name: "Bath",
          space_created_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "general",
          created_at: "2026-01-01T00:00:00Z",
          space_name: "",
        },
      ],
      "General"
    );

    expect(groups.map((group) => group.spaceName)).toEqual([
      "Bath",
      "Living",
      "General",
    ]);
    expect(groups[0]?.items.map((item) => item.id)).toEqual(["tap", "mirror"]);
  });

  it("merges space keys from products and renders by space created_at", () => {
    const keys = uniqueSpaceKeysByCreatedAt([
      { key: "Living", createdAt: "2026-03-01T00:00:00Z" },
      { key: UNASSIGNED_SPACE_KEY, createdAt: null },
      { key: "Bath", createdAt: "2026-01-01T00:00:00Z" },
      { key: "Living", createdAt: "2026-03-01T00:00:00Z" },
    ]);

    expect(keys).toEqual(["Bath", "Living", UNASSIGNED_SPACE_KEY]);
  });

  it("tie-breaks space keys with the same created_at by name", () => {
    expect(
      uniqueSpaceKeysByCreatedAt([
        { key: "Zeta", createdAt: "2026-01-01T00:00:00Z" },
        { key: "Alpha", createdAt: "2026-01-01T00:00:00Z" },
      ])
    ).toEqual(["Alpha", "Zeta"]);
  });

  it("treats missing created_at as last", () => {
    const lines = sortBudgetLines([
      {
        id: "later",
        phase: "design",
        category: "own_fees",
      },
      {
        id: "first",
        phase: "design",
        category: "own_fees",
        created_at: "2026-01-01T00:00:00Z",
      },
    ]);
    expect(lines.map((line) => line.id)).toEqual(["first", "later"]);
  });
});
