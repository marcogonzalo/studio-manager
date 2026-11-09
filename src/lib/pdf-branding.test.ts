import { describe, expect, it } from "vitest";
import {
  resolveClientFacingPublicProfile,
  resolvePdfBranding,
} from "./pdf-branding";
import { getPlanConfigForDisplay } from "./plan-copy";

describe("resolveClientFacingPublicProfile", () => {
  it("omits stored logo and public_name on BASE even if present in DB", () => {
    const profile = resolveClientFacingPublicProfile({
      planConfig: getPlanConfigForDisplay("BASE"),
      publicName: "Estudio Ghost",
      publicEmail: "brand@studio.test",
      publicLogoUrl: "https://cdn.example/logo.png",
      fallbackEmail: "login@studio.test",
    });
    expect(profile.brandingAllowed).toBe(false);
    expect(profile.publicName).toBeUndefined();
    expect(profile.publicLogoUrl).toBeUndefined();
    expect(profile.publicEmail).toBe("login@studio.test");
  });

  it("exposes logo and public_name on PRO", () => {
    const profile = resolveClientFacingPublicProfile({
      planConfig: getPlanConfigForDisplay("PRO"),
      publicName: "Estudio García",
      publicEmail: "hola@estudio.test",
      publicLogoUrl: "https://cdn.example/logo.png",
      fallbackEmail: "login@estudio.test",
    });
    expect(profile.brandingAllowed).toBe(true);
    expect(profile.publicName).toBe("Estudio García");
    expect(profile.publicLogoUrl).toBe("https://cdn.example/logo.png");
    expect(profile.publicEmail).toBe("hola@estudio.test");
  });
});

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
