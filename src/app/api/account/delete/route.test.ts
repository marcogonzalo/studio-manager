import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockDeleteUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: { admin: { deleteUser: mockDeleteUser } },
    from: mockFrom,
  })),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ getAll: () => [], set: vi.fn() })),
}));

vi.mock("@/lib/backblaze", () => ({
  deleteAllFilesForUser: vi.fn(() => Promise.resolve()),
}));

const mockGetSupabaseUrl = vi.fn(() => "https://test.supabase.co");
const mockGetServerKey = vi.fn(() => "server-key");
const mockGetServiceRoleKey = vi.fn(() => null);

vi.mock("@/lib/supabase/keys", () => ({
  getSupabaseUrl: () => mockGetSupabaseUrl(),
  getSupabaseServerKey: () => mockGetServerKey(),
  getSupabaseServiceRoleKey: () => mockGetServiceRoleKey(),
}));

async function chainFrom() {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: [], error: null }),
  };
  mockFrom.mockReturnValue(chain);
  return chain;
}

describe("POST /api/account/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServiceRoleKey.mockReturnValue("service-role-key");
  });

  it("returns 401 when no user", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error("No user") });

    const res = await POST(
      new Request("http://localhost/api/account/delete", {
        method: "POST",
        body: JSON.stringify({ email: "u@test.com" }),
      })
    );

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("No autorizado");
  });

  it("returns 400 when body is not JSON", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "uid", email: "u@test.com" } },
      error: null,
    });

    const res = await POST(
      new Request("http://localhost/api/account/delete", {
        method: "POST",
        body: "not json",
      })
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Cuerpo inválido");
  });

  it("returns 400 when email does not match", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "uid", email: "user@test.com" } },
      error: null,
    });

    const res = await POST(
      new Request("http://localhost/api/account/delete", {
        method: "POST",
        body: JSON.stringify({ email: "other@test.com" }),
      })
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("El correo no coincide con el de la cuenta");
  });

  it("returns 503 when service role key is missing", async () => {
    mockGetServiceRoleKey.mockReturnValue(null);
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "uid", email: "u@test.com" } },
      error: null,
    });

    const res = await POST(
      new Request("http://localhost/api/account/delete", {
        method: "POST",
        body: JSON.stringify({ email: "u@test.com" }),
      })
    );

    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toBe("Operación no disponible");
  });

  it("returns 200 when email matches and deletion succeeds", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "uid", email: "user@test.com" } },
      error: null,
    });
    await chainFrom();
    mockDeleteUser.mockResolvedValue({ error: null });

    const res = await POST(
      new Request("http://localhost/api/account/delete", {
        method: "POST",
        body: JSON.stringify({ email: "user@test.com" }),
      })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it("returns 500 when auth.admin.deleteUser fails", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "uid", email: "u@test.com" } },
      error: null,
    });
    await chainFrom();
    mockDeleteUser.mockResolvedValue({ error: new Error("Auth error") });

    const res = await POST(
      new Request("http://localhost/api/account/delete", {
        method: "POST",
        body: JSON.stringify({ email: "u@test.com" }),
      })
    );

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toContain("sesión");
  });
});
