import { describe, it, expect } from "vitest";
import { normalizeHeader } from "./normalize-header";

describe("normalizeHeader", () => {
  it("lowercases and strips accents", () => {
    expect(normalizeHeader("Categoría")).toBe("categoria");
    expect(normalizeHeader("Descripción")).toBe("descripcion");
  });

  it("drops required markers and punctuation", () => {
    expect(normalizeHeader("Nombre *")).toBe("nombre");
    expect(normalizeHeader("IVA (%)")).toBe("iva");
    expect(normalizeHeader("Margen (%)")).toBe("margen");
  });

  it("collapses whitespace", () => {
    expect(normalizeHeader("  Unit   Cost  ")).toBe("unit cost");
  });
});
