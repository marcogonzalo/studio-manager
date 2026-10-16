import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockIsOurB2Url = vi.fn();
const mockReportError = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ getAll: () => [], set: vi.fn() })),
}));

vi.mock("@/lib/supabase/keys", () => ({
  getSupabaseUrl: () => "https://test.supabase.co",
  getSupabaseServerKey: () => "server-key",
}));

vi.mock("@/lib/backblaze", () => ({
  isOurB2Url: (...args: unknown[]) => mockIsOurB2Url(...args),
}));

vi.mock("@/lib/utils", () => ({
  reportError: (...args: unknown[]) => mockReportError(...args),
}));

describe("POST /api/storage/backfill-product-sizes", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsOurB2Url.mockReturnValue(true);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const { POST } = await import("./route");
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("skips non-B2 URLs and does not call fetch", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1" } },
      error: null,
    });
    mockIsOurB2Url.mockReturnValue(false);

    const eq = vi.fn().mockReturnThis();
    const is = vi.fn().mockResolvedValue({
      data: [{ id: "p1", image_url: "https://evil.example/x.webp" }],
      error: null,
    });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq,
        not: vi.fn().mockReturnValue({ is }),
      }),
    });

    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as typeof fetch;

    const { POST } = await import("./route");
    const res = await POST();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.updated).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockReportError).toHaveBeenCalled();
  });

  it("updates size for trusted B2 URLs", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1" } },
      error: null,
    });

    const updateEq2 = vi.fn().mockResolvedValue({ error: null });
    const updateEq1 = vi.fn().mockReturnValue({ eq: updateEq2 });
    const update = vi.fn().mockReturnValue({ eq: updateEq1 });

    const is = vi.fn().mockResolvedValue({
      data: [
        {
          id: "p1",
          image_url: "https://f003.backblazeb2.com/file/bucket/u1/p1.webp",
        },
      ],
      error: null,
    });
    const not = vi.fn().mockReturnValue({ is });
    const selectEq = vi.fn().mockReturnValue({ not });

    mockFrom.mockImplementation((table: string) => {
      if (table === "products") {
        return {
          select: vi.fn().mockReturnValue({ eq: selectEq }),
          update,
        };
      }
      return {};
    });

    globalThis.fetch = vi.fn().mockResolvedValue({
      headers: {
        get: (name: string) => (name === "content-length" ? "1234" : null),
      },
    }) as typeof fetch;

    const { POST } = await import("./route");
    const res = await POST();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ updated: 1 });
    expect(update).toHaveBeenCalledWith({ image_size_bytes: 1234 });
  });
});
