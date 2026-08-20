import { describe, expect, it } from "vitest";
import {
  buildBudgetLineFormSchema,
  type BudgetLineFormMessageKey,
} from "./budget-line-form-schema";

const t = (key: BudgetLineFormMessageKey) => key;
const schema = buildBudgetLineFormSchema(t);

function parse(overrides: Record<string, unknown> = {}) {
  return schema.safeParse({
    category: "construction",
    subcategory: "masonry",
    estimated_amount: "120.5",
    actual_amount: "80",
    is_internal_cost: false,
    ...overrides,
  });
}

describe("buildBudgetLineFormSchema", () => {
  it("requires category and subcategory", () => {
    expect(parse({ category: "" }).success).toBe(false);
    expect(parse({ subcategory: "" }).success).toBe(false);
  });

  it("parses amounts when TBD is off", () => {
    const result = parse({ is_price_tbd: false });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estimated_amount).toBe(120.5);
      expect(result.data.actual_amount).toBe(80);
      expect(result.data.is_price_tbd).toBe(false);
    }
  });

  it("parses comma decimals and treats blank or invalid as zero", () => {
    const comma = parse({
      estimated_amount: "10,25",
      actual_amount: "  ",
    });
    expect(comma.success).toBe(true);
    if (comma.success) {
      expect(comma.data.estimated_amount).toBe(10.25);
      expect(comma.data.actual_amount).toBe(0);
    }

    const invalid = parse({
      estimated_amount: "abc",
      actual_amount: undefined,
    });
    expect(invalid.success).toBe(true);
    if (invalid.success) {
      expect(invalid.data.estimated_amount).toBe(0);
      expect(invalid.data.actual_amount).toBe(0);
    }
  });
});

describe("buildBudgetLineFormSchema is_price_tbd", () => {
  it("allows empty or zero amounts when price is TBD", () => {
    const empty = parse({
      is_price_tbd: true,
      estimated_amount: "",
      actual_amount: "",
    });
    expect(empty.success).toBe(true);
    if (empty.success) {
      expect(empty.data.is_price_tbd).toBe(true);
      expect(empty.data.estimated_amount).toBe(0);
      expect(empty.data.actual_amount).toBe(0);
    }

    const zero = parse({
      is_price_tbd: true,
      estimated_amount: "0",
      actual_amount: "0",
    });
    expect(zero.success).toBe(true);
    if (zero.success) {
      expect(zero.data.estimated_amount).toBe(0);
      expect(zero.data.actual_amount).toBe(0);
    }
  });

  it("stores zero even if amounts were filled while TBD is on", () => {
    const result = parse({
      is_price_tbd: true,
      estimated_amount: "999",
      actual_amount: "50",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estimated_amount).toBe(0);
      expect(result.data.actual_amount).toBe(0);
    }
  });
});

describe("buildBudgetLineFormSchema tax_rate", () => {
  it("parses optional non-negative tax rate", () => {
    const result = parse({ tax_rate: "21" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tax_rate).toBe(21);
  });

  it("allows empty tax rate", () => {
    const result = parse({ tax_rate: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tax_rate).toBeUndefined();
  });

  it("rejects negative tax rate", () => {
    expect(parse({ tax_rate: "-0.5" }).success).toBe(false);
  });
});
