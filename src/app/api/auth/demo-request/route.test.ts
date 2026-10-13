import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getAppUiCopy } from "@/lib/app-ui-copy";
import { sendTransactionalEmail } from "@/lib/email/mailersend";
import { getMagicLinkAntiSpamConfig } from "@/lib/auth/magic-link-anti-spam-config";

vi.mock("@/lib/supabase/keys", () => ({
  getSupabaseUrl: () => "https://test.supabase.co",
  getSupabaseServiceRoleKey: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      admin: {
        generateLink: vi.fn(),
      },
    },
    from: vi.fn(() => ({
      upsert: vi.fn(() => ({
        then: vi.fn((cb) => cb({ error: null })),
      })),
    })),
  })),
}));

vi.mock("@/lib/email/mailersend", () => ({
  sendTransactionalEmail: vi.fn().mockResolvedValue({ success: true }),
  getContactFormToEmail: () => "contact@test.com",
  getDefaultFrom: () => ({ email: "noreply@test.com", name: "Test" }),
}));

vi.mock("@/lib/auth/magic-link-anti-spam-config", () => ({
  getMagicLinkAntiSpamConfig: vi.fn(),
}));

vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/rate-limit")>();
  return {
    ...actual,
    checkRateLimit: vi.fn(),
    getClientIp: vi.fn(() => "test-ip"),
  };
});

function mockAdminClient(options?: {
  profileId?: string | null;
  userEmail?: string;
  createUser?: ReturnType<typeof vi.fn>;
}) {
  const userEmail = options?.userEmail ?? "visitor@example.com";
  const createUser =
    options?.createUser ??
    vi.fn().mockResolvedValue({
      data: { user: { id: "new-user-id", email: userEmail } },
      error: null,
    });
  const maybeSingle = vi.fn().mockResolvedValue({
    data: options?.profileId ? { id: options.profileId } : null,
    error: null,
  });

  return {
    auth: {
      admin: {
        createUser,
        generateLink: vi.fn().mockResolvedValue({
          data: {
            properties: { action_link: "https://example.com/demo-magic" },
          },
          error: null,
        }),
      },
    },
    from: vi.fn((table: string) => {
      if (table === "profiles") {
        return {
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              maybeSingle,
            }),
          }),
        };
      }
      return {
        upsert: vi.fn(() => ({
          then: vi.fn((cb) => cb({ error: null })),
        })),
      };
    }),
  };
}

