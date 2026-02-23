import { describe, expect, it } from "vitest";
import {
  COMPACT_FEATURE_KEYS,
  getCommercialFeatures,
  getPlanConfigForDisplay,
  STATIC_PLAN_CONFIGS,
} from "./plan-copy";

describe("plan-copy", () => {
  describe("getCommercialFeatures", () => {
    it("returns consumibles and modality copy for BASE", () => {
      const config = getPlanConfigForDisplay("BASE");
      const features = getCommercialFeatures(config);
      expect(features).toContain("1 proyecto activo");
      expect(features).toContain("10 clientes");
      expect(features).toContain("50 proveedores");
      expect(features).toContain("50 productos en catálogo");
      expect(features).toContain("500 MB de almacenamiento");
      expect(features).toContain("Exportación de presupuesto en PDF");
      expect(features).not.toContain("Pedidos de compra");
      expect(features).not.toContain("Soporte por email");
    });

    it("returns correct copy for PRO including plus modalities", () => {
      const config = getPlanConfigForDisplay("PRO");
      const features = getCommercialFeatures(config);
      expect(features).toContain("5 proyectos activos");
      expect(features).toContain("Clientes ilimitados");
      expect(features).toContain("10 GB de almacenamiento");
      expect(features).toContain("Presupuesto personalizado");
      expect(features).toContain("Pedidos de compra");
      expect(features).toContain("Soporte por email");
    });

    it("returns correct copy for STUDIO including full modalities", () => {
      const config = getPlanConfigForDisplay("STUDIO");
      const features = getCommercialFeatures(config);
      expect(features).toContain("50 proyectos activos");
      expect(features).toContain("100 GB de almacenamiento");
      expect(features).toContain(
        "Presupuesto personalizable con marca propia (white label)"
      );
      expect(features).toContain("Moneda e impuesto por proyecto");
      expect(features).toContain("Soporte prioritario");
    });

    it("omits projects consumible when projects_limit is 0", () => {
      const features = getCommercialFeatures({
        ...STATIC_PLAN_CONFIGS.BASE,
        projects_limit: 0,
      });
      expect(features).not.toContain("1 proyecto activo");
    });

    it("uses effective_storage_limit_mb when present", () => {
      const features = getCommercialFeatures({
        ...STATIC_PLAN_CONFIGS.PRO,
        effective_storage_limit_mb: 20480,
      });
      expect(features).toContain("20 GB de almacenamiento");
    });
  });

  describe("getPlanConfigForDisplay", () => {
    it("returns config for each plan code", () => {
      expect(getPlanConfigForDisplay("BASE").budget_mode).toBe("basic");
      expect(getPlanConfigForDisplay("PRO").budget_mode).toBe("plus");
      expect(getPlanConfigForDisplay("STUDIO").budget_mode).toBe("full");
    });

    it("with include returns only selected keys in standard order", () => {
      const config = getPlanConfigForDisplay("PRO");
      const full = getCommercialFeatures(config);
      const compact = getCommercialFeatures(config, {
        include: COMPACT_FEATURE_KEYS,
      });
      expect(compact.length).toBeLessThan(full.length);
      expect(compact).toContain("5 proyectos activos");
      expect(compact).toContain("10 GB de almacenamiento");
      expect(compact).toContain("Presupuesto personalizado");
      expect(compact).toContain("Soporte por email");
      expect(compact).not.toContain("Clientes ilimitados");
      expect(compact).not.toContain("Proveedores ilimitados");
    });
  });
});
