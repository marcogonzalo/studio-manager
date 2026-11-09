// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockRpc = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
    rpc: mockRpc,
  })),
}));

const mockUploadAccountLogo = vi.fn(() =>
  Promise.resolve({
    url: "https://f000.backblazeb2.com/file/bucket/assets/user1/branding/logo.png",
    storagePath: "assets/user1/branding/logo.png",
  })
);
const mockDeleteProductImage = vi.fn(() => Promise.resolve());

vi.mock("@/lib/backblaze", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/backblaze")>("@/lib/backblaze");
  return {
    ...actual,
    uploadAccountLogo: mockUploadAccountLogo,
    deleteProductImage: mockDeleteProductImage,
  };
});

vi.mock("@/lib/image-validation", () => ({
  MAX_IMAGE_FILE_SIZE: 5 * 1024 * 1024,
  validateImageFile: vi.fn(() => ({ valid: true })),
}));

vi.mock("@/lib/storage-limit", () => ({
  checkStorageLimit: vi.fn(() => Promise.resolve({ allowed: true })),
}));

vi.mock("@/lib/assets", () => ({
  createAsset: vi.fn(() => Promise.resolve("asset-logo-1")),
  deleteAssetById: vi.fn(() => Promise.resolve()),
  getAssetIdByOwner: vi.fn(() => Promise.resolve(null)),
  getAssetIdByUrl: vi.fn(() => Promise.resolve(null)),
}));

vi.mock("sharp", () => ({
  default: vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    png: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from("png-bytes")),
  })),
}));

vi.mock("@/lib/supabase/keys", () => ({
  getSupabaseUrl: () => "https://test.supabase.co",
  getSupabaseServerKey: () => "server-key",
  getSupabaseServiceRoleKey: () => undefined as string | undefined,
}));

vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/rate-limit")>();
  return {
    ...actual,
    checkRateLimit: vi.fn(() => ({
      allowed: true,
      remaining: 20,
      resetAt: Date.now() + 60_000,
    })),
  };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({})),
}));

function mockPlan(pdf_export_mode: "basic" | "plus" | "full") {
  mockRpc.mockResolvedValue({
    data: [{ plan_code: "X", config: { pdf_export_mode } }],
    error: null,
  });
}

describe("POST /api/upload/account-logo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUploadAccountLogo.mockResolvedValue({
      url: "https://f000.backblazeb2.com/file/bucket/assets/user1/branding/logo.png",
      storagePath: "assets/user1/branding/logo.png",
    });
  });

  it("returns 401 when no user", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error("No user"),
    });

    const formData = new FormData();
    formData.append("file", new File(["x"], "logo.png", { type: "image/png" }));
    const res = await POST(
      new Request("http://localhost/api/upload/account-logo", {
        method: "POST",
        body: formData,
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when plan is basic", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });
    mockPlan("basic");

    const formData = new FormData();
    formData.append("file", new File(["x"], "logo.png", { type: "image/png" }));
    const res = await POST(
      new Request("http://localhost/api/upload/account-logo", {
        method: "POST",
        body: formData,
      })
    );
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.code).toBe("PLAN_CAPABILITY_REQUIRED");
  });

  it("returns 200 for plus plan", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });
    mockPlan("plus");
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { public_logo_url: null, public_logo_asset_id: null },
        error: null,
      }),
    });
    mockFrom.mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    const formData = new FormData();
    formData.append("file", new File(["x"], "logo.png", { type: "image/png" }));
    const res = await POST(
      new Request("http://localhost/api/upload/account-logo", {
        method: "POST",
        body: formData,
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toContain("logo.png");
    expect(mockUploadAccountLogo).toHaveBeenCalled();
  });
});

describe("DELETE /api/upload/account-logo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no user", async () => {
    const { DELETE } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error("No user"),
    });
    const res = await DELETE(
      new Request("http://localhost/api/upload/account-logo", {
        method: "DELETE",
      })
    );
    expect(res.status).toBe(401);
  });

  it("clears logo for full plan", async () => {
    const { DELETE } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });
    mockPlan("full");
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          public_logo_url: "https://f000.backblazeb2.com/file/bucket/logo.png",
          public_logo_asset_id: null,
        },
        error: null,
      }),
    });
    mockFrom.mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    const res = await DELETE(
      new Request("http://localhost/api/upload/account-logo", {
        method: "DELETE",
      })
    );
    expect(res.status).toBe(200);
    expect(mockDeleteProductImage).toHaveBeenCalled();
  });
});