describe("POST /api/auth/demo-request", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getMagicLinkAntiSpamConfig).mockReturnValue({
      enabled: false,
      captchaProvider: "none",
      getTurnstileSecretKey: () => undefined,
      riskThreshold: 100,
      actionOnSpam: "silent_block",
    });
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetAt: Date.now() + 60000,
    });
  });

  it("returns 400 if email is missing", async () => {
    const request = new NextRequest("http://localhost/api/auth/demo-request", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(getAppUiCopy("es").validation.emailRequired);
  });

  it("returns 400 if email format is invalid", async () => {
    const request = new NextRequest("http://localhost/api/auth/demo-request", {
      method: "POST",
      body: JSON.stringify({ email: "invalid-email" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(getAppUiCopy("es").validation.emailInvalid);
  });

  it("returns 400 if email exceeds RFC max length", async () => {
    const local = "a".repeat(64);
    const domain = "b".repeat(190) + ".com";
    const request = new NextRequest("http://localhost/api/auth/demo-request", {
      method: "POST",
      body: JSON.stringify({ email: `${local}@${domain}` }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(getAppUiCopy("es").validation.emailInvalid);
  });

  it("returns 400 if optional attribution fields are the wrong type", async () => {
    const request = new NextRequest("http://localhost/api/auth/demo-request", {
      method: "POST",
      body: JSON.stringify({
        email: "visitor@example.com",
        utm_source: 123,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns 503 when service role key is not set", async () => {
    const { getSupabaseServiceRoleKey } = await import("@/lib/supabase/keys");
    vi.mocked(getSupabaseServiceRoleKey).mockReturnValue(undefined);

    const request = new NextRequest("http://localhost/api/auth/demo-request", {
      method: "POST",
      body: JSON.stringify({ email: "visitor@example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBeDefined();
  });

  it("new demo user magic link lands on the dashboard that lists the example project", async () => {
    const { getSupabaseServiceRoleKey } = await import("@/lib/supabase/keys");
    const { createClient } = await import("@supabase/supabase-js");
    const admin = mockAdminClient();
    vi.mocked(getSupabaseServiceRoleKey).mockReturnValue("test-service-role");
    vi.mocked(createClient).mockReturnValue(admin as never);

    const request = new NextRequest("http://localhost/api/auth/demo-request", {
      method: "POST",
      headers: { origin: "https://app.test" },
      body: JSON.stringify({ email: "visitor@example.com" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(admin.auth.admin.generateLink).toHaveBeenCalledWith({
      type: "magiclink",
      email: "visitor@example.com",
      options: {
        redirectTo:
          "https://app.test/auth/complete?next=%2Fveta-app%2Fdashboard&demo=1",
      },
    });
  });

  it("sends visitor email in English when lang is en", async () => {
    const { getSupabaseServiceRoleKey } = await import("@/lib/supabase/keys");
    const { createClient } = await import("@supabase/supabase-js");
    vi.mocked(getSupabaseServiceRoleKey).mockReturnValue("test-service-role");
    vi.mocked(createClient).mockReturnValue(mockAdminClient() as never);

    const request = new NextRequest("http://localhost/api/auth/demo-request", {
      method: "POST",
      headers: { origin: "https://app.test" },
      body: JSON.stringify({
        email: "visitor@example.com",
        lang: "en",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const visitorEmail = vi.mocked(sendTransactionalEmail).mock.calls[0]?.[0];
    expect(visitorEmail?.to).toBe("visitor@example.com");
    expect(visitorEmail?.subject).toContain("Your link");
    expect(visitorEmail?.html).toContain("Try the Veta demo");
    const internal = vi.mocked(sendTransactionalEmail).mock.calls[1]?.[0];
    expect(internal?.subject).toContain("Solicitud de demo");
    expect(internal?.html).toContain("Idioma (locale): en");
    expect(internal?.html).not.toContain("Visitor");
  });

  it("reuses existing profile id and skips createUser", async () => {
    const { getSupabaseServiceRoleKey } = await import("@/lib/supabase/keys");
    const { createClient } = await import("@supabase/supabase-js");
    const createUser = vi.fn();
    vi.mocked(getSupabaseServiceRoleKey).mockReturnValue("test-service-role");
    vi.mocked(createClient).mockReturnValue(
      mockAdminClient({ profileId: "existing-id", createUser }) as never
    );

    const request = new NextRequest("http://localhost/api/auth/demo-request", {
      method: "POST",
      headers: { origin: "https://app.test" },
      body: JSON.stringify({ email: "Visitor@Example.com" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(createUser).not.toHaveBeenCalled();
  });

  it("rejects emails with HTML-special chars that fail Zod email validation", async () => {
    const request = new NextRequest("http://localhost/api/auth/demo-request", {
      method: "POST",
      body: JSON.stringify({
        email: "evil<img>@example.com",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(getAppUiCopy("es").validation.emailInvalid);
    expect(vi.mocked(sendTransactionalEmail)).not.toHaveBeenCalled();
  });

  it("returns 400 captcha_required when anti-spam requires captcha", async () => {
    vi.mocked(getMagicLinkAntiSpamConfig).mockReturnValue({
      enabled: true,
      captchaProvider: "turnstile",
      getTurnstileSecretKey: () => "secret",
      riskThreshold: 0,
      actionOnSpam: "silent_block",
    });

    const request = new NextRequest("http://localhost/api/auth/demo-request", {
      method: "POST",
      body: JSON.stringify({ email: "visitor@example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe("captcha_required");
    expect(vi.mocked(sendTransactionalEmail)).not.toHaveBeenCalled();
  });

  it("returns fake success without sending emails when anti-spam silent-blocks", async () => {
    vi.mocked(getMagicLinkAntiSpamConfig).mockReturnValue({
      enabled: true,
      captchaProvider: "none",
      getTurnstileSecretKey: () => undefined,
      riskThreshold: 0,
      actionOnSpam: "silent_block",
    });
    const { getSupabaseServiceRoleKey } = await import("@/lib/supabase/keys");
    vi.mocked(getSupabaseServiceRoleKey).mockReturnValue("test-service-role");

    const request = new NextRequest("http://localhost/api/auth/demo-request", {
      method: "POST",
      body: JSON.stringify({ email: "visitor@example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(vi.mocked(sendTransactionalEmail)).not.toHaveBeenCalled();
  });
});
