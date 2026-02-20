import { afterEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, getClientIp, getRouteGroup } from "./rate-limit";

describe("getRouteGroup", () => {
  it("returns auth for /api/auth", () => {
    expect(getRouteGroup("/api/auth")).toBe("auth");
  });
  it("returns auth for /api/auth/callback", () => {
    expect(getRouteGroup("/api/auth/callback")).toBe("auth");
  });
  it("returns upload for /api/upload/document", () => {
    expect(getRouteGroup("/api/upload/document")).toBe("upload");
  });
  it("returns upload for /api/upload/product-image", () => {
    expect(getRouteGroup("/api/upload/product-image")).toBe("upload");
  });
  it("returns account-delete for /api/account/delete", () => {
    expect(getRouteGroup("/api/account/delete")).toBe("account-delete");
  });
  it("returns null for /api/other", () => {
    expect(getRouteGroup("/api/other")).toBeNull();
  });
  it("returns null for /dashboard", () => {
    expect(getRouteGroup("/dashboard")).toBeNull();
  });
});

describe("getClientIp", () => {
  it("uses x-forwarded-for first value", () => {
    const req = new Request("https://x.com", {
      headers: { "x-forwarded-for": " 1.2.3.4 , 5.6.7.8 " },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });
  it("uses x-real-ip when x-forwarded-for missing", () => {
    const req = new Request("https://x.com", {
      headers: { "x-real-ip": "9.9.9.9" },
    });
    expect(getClientIp(req)).toBe("9.9.9.9");
  });
  it("returns unknown when no headers", () => {
    const req = new Request("https://x.com");
    expect(getClientIp(req)).toBe("unknown");
  });
});

describe("checkRateLimit", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under limit for auth", () => {
    const ip = "192.168.1.1";
    for (let i = 0; i < 10; i++) {
      const r = checkRateLimit(ip, "auth");
      expect(r.allowed).toBe(true);
      expect(r.remaining).toBe(10 - i - 1);
    }
  });
  it("denies 11th request for auth in same window", () => {
    const ip = "192.168.1.2";
    for (let i = 0; i < 10; i++) checkRateLimit(ip, "auth");
    const r = checkRateLimit(ip, "auth");
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });
  it("uses separate counters per route group", () => {
    const ip = "192.168.1.3";
    for (let i = 0; i < 10; i++) checkRateLimit(ip, "auth");
    const rUpload = checkRateLimit(ip, "upload");
    expect(rUpload.allowed).toBe(true);
    expect(rUpload.remaining).toBe(19);
  });
  it("uses separate counters per IP", () => {
    for (let i = 0; i < 10; i++) checkRateLimit("192.168.1.4", "auth");
    const r = checkRateLimit("192.168.1.5", "auth");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(9);
  });
  it("account-delete allows 5 then denies", () => {
    const ip = "192.168.1.6";
    for (let i = 0; i < 5; i++) {
      const r = checkRateLimit(ip, "account-delete");
      expect(r.allowed).toBe(true);
    }
    const r = checkRateLimit(ip, "account-delete");
    expect(r.allowed).toBe(false);
  });
  it("returns resetAt in future", () => {
    vi.useFakeTimers({ now: 1000 });
    const r = checkRateLimit("192.168.1.7", "auth");
    expect(r.resetAt).toBeGreaterThan(1000);
    vi.useRealTimers();
  });
});
