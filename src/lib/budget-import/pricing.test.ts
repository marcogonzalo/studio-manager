import { describe, it, expect } from "vitest";
import { normalizeMoneyString, resolveProductPricing } from "./pricing";
import { buildAddItemFormSchema } from "@/lib/add-item-form-schema";

const t = (key: string) => key;
const schema = buildAddItemFormSchema(t as never);

describe("normalizeMoneyString", () => {
  it("parses european and us formats", () => {
    expect(normalizeMoneyString("1.234,56")).toBe("1234.56");
    expect(normalizeMoneyString("1,234.56")).toBe("1234.56");
    expect(normalizeMoneyString("12,5")).toBe("12.5");
    expect(normalizeMoneyString("12.5")).toBe("12.5");
  });

  it("rejects scientific notation and junk", () => {
    expect(normalizeMoneyString("1e3")).toBeNull();
    expect(normalizeMoneyString("abc")).toBeNull();
  });
});

describe("resolveProductPricing", () => {
  it("computes price from cost + markup", () => {
    const result = resolveProductPricing({
      unitCost: "100",
      markup: "20",
      unitPrice: "",
      isPriceTbd: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.unitCost).toBe(100);
      expect(result.markup).toBe(20);
      expect(result.unitPrice).toBe(120);
    }
  });

  it("computes markup from cost + price", () => {
    const result = resolveProductPricing({
      unitCost: "100",
      markup: "",
      unitPrice: "120",
      isPriceTbd: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.markup).toBe(20);
      expect(result.unitPrice).toBe(120);
    }
  });

  it("recomputes markup when all three filled and warns on mismatch", () => {
    const result = resolveProductPricing({
      unitCost: "100",
      markup: "10",
      unitPrice: "120",
      isPriceTbd: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.markup).toBe(20);
      expect(result.warning).toBe("markup_recomputed");
      expect(result.givenMarkup).toBe(10);
    }
  });

  it("errors when only cost is provided", () => {
    const result = resolveProductPricing({
      unitCost: "100",
      markup: "",
      unitPrice: "",
      isPriceTbd: false,
    });
    expect(result).toEqual({ ok: false, error: "incomplete_pair" });
  });

  it("errors when price without cost", () => {
    const result = resolveProductPricing({
      unitCost: "",
      markup: "",
      unitPrice: "120",
      isPriceTbd: false,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("missing_cost");
  });

  it("ignores pricing when price TBD", () => {
    const result = resolveProductPricing({
      unitCost: "100",
      markup: "20",
      unitPrice: "120",
      isPriceTbd: true,
    });
    expect(result).toEqual({
      ok: true,
      unitCost: 0,
      markup: 0,
      unitPrice: 0,
    });
  });

  it("derived values pass the add-item zod schema", () => {
    const result = resolveProductPricing({
      unitCost: "100",
      markup: "20",
      unitPrice: "",
      isPriceTbd: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const parsed = schema.safeParse({
      name: "Chair",
      quantity: "1",
      unit_cost: String(result.unitCost),
      markup: String(result.markup),
      unit_price: result.unitPrice.toFixed(2),
    });
    expect(parsed.success).toBe(true);
  });
});
