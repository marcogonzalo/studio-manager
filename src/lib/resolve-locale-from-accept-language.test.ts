import { describe, it, expect } from "vitest";
import { resolveLocaleFromAcceptLanguage } from "./resolve-locale-from-accept-language";

describe("resolveLocaleFromAcceptLanguage", () => {
  it("returns es for null or empty", () => {
    expect(resolveLocaleFromAcceptLanguage(null)).toBe("es");
    expect(resolveLocaleFromAcceptLanguage("")).toBe("es");
  });

  it("picks en from primary tag", () => {
    expect(resolveLocaleFromAcceptLanguage("en-US,en;q=0.9")).toBe("en");
    expect(resolveLocaleFromAcceptLanguage("en")).toBe("en");
  });

  it("picks es from primary tag", () => {
    expect(resolveLocaleFromAcceptLanguage("es-ES,es;q=0.9")).toBe("es");
  });

  it("respects order of preferences", () => {
    expect(resolveLocaleFromAcceptLanguage("fr-FR, en-GB")).toBe("en");
    expect(resolveLocaleFromAcceptLanguage("de, es-MX")).toBe("es");
  });

  it("falls back to es when no supported language", () => {
    expect(resolveLocaleFromAcceptLanguage("fr-FR,de;q=0.8")).toBe("es");
  });
});
