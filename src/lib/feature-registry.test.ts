import { describe, expect, it } from "vitest";
import {
  COMPARISON_PAGE_IDS,
  FEATURE_PAGE_IDS,
  FEATURE_PAGES,
  getFeaturePublicPath,
  getFeatureSitemapPaths,
  isFeaturePageId,
} from "@/lib/feature-registry";

describe("feature-registry", () => {
  it("registers expected page ids", () => {
    expect(FEATURE_PAGE_IDS).toEqual(
      expect.arrayContaining([
        "funcionalidades",
        "presupuestos",
        "plantilla-pdf",
        "control-costes",
        "pedidos",
        "empiezas-por-tu-cuenta",
        "app-freelance",
        "estudios-con-equipo",
        "alternativas-excel",
      ])
    );
  });

  it("builds as-needed public paths", () => {
    expect(getFeaturePublicPath("es", "funcionalidades")).toBe(
      "/funcionalidades"
    );
    expect(getFeaturePublicPath("en", "funcionalidades")).toBe("/en/features");
    expect(getFeaturePublicPath("es", "control-costes")).toBe(
      "/control-costes-rentabilidad-interiorismo"
    );
    expect(getFeaturePublicPath("en", "control-costes")).toBe(
      "/en/cost-control-profitability-interior-design"
    );
  });

  it("assigns plan CTAs per product rules", () => {
    expect(FEATURE_PAGES["control-costes"].planCtas).toEqual(["pro"]);
    expect(FEATURE_PAGES.pedidos.planCtas).toEqual(["pro"]);
    expect(FEATURE_PAGES["plantilla-pdf"].planCtas).toEqual(["studio"]);
    expect(FEATURE_PAGES["empiezas-por-tu-cuenta"].planCtas).toEqual(["base"]);
    expect(FEATURE_PAGES["app-freelance"].planCtas).toEqual(["pro"]);
    expect(FEATURE_PAGES["estudios-con-equipo"].planCtas).toEqual(["studio"]);
  });

  it("nests plantilla under presupuestos", () => {
    expect(FEATURE_PAGES["plantilla-pdf"].parentId).toBe("presupuestos");
    expect(FEATURE_PAGES.presupuestos.childIds).toContain("plantilla-pdf");
  });

  it("lists comparison pages under Excel hub", () => {
    expect(COMPARISON_PAGE_IDS).toEqual([
      "veta-vs-programa",
      "veta-vs-monday-notion",
      "veta-vs-houzz-pro",
    ]);
    expect(FEATURE_PAGES["alternativas-excel"].childIds).toEqual(
      expect.arrayContaining([...COMPARISON_PAGE_IDS])
    );
  });

  it("isFeaturePageId guards unknown ids", () => {
    expect(isFeaturePageId("control-costes")).toBe(true);
    expect(isFeaturePageId("nope")).toBe(false);
  });

  it("sitemap includes ES and EN for every page", () => {
    const paths = getFeatureSitemapPaths().map((p) => p.path);
    expect(paths).toContain("/funcionalidades");
    expect(paths).toContain("/en/features");
    expect(paths).toContain("/alternativas-excel-presupuestos-interiorismo");
    expect(paths).toContain("/en/excel-alternatives-interior-design-budgets");
  });
});
