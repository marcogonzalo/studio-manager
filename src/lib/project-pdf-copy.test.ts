import { describe, expect, it } from "vitest";
import en from "@/i18n/messages/en/app-common.json";
import es from "@/i18n/messages/es/app-common.json";
import {
  getPdfCategoryLabel,
  getPdfPhaseLabel,
  getPdfSubcategoryLabel,
  getProjectPdfCopy,
  interpolatePdfCopy,
} from "./project-pdf-copy";

describe("interpolatePdfCopy", () => {
  it("replaces placeholders", () => {
    expect(interpolatePdfCopy("Budget for {name}", { name: "Loft" })).toBe(
      "Budget for Loft"
    );
    expect(interpolatePdfCopy("IVA ({rate}%):", { rate: 21 })).toBe(
      "IVA (21%):"
    );
  });

  it("keeps unknown placeholders", () => {
    expect(interpolatePdfCopy("Hello {missing}", {})).toBe("Hello {missing}");
  });
});

describe("getProjectPdfCopy", () => {
  it("returns English strings for en", () => {
    const copy = getProjectPdfCopy("en");
    expect(copy.title).toBe("Budget for {name}");
    expect(copy.client).toBe("Client");
    expect(copy.architect).toBe("Architect");
    expect(copy.tax).toBe("Tax ({rate}%):");
    expect(copy.priceTbd).toBe("To be defined");
    expect(copy.priceTbdNote).toContain("Partial total");
  });

  it("returns Spanish strings for es", () => {
    const copy = getProjectPdfCopy("es");
    expect(copy.title).toBe("Presupuesto de {name}");
    expect(copy.client).toBe("Cliente");
    expect(copy.architect).toBe("Arquitecto/a");
    expect(copy.tax).toBe("IVA ({rate}%):");
  });

  it("falls back to Spanish copy for unknown locales", () => {
    expect(getProjectPdfCopy("fr" as never).client).toBe("Cliente");
    expect(getPdfCategoryLabel("construction", "fr" as never)).toBe("Obra");
  });
});

describe("PDF domain labels", () => {
  it("translates categories", () => {
    expect(getPdfCategoryLabel("construction", "en")).toBe("Construction");
    expect(getPdfCategoryLabel("construction", "es")).toBe("Obra");
    expect(getPdfCategoryLabel("own_fees", "en")).toBe("Own Fees");
  });

  it("translates subcategories", () => {
    expect(getPdfSubcategoryLabel("construction", "demolition", "en")).toBe(
      "Demolition"
    );
    expect(getPdfSubcategoryLabel("construction", "demolition", "es")).toBe(
      "Demolición"
    );
  });

  it("returns raw subcategory when unknown", () => {
    expect(getPdfSubcategoryLabel("construction", "unknown", "en")).toBe(
      "unknown"
    );
  });

  it("translates phases and no-phase fallback", () => {
    expect(getPdfPhaseLabel("diagnosis", "en")).toBe("Diagnosis");
    expect(getPdfPhaseLabel("diagnosis", "es")).toBe("Diagnóstico");
    expect(getPdfPhaseLabel("no_phase", "en")).toBe("No phase");
    expect(getPdfPhaseLabel("no_phase", "es")).toBe("Sin Fase");
    expect(getPdfPhaseLabel("unknown" as never, "en")).toBe("unknown");
  });
});

describe("ProjectPDF i18n", () => {
  it("keeps the same keys in ES and EN", () => {
    expect(Object.keys(en.ProjectPDF)).toEqual(Object.keys(es.ProjectPDF));
  });
});
