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

  it("respects q weights before declaration order", () => {
    expect(resolveLocaleFromAcceptLanguage("en;q=0.5,es;q=0.9")).toBe("es");
    expect(resolveLocaleFromAcceptLanguage("es;q=0.4,en;q=0.8")).toBe("en");
  });

  it("keeps declaration order when q weights are equal", () => {
    expect(resolveLocaleFromAcceptLanguage("es;q=0.8,en;q=0.8")).toBe("es");
    expect(resolveLocaleFromAcceptLanguage("en;q=0.8,es;q=0.8")).toBe("en");
  });

  it("falls back to es when no supported language", () => {
    expect(resolveLocaleFromAcceptLanguage("fr-FR,de;q=0.8")).toBe("es");
  });
});
