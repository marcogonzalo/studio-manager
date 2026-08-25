import { describe, expect, it } from "vitest";
import { getProductPublicMeta } from "./budget-product-public-meta";

describe("getProductPublicMeta", () => {
  const item = {
    reference_code: "REF-1",
    internal_reference: "INT-9",
    supplier_name: "Acme",
  };

  it("hides all fields by default", () => {
    expect(getProductPublicMeta(item, null)).toEqual({
      model: "",
      sku: "",
      supplier: "",
    });
  });

  it("shows only enabled fields", () => {
    expect(
      getProductPublicMeta(item, {
        product_fields: { model: true, supplier: false, sku: true },
      })
    ).toEqual({
      model: "REF-1",
      sku: "INT-9",
      supplier: "",
    });
  });
});
