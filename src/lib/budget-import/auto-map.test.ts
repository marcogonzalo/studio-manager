import { describe, it, expect } from "vitest";
import { autoMapColumns, mappingBlocksNextStep } from "./auto-map";

describe("autoMapColumns", () => {
  it("maps exact and alias headers for products", () => {
    const result = autoMapColumns({
      target: "product",
      headers: ["Nombre *", "Quantity", "Unit cost", "Markup (%)", "Espacio"],
    });
    const byHeader = Object.fromEntries(
      result.mappings.map((m) => [m.sourceHeader, m.fieldKey])
    );
    expect(byHeader["Nombre *"]).toBe("name");
    expect(byHeader.Quantity).toBe("quantity");
    expect(byHeader["Unit cost"]).toBe("unit_cost");
    expect(byHeader["Markup (%)"]).toBe("markup");
    expect(byHeader.Espacio).toBe("space");
    expect(result.unmappedRequired).toEqual([]);
    expect(mappingBlocksNextStep(result)).toBe(false);
  });

  it("blocks when required name is unmapped", () => {
    const result = autoMapColumns({
      target: "product",
      headers: ["Quantity", "Unit cost"],
    });
    expect(result.unmappedRequired).toContain("name");
    expect(mappingBlocksNextStep(result)).toBe(true);
  });
});
