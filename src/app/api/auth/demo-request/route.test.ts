import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendTransactionalEmail } from "@/lib/email/mailersend";

vi.mock("@/lib/supabase/keys", () => ({
  getSupabaseUrl: () => "https://test.supabase.co",
  getSupabaseServiceRoleKey: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/email/mailersend", () => ({
  sendTransactionalEmail: vi.fn().mockResolvedValue({ success: true }),
  getContactFormToEmail: () => "contact@test.com",
  getDefaultFrom: () => ({ email: "noreply@test.com", name: "Test" }),
}));

vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/rate-limit")>();
  return {
    ...actual,
    checkRateLimit: vi.fn(),
    getClientIp: vi.fn(() => "test-ip"),
  };
});

describe("POST /api/auth/demo-request", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(data.error).toContain("correo");
  });

  it("returns 400 if email format is invalid", async () => {
    const request = new NextRequest("http://localhost/api/auth/demo-request", {
      method: "POST",
      body: JSON.stringify({ email: "invalid-email" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Formato");
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

  it("sends visitor email in English when lang is en", async () => {
    const { getSupabaseServiceRoleKey } = await import("@/lib/supabase/keys");
    const { createClient } = await import("@supabase/supabase-js");
    vi.mocked(getSupabaseServiceRoleKey).mockReturnValue("test-service-role");
    vi.mocked(createClient).mockReturnValue({
      auth: {
        admin: {
          generateLink: vi.fn().mockResolvedValue({
            data: {
              properties: { action_link: "https://example.com/demo-magic" },
            },
            error: null,
          }),
        },
      },
    } as never);

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

  it("escapes visitor email in internal notification HTML", async () => {
    const { getSupabaseServiceRoleKey } = await import("@/lib/supabase/keys");
    const { createClient } = await import("@supabase/supabase-js");
    vi.mocked(getSupabaseServiceRoleKey).mockReturnValue("test-service-role");
    vi.mocked(createClient).mockReturnValue({
      auth: {
        admin: {
          generateLink: vi.fn().mockResolvedValue({
            data: {
              properties: { action_link: "https://example.com/demo-magic" },
            },
            error: null,
          }),
        },
      },
    } as never);

    const request = new NextRequest("http://localhost/api/auth/demo-request", {
      method: "POST",
      headers: { origin: "https://app.test" },
      body: JSON.stringify({
        email: "evil<img>@example.com",
        lang: "en",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(vi.mocked(sendTransactionalEmail).mock.calls.length).toBe(2);
    const internal = vi.mocked(sendTransactionalEmail).mock.calls[1]?.[0];
    expect(internal?.html).toContain("evil&lt;img&gt;");
    expect(internal?.html).not.toContain("evil<img>");
  });

  it("escapes ampersand in visitor email in internal notification HTML", async () => {
    const { getSupabaseServiceRoleKey } = await import("@/lib/supabase/keys");
    const { createClient } = await import("@supabase/supabase-js");
    vi.mocked(getSupabaseServiceRoleKey).mockReturnValue("test-service-role");
    vi.mocked(createClient).mockReturnValue({
      auth: {
        admin: {
          generateLink: vi.fn().mockResolvedValue({
            data: {
              properties: { action_link: "https://example.com/demo-magic" },
            },
            error: null,
          }),
        },
      },
    } as never);

    const request = new NextRequest("http://localhost/api/auth/demo-request", {
      method: "POST",
      headers: { origin: "https://app.test" },
      body: JSON.stringify({
        email: "test&visitor@example.com",
        lang: "es",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const internal = vi.mocked(sendTransactionalEmail).mock.calls[1]?.[0];
    expect(internal?.html).toContain("test&amp;visitor");
    expect(internal?.html).not.toContain("test&visitor");
  });
});
