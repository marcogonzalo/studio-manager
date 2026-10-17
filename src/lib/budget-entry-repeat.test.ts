import { describe, expect, it } from "vitest";
import {
  ADD_ITEM_REPEAT_KEEP_KEYS,
  BUDGET_LINE_REPEAT_KEEP_KEYS,
  buildRepeatDefaults,
  resolveNextCreateOrigin,
  resolveSubmitOrigin,
} from "./budget-entry-repeat";

describe("buildRepeatDefaults", () => {
  it("keeps space, supplier, category for add-item and clears the rest", () => {
    const previous = {
      space_id: "space-1",
      supplier_id: "sup-1",
      category: "furniture",
      name: "Chair",
      quantity: "2",
      unit_cost: "100",
      unit_price: "120",
      description: "oak",
    };
    const empty = {
      space_id: "none",
      supplier_id: "none",
      category: "",
      name: "",
      quantity: "1",
      unit_cost: "",
      unit_price: "",
      description: "",
    };

    const next = buildRepeatDefaults(
      previous,
      empty,
      ADD_ITEM_REPEAT_KEEP_KEYS
    );

    expect(next.space_id).toBe("space-1");
    expect(next.supplier_id).toBe("sup-1");
    expect(next.category).toBe("furniture");
    expect(next.name).toBe("");
    expect(next.quantity).toBe("1");
    expect(next.unit_cost).toBe("");
    expect(next.unit_price).toBe("");
    expect(next.description).toBe("");
  });

  it("keeps category, subcategory, phase, supplier for budget lines", () => {
    const previous = {
      category: "materials",
      subcategory: "flooring",
      phase: "construction",
      supplier_id: "sup-2",
      description: "Oak plank",
      estimated_amount: "500",
      notes: "urgent",
    };
    const empty = {
      category: "",
      subcategory: "",
      phase: undefined as string | undefined,
      supplier_id: undefined as string | undefined,
      description: "",
      estimated_amount: "0",
      notes: "",
    };

    const next = buildRepeatDefaults(
      previous,
      empty,
      BUDGET_LINE_REPEAT_KEEP_KEYS
    );

    expect(next.category).toBe("materials");
    expect(next.subcategory).toBe("flooring");
    expect(next.phase).toBe("construction");
    expect(next.supplier_id).toBe("sup-2");
    expect(next.description).toBe("");
    expect(next.estimated_amount).toBe("0");
    expect(next.notes).toBe("");
  });
});

describe("resolveSubmitOrigin / resolveNextCreateOrigin", () => {
  it("tags add-another submit as repeat", () => {
    expect(resolveSubmitOrigin("form", true)).toBe("repeat");
    expect(resolveSubmitOrigin("space_add", true)).toBe("repeat");
    expect(resolveSubmitOrigin("duplicate", true)).toBe("repeat");
  });

  it("keeps current origin when not add-another", () => {
    expect(resolveSubmitOrigin("space_add", false)).toBe("space_add");
    expect(resolveSubmitOrigin("duplicate", false)).toBe("duplicate");
    expect(resolveSubmitOrigin(undefined, false)).toBe("form");
  });

  it("next create after add-another stays repeat", () => {
    expect(resolveNextCreateOrigin("form", true)).toBe("repeat");
    expect(resolveNextCreateOrigin("repeat", false)).toBe("repeat");
  });
});
