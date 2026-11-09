import { describe, expect, it } from "vitest";
import { resolvePdfBranding } from "./pdf-branding";
import { getPlanConfigForDisplay } from "./plan-copy";

describe("resolvePdfBranding", () => {
  it("uses Veta branding for BASE (basic)", () => {
    const branding = resolvePdfBranding({
      planConfig: getPlanConfigForDisplay("BASE"),
      vetaLogoDataUrl: "data:image/png;base64,veta",
      publicName: "Studio X",
      accountLogoDataUrl: "data:image/png;base64,account",
    });
    expect(branding).toEqual({
      mode: "veta",
      showVetaBranding: true,
      logoUrl: "data:image/png;base64,veta",
      brandName: "Veta",
    });
  });

  it("uses account logo + public name for PRO (plus)", () => {
    const branding = resolvePdfBranding({
      planConfig: getPlanConfigForDisplay("PRO"),
      vetaLogoDataUrl: "data:image/png;base64,veta",
      publicName: "Estudio García",
      accountLogoDataUrl: "data:image/png;base64,logo",
    });
    expect(branding).toEqual({
      mode: "account",
      showVetaBranding: false,
      logoUrl: "data:image/png;base64,logo",
      brandName: "Estudio García",
    });
  });

  it("uses account branding without logo for STUDIO when logo missing", () => {
    const branding = resolvePdfBranding({
      planConfig: getPlanConfigForDisplay("STUDIO"),
      publicName: "  My Studio  ",
    });
    expect(branding.mode).toBe("account");
    expect(branding.showVetaBranding).toBe(false);
    expect(branding.logoUrl).toBeUndefined();
    expect(branding.brandName).toBe("My Studio");
  });

  it("treats PRO and STUDIO the same for branding mode", () => {
    const pro = resolvePdfBranding({
      planConfig: getPlanConfigForDisplay("PRO"),
    });
    const studio = resolvePdfBranding({
      planConfig: getPlanConfigForDisplay("STUDIO"),
    });
    expect(pro.mode).toBe(studio.mode);
    expect(pro.showVetaBranding).toBe(studio.showVetaBranding);
  });
});
