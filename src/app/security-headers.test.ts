import { describe, it, expect, vi } from "vitest";
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
    expect(cspValue).toContain("worker-src");
    expect(cspValue).toContain("frame-ancestors");
    expect(cspValue).toContain("https://challenges.cloudflare.com");
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

  it("allows blob: and data: on connect-src and blob: workers for react-pdf, not on script-src", async () => {
    const headerConfig = await getSecurityHeaderConfig();
    const headerArray = headerConfig?.headers as Array<{
      key: string;
      value: string;
    }>;

    const csp = headerArray?.find((h) => h.key === "Content-Security-Policy");
    const cspValue = csp?.value as string;
    const connectSrc = cspValue
      .split(";")
      .map((d) => d.trim())
      .find((d) => d.startsWith("connect-src"));
    const scriptSrc = cspValue
      .split(";")
      .map((d) => d.trim())
      .find((d) => d.startsWith("script-src"));

    const workerSrc = cspValue
      .split(";")
      .map((d) => d.trim())
      .find((d) => d.startsWith("worker-src"));

    expect(connectSrc).toMatch(/\bblob:/);
    expect(connectSrc).toMatch(/\bdata:/);
    expect(workerSrc).toMatch(/\bblob:/);
    expect(scriptSrc).not.toMatch(/\bdata:/);
    expect(scriptSrc).not.toMatch(/\bblob:/);
  });

  it("keeps the live-mode origin out of CSP outside development", async () => {
    const headerConfig = await getSecurityHeaderConfig();
    const headerArray = headerConfig?.headers as Array<{
      key: string;
      value: string;
    }>;
    const csp = headerArray?.find((h) => h.key === "Content-Security-Policy");

    expect(csp?.value).not.toContain("http://localhost:8400");
  });

  it("allows the live-mode origin on script-src and connect-src in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.resetModules();

    try {
      const { default: devConfig } = await import("../../next.config");
      const headers = await devConfig.headers?.();
      const csp = headers
        ?.find((h) => h.source === "/:path*")
        ?.headers.find((h) => h.key === "Content-Security-Policy");
      const directives = csp?.value.split(";").map((d) => d.trim()) ?? [];
      const scriptSrc = directives.find((d) => d.startsWith("script-src"));
      const connectSrc = directives.find((d) => d.startsWith("connect-src"));

      expect(scriptSrc).toContain("http://localhost:8400");
      expect(connectSrc).toContain("http://localhost:8400");
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
