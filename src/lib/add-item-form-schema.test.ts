import { describe, it, expect } from "vitest";
import {
  buildAddItemFormSchema,
  shouldBlockNumericKey,
  type AddItemFormMessageKey,
} from "./add-item-form-schema";

const t = (key: AddItemFormMessageKey) => key;
const schema = buildAddItemFormSchema(t);

function parse(overrides: Record<string, unknown> = {}) {
  return schema.safeParse({
    name: "Chair",
    quantity: "1",
    unit_cost: "10.5",
    markup: "20",
    unit_price: "12.6",
    ...overrides,
  });
}

describe("buildAddItemFormSchema quantity", () => {
  it("accepts positive integers", () => {
    expect(parse({ quantity: "1" }).success).toBe(true);
    expect(parse({ quantity: "12" }).success).toBe(true);
    const result = parse({ quantity: "3" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.quantity).toBe(3);
  });

  it("rejects zero, negatives, decimals, and empty", () => {
    expect(parse({ quantity: "0" }).success).toBe(false);
    expect(parse({ quantity: "-1" }).success).toBe(false);
    expect(parse({ quantity: "0.01" }).success).toBe(false);
    expect(parse({ quantity: "1.5" }).success).toBe(false);
    expect(parse({ quantity: "" }).success).toBe(false);
    expect(parse({ quantity: "abc" }).success).toBe(false);
  });
});

describe("buildAddItemFormSchema unit_cost and unit_price", () => {
  it("accepts positive floats", () => {
    const result = parse({ unit_cost: "0.01", unit_price: "19.99" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.unit_cost).toBe(0.01);
      expect(result.data.unit_price).toBe(19.99);
    }
  });

  it("accepts whole numbers as floats", () => {
    expect(parse({ unit_cost: "10", unit_price: "12" }).success).toBe(true);
  });

  it("rejects zero, negatives, and empty for unit_cost", () => {
    expect(parse({ unit_cost: "0" }).success).toBe(false);
    expect(parse({ unit_cost: "-0.01" }).success).toBe(false);
    expect(parse({ unit_cost: "" }).success).toBe(false);
    expect(parse({ unit_cost: "abc" }).success).toBe(false);
  });

  it("rejects zero, negatives, and empty for unit_price", () => {
    expect(parse({ unit_price: "0" }).success).toBe(false);
    expect(parse({ unit_price: "-1" }).success).toBe(false);
    expect(parse({ unit_price: "" }).success).toBe(false);
  });
});

describe("buildAddItemFormSchema internal_notes", () => {
  it("accepts optional internal notes", () => {
    const result = parse({ internal_notes: "Ask supplier for fabric sample" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.internal_notes).toBe("Ask supplier for fabric sample");
    }
  });

  it("accepts missing or empty internal notes", () => {
    expect(parse().success).toBe(true);
    expect(parse({ internal_notes: "" }).success).toBe(true);
  });
});

describe("shouldBlockNumericKey", () => {
  it("blocks scientific notation and signs for both modes", () => {
    expect(shouldBlockNumericKey("e", "positive-integer")).toBe(true);
    expect(shouldBlockNumericKey("-", "positive-float")).toBe(true);
    expect(shouldBlockNumericKey("+", "positive-float")).toBe(true);
  });

  it("blocks decimal separators only for integers", () => {
    expect(shouldBlockNumericKey(".", "positive-integer")).toBe(true);
    expect(shouldBlockNumericKey(",", "positive-integer")).toBe(true);
    expect(shouldBlockNumericKey(".", "positive-float")).toBe(false);
    expect(shouldBlockNumericKey("1", "positive-float")).toBe(false);
  });
});
