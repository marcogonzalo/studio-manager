import { describe, expect, it } from "vitest";
import { buildLocaleAlternates } from "./locale-alternates";

describe("buildLocaleAlternates", () => {
  it("uses ES path as canonical and x-default for es locale", () => {
    expect(buildLocaleAlternates("/sign-in", "/en/sign-in", "es")).toEqual({
      canonical: "/sign-in",
      alternates: {
        canonical: "/sign-in",
        languages: {
          es: "/sign-in",
          en: "/en/sign-in",
          "x-default": "/sign-in",
        },
      },
    });
  });

  it("uses EN path as canonical for en locale", () => {
    expect(buildLocaleAlternates("/", "/en", "en")).toEqual({
      canonical: "/en",
      alternates: {
        canonical: "/en",
        languages: {
          es: "/",
          en: "/en",
          "x-default": "/",
        },
      },
    });
  });
});
