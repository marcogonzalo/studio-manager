import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockUpsert = vi.fn();
const mockTrackEvent = vi.fn();
const mockGetServiceRoleKey = vi.fn(() => "service-role-key" as string | null);

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: () => ({
      upsert: mockUpsert,
    }),
  })),
}));

vi.mock("@/lib/supabase/keys", () => ({
  getSupabaseUrl: () => "https://test.supabase.co",
  getSupabaseServiceRoleKey: () => mockGetServiceRoleKey(),
}));

vi.mock("@/lib/track-event", () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

describe("POST /api/plan/notify-interest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServiceRoleKey.mockReturnValue("service-role-key");
    mockUpsert.mockResolvedValue({ error: null });
    mockTrackEvent.mockResolvedValue(true);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const { POST } = await import("./route");
    const res = await POST(
      new Request("http://localhost/api/plan/notify-interest", {
        method: "POST",
        body: JSON.stringify({ type: "projects" }),
      })
    );
    expect(res.status).toBe(401);
  });

  it("upserts lead and tracks limit_cta_clicked", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1", email: "User@Veta.pro" } },
      error: null,
    });
    const { POST } = await import("./route");
    const res = await POST(
      new Request("http://localhost/api/plan/notify-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "storage" }),
      })
    );
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@veta.pro",
        source: "plan_limit_interest",
        user_id: "u1",
      }),
      { onConflict: "email" }
    );
    expect(mockTrackEvent).toHaveBeenCalledWith("limit_cta_clicked", {
      type: "storage",
      source: "plan_limit_interest",
    });
  });

  it("returns 503 when service role missing", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.com" } },
      error: null,
    });
    mockGetServiceRoleKey.mockReturnValue(null);
    const { POST } = await import("./route");
    const res = await POST(
      new Request("http://localhost/api/plan/notify-interest", {
        method: "POST",
        body: "{}",
      })
    );
    expect(res.status).toBe(503);
  });
});
