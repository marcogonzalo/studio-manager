import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";
import { checkRateLimit, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { getMagicLinkAntiSpamConfig } from "@/lib/auth/magic-link-anti-spam-config";
import {
  issueMagicLinkCaptchaBypassValue,
  MAGIC_LINK_CAPTCHA_BYPASS_COOKIE,
} from "@/lib/auth/magic-link-captcha-bypass";

const mockSignInWithOtp = vi.fn();

vi.mock("@/lib/auth/magic-link-anti-spam-config", () => ({
  getMagicLinkAntiSpamConfig: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        signInWithOtp: mockSignInWithOtp,
      },
    })
  ),
}));

vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/rate-limit")>();
  return {
    ...actual,
    checkRateLimit: vi.fn(),
    getClientIp: vi.fn(() => "test-ip"),
  };
});

describe("POST /api/auth/magic-link", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetAt: Date.now() + 60000,
    });
    vi.mocked(getMagicLinkAntiSpamConfig).mockReturnValue({
      enabled: false,
      captchaProvider: "none",
      getTurnstileSecretKey: () => undefined,
      riskThreshold: 100,
      actionOnSpam: "silent_block",
    });
  });

  it("returns 400 if email is missing", async () => {
    const request = new NextRequest("http://localhost/api/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Email is required");
    expect(mockSignInWithOtp).not.toHaveBeenCalled();
  });

  it("returns 400 if email is not a string", async () => {
    const request = new NextRequest("http://localhost/api/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({ email: 123 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Email is required");
  });

  it("returns 400 if email format is invalid", async () => {
    const request = new NextRequest("http://localhost/api/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({ email: "invalid-email" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid email format");
    expect(mockSignInWithOtp).not.toHaveBeenCalled();
  });

  it("calls signInWithOtp with correct parameters", async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });

    const request = new NextRequest("http://localhost/api/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        emailRedirectTo: "http://localhost/callback",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: "test@example.com",
      options: {
        emailRedirectTo: "http://localhost/callback",
        data: { lang: "es" },
      },
    });
  });

  it("includes data in options when provided", async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });

    const request = new NextRequest("http://localhost/api/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        emailRedirectTo: "http://localhost/callback",
        data: {
          full_name: "Test User",
          signup_plan: "PRO",
        },
      }),
    });

    const response = await POST(request);
    await response.json();

    expect(response.status).toBe(200);
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: "test@example.com",
      options: {
        emailRedirectTo: "http://localhost/callback",
        data: {
          full_name: "Test User",
          signup_plan: "PRO",
          lang: "es",
        },
      },
    });
  });

  it("uses body.lang when valid", async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });

    const request = new NextRequest("http://localhost/api/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        emailRedirectTo: "http://localhost/callback",
        lang: "en",
      }),
    });

    await POST(request);

    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: "test@example.com",
      options: {
        emailRedirectTo: "http://localhost/callback",
        data: { lang: "en" },
      },
    });
  });

  it("returns error from Supabase when signInWithOtp fails", async () => {
    const supabaseError = {
      message: "Email rate limit exceeded",
      status: 429,
    };
    mockSignInWithOtp.mockResolvedValue({ error: supabaseError });

    const request = new NextRequest("http://localhost/api/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe("Email rate limit exceeded");
  });

  it("returns 503 and friendly message when Supabase fails with email delivery error", async () => {
    mockSignInWithOtp.mockResolvedValue({
      error: {
        message: "Error sending confirmation email",
        status: 500,
      },
    });

    const request = new NextRequest("http://localhost/api/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toContain("No pudimos enviar el correo");
  });

  it("returns 500 on unexpected errors", async () => {
    const request = new NextRequest("http://localhost/api/auth/magic-link", {
      method: "POST",
      body: "invalid json",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });

  it("returns 429 when rate limit exceeded", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30000,
    });

    const request = new NextRequest("http://localhost/api/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe(RATE_LIMIT_MESSAGE);
    expect(mockSignInWithOtp).not.toHaveBeenCalled();
  });

  it("returns 400 captcha_required when anti-spam requires captcha", async () => {
    vi.mocked(getMagicLinkAntiSpamConfig).mockReturnValue({
      enabled: true,
      captchaProvider: "turnstile",
      getTurnstileSecretKey: () => "secret",
      riskThreshold: 0,
      actionOnSpam: "silent_block",
    });

    const request = new NextRequest("http://localhost/api/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe("captcha_required");
    expect(mockSignInWithOtp).not.toHaveBeenCalled();
  });

  it("calls signInWithOtp without captchaToken when bypass cookie is valid", async () => {
    const prevTurnstile = process.env.TURNSTILE_SECRET_KEY;
    process.env.TURNSTILE_SECRET_KEY = "route-captcha-bypass-secret";

    vi.mocked(getMagicLinkAntiSpamConfig).mockReturnValue({
      enabled: true,
      captchaProvider: "turnstile",
      getTurnstileSecretKey: () => "secret",
      riskThreshold: 0,
      actionOnSpam: "silent_block",
    });
    mockSignInWithOtp.mockResolvedValue({ error: null });

    const cookieVal = issueMagicLinkCaptchaBypassValue("test@example.com");
    expect(cookieVal).toBeTruthy();

    const request = new NextRequest("http://localhost/api/auth/magic-link", {
      method: "POST",
      headers: {
        Cookie: `${MAGIC_LINK_CAPTCHA_BYPASS_COOKIE}=${cookieVal}`,
      },
      body: JSON.stringify({
        email: "test@example.com",
        emailRedirectTo: "http://localhost/callback",
      }),
    });

    const response = await POST(request);
    await response.json();

    expect(response.status).toBe(200);
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: "test@example.com",
      options: {
        emailRedirectTo: "http://localhost/callback",
        data: { lang: "es" },
      },
    });

    process.env.TURNSTILE_SECRET_KEY = prevTurnstile;
    if (prevTurnstile === undefined) {
      delete process.env.TURNSTILE_SECRET_KEY;
    }
  });

  it("returns 200 without OTP when anti-spam silent_blocks", async () => {
    vi.mocked(getMagicLinkAntiSpamConfig).mockReturnValue({
      enabled: true,
      captchaProvider: "none",
      getTurnstileSecretKey: () => undefined,
      riskThreshold: 0,
      actionOnSpam: "silent_block",
    });

    const request = new NextRequest("http://localhost/api/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSignInWithOtp).not.toHaveBeenCalled();
  });

  it("calls signInWithOtp after valid captcha when action is silent_block with Turnstile", async () => {
    vi.mocked(getMagicLinkAntiSpamConfig).mockReturnValue({
      enabled: true,
      captchaProvider: "turnstile",
      getTurnstileSecretKey: () => "secret",
      riskThreshold: 0,
      actionOnSpam: "silent_block",
    });
    mockSignInWithOtp.mockResolvedValue({ error: null });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      })
    );

    const request = new NextRequest("http://localhost/api/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        emailRedirectTo: "http://localhost/callback",
        captchaToken: "valid-token",
      }),
    });

    const response = await POST(request);
    await response.json();

    expect(response.status).toBe(200);
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: "test@example.com",
      options: {
        emailRedirectTo: "http://localhost/callback",
        data: { lang: "es" },
      },
    });
  });

  it("calls signInWithOtp after valid captcha when action is flag_for_review", async () => {
    vi.mocked(getMagicLinkAntiSpamConfig).mockReturnValue({
      enabled: true,
      captchaProvider: "turnstile",
      getTurnstileSecretKey: () => "secret",
      riskThreshold: 0,
      actionOnSpam: "flag_for_review",
    });
    mockSignInWithOtp.mockResolvedValue({ error: null });
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const request = new NextRequest("http://localhost/api/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        emailRedirectTo: "http://localhost/callback",
        captchaToken: "valid-token",
      }),
    });

    const response = await POST(request);
    await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalled();
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: "test@example.com",
      options: {
        emailRedirectTo: "http://localhost/callback",
        data: {
          lang: "es",
          signup_spam_review: true,
          signup_spam_score: expect.any(Number),
        },
      },
    });
  });

  it("returns 400 email_not_allowed when action is hard_block after captcha", async () => {
    vi.mocked(getMagicLinkAntiSpamConfig).mockReturnValue({
      enabled: true,
      captchaProvider: "turnstile",
      getTurnstileSecretKey: () => "secret",
      riskThreshold: 0,
      actionOnSpam: "hard_block",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      })
    );

    const request = new NextRequest("http://localhost/api/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        captchaToken: "valid-token",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe("email_not_allowed");
    expect(mockSignInWithOtp).not.toHaveBeenCalled();
  });
});
