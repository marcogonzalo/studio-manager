import { describe, it, expect } from "vitest";
import { resolveEmailLocale } from "./auth-email-lang";

describe("resolveEmailLocale", () => {
  it("uses explicit en when valid", () => {
    expect(resolveEmailLocale("en", "es-ES,es;q=0.9")).toBe("en");
  });

  it("uses explicit es when valid", () => {
    expect(resolveEmailLocale("es", "en-US,en;q=0.9")).toBe("es");
  });

  it("ignores invalid explicit and falls back to Accept-Language", () => {
    expect(resolveEmailLocale("fr", "en-US,en;q=0.9")).toBe("en");
    expect(resolveEmailLocale(null, "es-ES")).toBe("es");
  });
});
