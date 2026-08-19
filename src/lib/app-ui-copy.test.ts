import { describe, expect, it, vi } from "vitest";
import {
  getAppUiCopy,
  interpolateAppCopy,
  localeFromCookieHeader,
  localeFromDocument,
  localeFromRequest,
} from "./app-ui-copy";

describe("getAppUiCopy", () => {
  it("returns English demo and validation copy", () => {
    const copy = getAppUiCopy("en");
    expect(copy.errors.demoTitle).toBe("Demo account");
    expect(copy.errors.unknown).toBe("Unknown error");
    expect(copy.validation.emailInvalid).toBe("Enter a valid email address");
    expect(copy.validation.emailRequired).toBe("Email is required");
    expect(copy.errors.authMissingCode).toContain("access code");
    expect(copy.validation.imageType).toContain("JPG");
    expect(copy.validation.fileTooLarge5mb).toContain("5MB");
  });

  it("returns Spanish copy by default", () => {
    const copy = getAppUiCopy();
    expect(copy.errors.demoTitle).toBe("Cuenta de demostración");
    expect(copy.errors.unknown).toBe("Error desconocido");
    expect(copy.validation.emailInvalid).toBe(
      "Introduce un correo electrónico válido"
    );
  });

  it("falls back to Spanish for unknown locales", () => {
    const copy = getAppUiCopy("fr" as never);
    expect(copy.errors.unknown).toBe("Error desconocido");
  });
});

describe("interpolateAppCopy", () => {
  it("replaces placeholders", () => {
    expect(
      interpolateAppCopy("Enter a valid phone number (e.g. {example})", {
        example: "+34 600 00 00 00",
      })
    ).toBe("Enter a valid phone number (e.g. +34 600 00 00 00)");
  });
});

describe("localeFromCookieHeader", () => {
  it("reads NEXT_LOCALE", () => {
    expect(localeFromCookieHeader("theme=dark; NEXT_LOCALE=en")).toBe("en");
    expect(localeFromCookieHeader("NEXT_LOCALE=es")).toBe("es");
    expect(localeFromCookieHeader("other=1")).toBe(null);
  });
});

describe("localeFromRequest", () => {
  it("prefers cookie over Accept-Language", () => {
    const request = new Request("http://localhost", {
      headers: {
        cookie: "NEXT_LOCALE=en",
        "accept-language": "es",
      },
    });
    expect(localeFromRequest(request)).toBe("en");
  });

  it("falls back to Accept-Language", () => {
    const request = new Request("http://localhost", {
      headers: { "accept-language": "en-US,en;q=0.9" },
    });
    expect(localeFromRequest(request)).toBe("en");
  });
});

describe("localeFromDocument", () => {
  it("reads NEXT_LOCALE from document.cookie", () => {
    vi.stubGlobal("document", { cookie: "NEXT_LOCALE=en" });
    expect(localeFromDocument()).toBe("en");
    vi.unstubAllGlobals();
  });

  it("falls back to navigator.language", () => {
    vi.stubGlobal("document", { cookie: "" });
    vi.stubGlobal("navigator", { language: "en-GB" });
    expect(localeFromDocument()).toBe("en");
    vi.stubGlobal("navigator", { language: "fr-FR" });
    expect(localeFromDocument()).toBe("es");
    vi.unstubAllGlobals();
  });
});
