import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

vi.mock("@/lib/supabase/keys", () => ({
  getSupabaseUrl: () => "https://test.supabase.co",
  getSupabaseClientKey: () => "test-anon-key",
  getSupabaseServiceRoleKey: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/rate-limit")>();
  return {
    ...actual,
    checkRateLimit: vi.fn(),
    getClientIp: vi.fn(() => "test-ip"),
  };
});

const LEAD_TOKEN = "11111111-1111-4111-8111-111111111111";

describe("POST /api/auth/demo-accessed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetAt: Date.now() + 60000,
    });
  });

  it("returns 401 without bearer token", async () => {
    const request = new NextRequest("http://localhost/api/auth/demo-accessed", {
      method: "POST",
      body: JSON.stringify({ lead: LEAD_TOKEN }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 401 when bearer user is not demo@veta.pro", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const { getSupabaseServiceRoleKey } = await import("@/lib/supabase/keys");
    vi.mocked(getSupabaseServiceRoleKey).mockReturnValue("service-role");
    vi.mocked(createClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "u1", email: "other@example.com" } },
          error: null,
        }),
      },
    } as never);

    const request = new NextRequest("http://localhost/api/auth/demo-accessed", {
      method: "POST",
      headers: { Authorization: "Bearer tok" },
      body: JSON.stringify({ lead: LEAD_TOKEN }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 400 for invalid lead token", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const { getSupabaseServiceRoleKey } = await import("@/lib/supabase/keys");
    vi.mocked(getSupabaseServiceRoleKey).mockReturnValue("service-role");
    vi.mocked(createClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "demo", email: "demo@veta.pro" } },
          error: null,
        }),
      },
    } as never);

    const request = new NextRequest("http://localhost/api/auth/demo-accessed", {
      method: "POST",
      headers: { Authorization: "Bearer tok" },
      body: JSON.stringify({ lead: "not-a-uuid" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("updates lead by demo_access_token", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const { getSupabaseServiceRoleKey } = await import("@/lib/supabase/keys");
    vi.mocked(getSupabaseServiceRoleKey).mockReturnValue("service-role");

    const is = vi.fn().mockResolvedValue({ error: null });
    const eq = vi.fn().mockReturnValue({ is });
    const update = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ update });

    vi.mocked(createClient)
      .mockReturnValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "demo", email: "demo@veta.pro" } },
            error: null,
          }),
        },
      } as never)
      .mockReturnValueOnce({ from } as never);

    const request = new NextRequest("http://localhost/api/auth/demo-accessed", {
      method: "POST",
      headers: { Authorization: "Bearer tok" },
      body: JSON.stringify({ lead: LEAD_TOKEN }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("leads");
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ demo_accessed_at: expect.any(String) })
    );
    expect(eq).toHaveBeenCalledWith("demo_access_token", LEAD_TOKEN);
    expect(is).toHaveBeenCalledWith("demo_accessed_at", null);
  });
});
