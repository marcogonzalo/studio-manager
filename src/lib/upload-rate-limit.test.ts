import { describe, it, expect } from "vitest";
import {
  DEFAULT_UPLOAD_RETRY_AFTER_SEC,
  isRateLimitStatus,
  parseRetryAfterSeconds,
} from "@/lib/upload-rate-limit";

describe("isRateLimitStatus", () => {
  it("is true only for 429", () => {
    expect(isRateLimitStatus(429)).toBe(true);
    expect(isRateLimitStatus(400)).toBe(false);
    expect(isRateLimitStatus(200)).toBe(false);
  });
});

describe("parseRetryAfterSeconds", () => {
  it("reads integer Retry-After", () => {
    const res = new Response(null, {
      status: 429,
      headers: { "Retry-After": "12" },
    });
    expect(parseRetryAfterSeconds(res)).toBe(12);
  });

  it("clamps zero to 1", () => {
    const res = new Response(null, {
      status: 429,
      headers: { "Retry-After": "0" },
    });
    expect(parseRetryAfterSeconds(res)).toBe(1);
  });

  it("falls back when header missing", () => {
    const res = new Response(null, { status: 429 });
    expect(parseRetryAfterSeconds(res)).toBe(DEFAULT_UPLOAD_RETRY_AFTER_SEC);
  });

  it("falls back for HTTP-date Retry-After", () => {
    const res = new Response(null, {
      status: 429,
      headers: { "Retry-After": "Wed, 21 Oct 2015 07:28:00 GMT" },
    });
    expect(parseRetryAfterSeconds(res)).toBe(DEFAULT_UPLOAD_RETRY_AFTER_SEC);
  });
});
