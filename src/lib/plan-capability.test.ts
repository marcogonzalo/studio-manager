import { describe, expect, it } from "vitest";
import {
  checkCapability,
  hasModalityAtLeast,
  isCapabilityAvailable,
} from "./plan-capability";
import { getPlanConfigForDisplay } from "./plan-copy";

describe("plan-capability", () => {
  describe("isCapabilityAvailable", () => {
    it("returns false when config is null", () => {
      expect(isCapabilityAvailable(null, "budget_mode")).toBe(false);
      expect(isCapabilityAvailable(undefined, "purchase_orders")).toBe(false);
    });

    it("returns true for modality when not none", () => {
      const base = getPlanConfigForDisplay("BASE");
      expect(isCapabilityAvailable(base, "budget_mode")).toBe(true);
      expect(isCapabilityAvailable(base, "purchase_orders")).toBe(false);
    });

    it("returns true for consumable when limit > 0 or -1", () => {
      const base = getPlanConfigForDisplay("BASE");
      expect(isCapabilityAvailable(base, "projects_limit")).toBe(true);
      expect(isCapabilityAvailable(base, "storage_limit_mb")).toBe(true);
    });
  });

  describe("hasModalityAtLeast", () => {
    it("returns true when modality is at least minLevel", () => {
      const pro = getPlanConfigForDisplay("PRO");
      expect(hasModalityAtLeast(pro, "budget_mode", "basic")).toBe(true);
      expect(hasModalityAtLeast(pro, "budget_mode", "plus")).toBe(true);
      expect(hasModalityAtLeast(pro, "budget_mode", "full")).toBe(false);
    });

    it("returns false when modality is below minLevel", () => {
      const base = getPlanConfigForDisplay("BASE");
      expect(hasModalityAtLeast(base, "budget_mode", "plus")).toBe(false);
      expect(hasModalityAtLeast(base, "support_level", "basic")).toBe(false);
    });

    it("for STUDIO full modalities returns true for full", () => {
      const studio = getPlanConfigForDisplay("STUDIO");
      expect(hasModalityAtLeast(studio, "budget_mode", "full")).toBe(true);
      expect(hasModalityAtLeast(studio, "support_level", "full")).toBe(true);
    });
  });

  describe("checkCapability", () => {
    it("without minModality same as isCapabilityAvailable", () => {
      const base = getPlanConfigForDisplay("BASE");
      expect(checkCapability(base, "purchase_orders")).toBe(false);
      expect(checkCapability(base, "budget_mode")).toBe(true);
    });

    it("with minModality uses hasModalityAtLeast", () => {
      const base = getPlanConfigForDisplay("BASE");
      expect(
        checkCapability(base, "budget_mode", { minModality: "full" })
      ).toBe(false);
      const studio = getPlanConfigForDisplay("STUDIO");
      expect(
        checkCapability(studio, "budget_mode", { minModality: "full" })
      ).toBe(true);
    });
  });
});
