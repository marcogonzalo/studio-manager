import { afterEach, describe, expect, it, vi } from "vitest";
import { CANONICAL_SITE_ORIGIN, getSiteUrl, isWwwVetaHost } from "./site-url";

describe("getSiteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns canonical apex origin by default", () => {
    expect(getSiteUrl()).toBe(CANONICAL_SITE_ORIGIN);
  });

  it("normalizes NEXT_PUBLIC_APP_URL to apex HTTPS without www", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://www.veta.pro/");
    expect(getSiteUrl()).toBe(CANONICAL_SITE_ORIGIN);
  });

  it("uses canonical origin in Vercel production when env is unset", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_URL", "veta-pro.vercel.app");
    expect(getSiteUrl()).toBe(CANONICAL_SITE_ORIGIN);
  });

  it("uses preview deployment URL outside production", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "veta-git-feat-abc.vercel.app");
    expect(getSiteUrl()).toBe("https://veta-git-feat-abc.vercel.app");
  });
});

describe("isWwwVetaHost", () => {
  it("detects www.veta.pro with optional port", () => {
    expect(isWwwVetaHost("www.veta.pro")).toBe(true);
    expect(isWwwVetaHost("WWW.VETA.PRO:443")).toBe(true);
  });

  it("ignores apex and other hosts", () => {
    expect(isWwwVetaHost("veta.pro")).toBe(false);
    expect(isWwwVetaHost("localhost:3000")).toBe(false);
    expect(isWwwVetaHost(null)).toBe(false);
  });
});
