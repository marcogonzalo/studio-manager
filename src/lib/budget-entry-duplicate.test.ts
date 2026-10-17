import { describe, expect, it } from "vitest";
import {
  budgetLineToDuplicateValues,
  projectItemToDuplicateValues,
} from "./budget-entry-duplicate";
import type { ProjectBudgetLine, ProjectItem } from "@/types";

describe("projectItemToDuplicateValues", () => {
  it("drops identity and PO linkage; keeps commercial fields", () => {
    const item = {
      id: "item-1",
      name: "Chair",
      description: "Oak",
      space_id: "space-1",
      product_id: "prod-1",
      quantity: 2,
      unit_cost: 100,
      markup: 20,
      unit_price: 120,
      status: "ordered",
      image_url: "https://cdn.example/chair.jpg",
      supplier_id: "sup-1",
      purchase_order_id: "po-1",
      is_excluded: true,
      is_price_tbd: false,
      tax_rate: 21,
    } as ProjectItem;

    const values = projectItemToDuplicateValues(item, {
      description: "from product",
      reference_code: "SKU-1",
      reference_url: "https://ref",
      category: "furniture",
    });

    expect(values).not.toHaveProperty("id");
    expect(values).not.toHaveProperty("purchase_order_id");
    expect(values).not.toHaveProperty("status");
    expect(values.name).toBe("Chair");
    expect(values.space_id).toBe("space-1");
    expect(values.supplier_id).toBe("sup-1");
    expect(values.category).toBe("furniture");
    expect(values.reference_code).toBe("SKU-1");
    expect(values.image_url).toBe("https://cdn.example/chair.jpg");
    expect(values.is_excluded).toBe(false);
    expect(values.quantity).toBe("2");
  });
});

describe("budgetLineToDuplicateValues", () => {
  it("prefills without id", () => {
    const line = {
      id: "line-1",
      project_id: "p1",
      category: "construction",
      subcategory: "masonry",
      description: "Wall",
      estimated_amount: 500,
      actual_amount: 400,
      is_internal_cost: false,
      is_price_tbd: false,
      phase: "construction",
      supplier_id: "sup-2",
      notes: "note",
      user_id: "u1",
      created_at: "2026-01-01",
    } as ProjectBudgetLine;

    const values = budgetLineToDuplicateValues(line);
    expect(values).not.toHaveProperty("id");
    expect(values.category).toBe("construction");
    expect(values.subcategory).toBe("masonry");
    expect(values.estimated_amount).toBe("500");
    expect(values.phase).toBe("construction");
    expect(values.supplier_id).toBe("sup-2");
  });
});
