import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const mockGetUser = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();
const mockCreateClient = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

vi.mock("@/lib/supabase/keys", () => ({
  getSupabaseUrl: () => "https://example.supabase.co",
  getSupabaseClientKey: () => "anon-key",
  getSupabaseServiceRoleKey: () => "service-role-key",
}));

vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/rate-limit")>();
  return {
    ...actual,
    checkRateLimit: vi.fn(),
    getClientIp: vi.fn(() => "test-ip"),
  };
});

vi.mock("@/lib/utils", () => ({
  reportError: vi.fn(),
}));

describe("POST /api/auth/demo-accessed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetAt: Date.now() + 60000,
    });

    mockEq.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "demo@example.com" } },
      error: null,
    });

    mockCreateClient.mockImplementation((_url: string, key: string) => {
      if (key === "anon-key") {
        return { auth: { getUser: mockGetUser } };
      }
      return { from: mockFrom };
    });
  });

  it("returns 401 when Authorization Bearer is missing", async () => {
    const request = new NextRequest("http://localhost/api/auth/demo-accessed", {
      method: "POST",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "invalid" },
    });

    const request = new NextRequest("http://localhost/api/auth/demo-accessed", {
      method: "POST",
      headers: { Authorization: "Bearer bad-token" },
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("updates lead using email from the authenticated token", async () => {
    const request = new NextRequest("http://localhost/api/auth/demo-accessed", {
      method: "POST",
      headers: { Authorization: "Bearer good-token" },
      body: JSON.stringify({ email: "attacker@evil.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockGetUser).toHaveBeenCalledWith("good-token");
    expect(mockFrom).toHaveBeenCalledWith("leads");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        demo_accessed_at: expect.any(String),
      })
    );
    expect(mockEq).toHaveBeenCalledWith("email", "demo@example.com");
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30000,
    });

    const request = new NextRequest("http://localhost/api/auth/demo-accessed", {
      method: "POST",
      headers: { Authorization: "Bearer good-token" },
    });

    const response = await POST(request);

    expect(response.status).toBe(429);
    expect(mockGetUser).not.toHaveBeenCalled();
  });
});
