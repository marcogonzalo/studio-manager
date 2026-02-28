import { describe, it, expect } from "vitest";
import nextConfig from "../../next.config";

/** Finds the security headers config (route "/:path*"), not static cache config. */
async function getSecurityHeaderConfig() {
  const headers = await nextConfig.headers?.();
  return headers?.find((h) => h.source === "/:path*");
}

/**
 * Tests for security headers configuration
 * Verifies that security headers are properly configured in next.config.ts
 */
describe("Security Headers Configuration", () => {
  it("should have headers function configured", () => {
    expect(nextConfig.headers).toBeDefined();
    expect(typeof nextConfig.headers).toBe("function");
  });

  it("should return headers array with security headers", async () => {
    const headers = await nextConfig.headers?.();

    expect(headers).toBeDefined();
    expect(Array.isArray(headers)).toBe(true);
    expect(headers?.length).toBeGreaterThan(0);

    const headerConfig = await getSecurityHeaderConfig();
    expect(headerConfig).toBeDefined();
    expect(headerConfig?.source).toBe("/:path*");
    expect(headerConfig?.headers).toBeDefined();
    expect(Array.isArray(headerConfig?.headers)).toBe(true);
  });

  it("should include X-Frame-Options header", async () => {
    const headerConfig = await getSecurityHeaderConfig();
    const headerArray = headerConfig?.headers as Array<{
      key: string;
      value: string;
    }>;

    const xFrameOptions = headerArray?.find((h) => h.key === "X-Frame-Options");
    expect(xFrameOptions).toBeDefined();
    expect(xFrameOptions?.value).toBe("DENY");
  });

  it("should include X-Content-Type-Options header", async () => {
    const headerConfig = await getSecurityHeaderConfig();
    const headerArray = headerConfig?.headers as Array<{
      key: string;
      value: string;
    }>;

    const xContentTypeOptions = headerArray?.find(
      (h) => h.key === "X-Content-Type-Options"
    );
    expect(xContentTypeOptions).toBeDefined();
    expect(xContentTypeOptions?.value).toBe("nosniff");
  });

  it("should include Referrer-Policy header", async () => {
    const headerConfig = await getSecurityHeaderConfig();
    const headerArray = headerConfig?.headers as Array<{
      key: string;
      value: string;
    }>;

    const referrerPolicy = headerArray?.find(
      (h) => h.key === "Referrer-Policy"
    );
    expect(referrerPolicy).toBeDefined();
    expect(referrerPolicy?.value).toBe("strict-origin-when-cross-origin");
  });

  it("should include Content-Security-Policy header", async () => {
    const headerConfig = await getSecurityHeaderConfig();
    const headerArray = headerConfig?.headers as Array<{
      key: string;
      value: string;
    }>;

    const csp = headerArray?.find((h) => h.key === "Content-Security-Policy");
    expect(csp).toBeDefined();
    expect(csp?.value).toBeDefined();
    expect(typeof csp?.value).toBe("string");
    expect(csp?.value.length).toBeGreaterThan(0);
  });

  it("should include X-DNS-Prefetch-Control header", async () => {
    const headerConfig = await getSecurityHeaderConfig();
    const headerArray = headerConfig?.headers as Array<{
      key: string;
      value: string;
    }>;

    const dnsPrefetch = headerArray?.find(
      (h) => h.key === "X-DNS-Prefetch-Control"
    );
    expect(dnsPrefetch).toBeDefined();
    expect(dnsPrefetch?.value).toBe("on");
  });

  it("should include Permissions-Policy header", async () => {
    const headerConfig = await getSecurityHeaderConfig();
    const headerArray = headerConfig?.headers as Array<{
      key: string;
      value: string;
    }>;

    const permissionsPolicy = headerArray?.find(
      (h) => h.key === "Permissions-Policy"
    );
    expect(permissionsPolicy).toBeDefined();
    expect(permissionsPolicy?.value).toBeDefined();
    expect(typeof permissionsPolicy?.value).toBe("string");
  });

  it("should have Content-Security-Policy with required directives", async () => {
    const headerConfig = await getSecurityHeaderConfig();
    const headerArray = headerConfig?.headers as Array<{
      key: string;
      value: string;
    }>;

    const csp = headerArray?.find((h) => h.key === "Content-Security-Policy");
    const cspValue = csp?.value as string;

    // Check for essential CSP directives
    expect(cspValue).toContain("default-src");
    expect(cspValue).toContain("script-src");
    expect(cspValue).toContain("style-src");
    expect(cspValue).toContain("img-src");
    expect(cspValue).toContain("connect-src");
    expect(cspValue).toContain("frame-ancestors");
  });

  it("should have frame-ancestors set to 'none' in CSP", async () => {
    const headerConfig = await getSecurityHeaderConfig();
    const headerArray = headerConfig?.headers as Array<{
      key: string;
      value: string;
    }>;

    const csp = headerArray?.find((h) => h.key === "Content-Security-Policy");
    const cspValue = csp?.value as string;

    expect(cspValue).toContain("frame-ancestors 'none'");
  });
});
