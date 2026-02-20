import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

const mockSignInWithOtp = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        signInWithOtp: mockSignInWithOtp,
      },
    })
  ),
}));

describe("POST /api/auth/magic-link", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
        emailRedirectTo: "http://localhost/auth/callback",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: "test@example.com",
      options: {
        emailRedirectTo: "http://localhost/auth/callback",
      },
    });
  });

  it("includes data in options when provided", async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });

    const request = new NextRequest("http://localhost/api/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        emailRedirectTo: "http://localhost/auth/callback",
        data: {
          full_name: "Test User",
          signup_plan: "PRO",
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: "test@example.com",
      options: {
        emailRedirectTo: "http://localhost/auth/callback",
        data: {
          full_name: "Test User",
          signup_plan: "PRO",
        },
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
});
