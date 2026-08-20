import { describe, expect, it } from "vitest";
import { catalogProductCurrencyFromProject } from "./catalog-product-currency";

describe("catalogProductCurrencyFromProject", () => {
  it("uses the project currency when set", () => {
    expect(catalogProductCurrencyFromProject("USD")).toBe("USD");
  });

  it("falls back to EUR when project currency is missing", () => {
    expect(catalogProductCurrencyFromProject(undefined)).toBe("EUR");
    expect(catalogProductCurrencyFromProject(null)).toBe("EUR");
    expect(catalogProductCurrencyFromProject("")).toBe("EUR");
    expect(catalogProductCurrencyFromProject("   ")).toBe("EUR");
  });

  it("supports a custom fallback", () => {
    expect(catalogProductCurrencyFromProject(undefined, "GBP")).toBe("GBP");
  });
});
