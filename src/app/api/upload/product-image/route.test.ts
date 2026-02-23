import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ getAll: () => [], set: vi.fn() })),
}));

const mockDeleteProductImage = vi.fn(() => Promise.resolve());
const mockUploadProductImage = vi.fn(() =>
  Promise.resolve("https://b2.example.com/image.webp")
);

vi.mock("@/lib/backblaze", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/backblaze")>("@/lib/backblaze");
  return {
    ...actual,
    deleteProductImage: mockDeleteProductImage,
    uploadProductImage: mockUploadProductImage,
  };
});

vi.mock("@/lib/image-validation", () => ({
  validateImageFile: vi.fn(() => ({ valid: true })),
}));

vi.mock("@/lib/storage-limit", () => ({
  checkStorageLimit: vi.fn(() => Promise.resolve({ allowed: true })),
}));

vi.mock("sharp", () => ({
  default: vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from("image-data")),
  })),
}));

const mockGetSupabaseUrl = vi.fn(() => "https://test.supabase.co");
const mockGetServerKey = vi.fn(() => "server-key");

vi.mock("@/lib/supabase/keys", () => ({
  getSupabaseUrl: () => mockGetSupabaseUrl(),
  getSupabaseServerKey: () => mockGetServerKey(),
}));

function createMockChain(data: unknown, error: unknown = null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
  };
  return chain;
}

function createMockChainWithData(data: unknown) {
  return createMockChain(data, null);
}

function createMockChainWithError(error: unknown) {
  return createMockChain(null, error);
}

describe("DELETE /api/upload/product-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteProductImage.mockResolvedValue(undefined);
  });

  it("returns 401 when no user", async () => {
    const { DELETE } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error("No user"),
    });

    const res = await DELETE(
      new Request(
        "http://localhost/api/upload/product-image?url=https://b2.example.com/image.webp"
      )
    );

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("No autorizado");
  });

  it("returns 404 when image does not exist (neither product nor space_image)", async () => {
    const { DELETE } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });

    // Mock product not found
    mockFrom.mockReturnValueOnce(
      createMockChainWithError(new Error("Not found"))
    );
    // Mock space_image not found
    mockFrom.mockReturnValueOnce(
      createMockChainWithError(new Error("Not found"))
    );

    const res = await DELETE(
      new Request(
        "http://localhost/api/upload/product-image?url=https://b2.example.com/image.webp"
      )
    );

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Imagen no encontrada");
  });

  it("returns 403 when product image belongs to another user", async () => {
    const { DELETE } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });

    // Mock product exists but belongs to user-2
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "product-1",
        user_id: "user-2", // Different user!
      })
    );

    const res = await DELETE(
      new Request(
        "http://localhost/api/upload/product-image?url=https://b2.example.com/image.webp"
      )
    );

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("No autorizado para eliminar esta imagen");
  });

  it("returns 403 when space image belongs to another user's project", async () => {
    const { DELETE } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });

    // Mock product not found
    mockFrom.mockReturnValueOnce(
      createMockChainWithError(new Error("Not found"))
    );
    // Mock space_image exists
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "space-image-1",
        space_id: "space-1",
      })
    );
    // Mock space exists
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "space-1",
        project_id: "project-1",
      })
    );
    // Mock project belongs to user-2
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "project-1",
        user_id: "user-2", // Different user!
      })
    );

    const res = await DELETE(
      new Request(
        "http://localhost/api/upload/product-image?url=https://b2.example.com/image.webp"
      )
    );

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("No autorizado para eliminar esta imagen");
  });

  it("returns 200 when product image belongs to user", async () => {
    const { DELETE } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });

    // Mock product belongs to user-1
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "product-1",
        user_id: "user-1", // Same user
      })
    );

    const res = await DELETE(
      new Request(
        "http://localhost/api/upload/product-image?url=https://b2.example.com/image.webp"
      )
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });
});

describe("POST /api/upload/product-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUploadProductImage.mockResolvedValue(
      "https://b2.example.com/image.webp"
    );
  });

  it("returns 401 when no user", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error("No user"),
    });

    const formData = new FormData();
    formData.append(
      "file",
      new File(["content"], "test.jpg", { type: "image/jpeg" })
    );
    formData.append("productId", "product-1");

    const res = await POST(
      new Request("http://localhost/api/upload/product-image", {
        method: "POST",
        body: formData,
      })
    );

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("No autorizado");
  });

  it("returns 404 when product does not exist", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });

    mockFrom.mockReturnValueOnce(
      createMockChainWithError(new Error("Not found"))
    );

    const formData = new FormData();
    formData.append(
      "file",
      new File(["content"], "test.jpg", { type: "image/jpeg" })
    );
    formData.append("productId", "product-1");

    const res = await POST(
      new Request("http://localhost/api/upload/product-image", {
        method: "POST",
        body: formData,
      })
    );

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Producto no encontrado");
  });

  it("returns 403 when product belongs to another user", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });

    // Mock product belongs to user-2
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "product-1",
        user_id: "user-2", // Different user!
      })
    );

    const formData = new FormData();
    formData.append(
      "file",
      new File(["content"], "test.jpg", { type: "image/jpeg" })
    );
    formData.append("productId", "product-1");

    const res = await POST(
      new Request("http://localhost/api/upload/product-image", {
        method: "POST",
        body: formData,
      })
    );

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe(
      "No autorizado para subir imágenes a este producto"
    );
  });

  it("returns 403 when projectId provided and project belongs to another user", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });

    // Mock product belongs to user-1
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "product-1",
        user_id: "user-1",
      })
    );
    // Mock project belongs to user-2
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "project-1",
        user_id: "user-2", // Different user!
      })
    );

    const formData = new FormData();
    formData.append(
      "file",
      new File(["content"], "test.jpg", { type: "image/jpeg" })
    );
    formData.append("productId", "product-1");
    formData.append("projectId", "project-1");

    const res = await POST(
      new Request("http://localhost/api/upload/product-image", {
        method: "POST",
        body: formData,
      })
    );

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe(
      "No autorizado para asociar imágenes a este proyecto"
    );
  });

  it("returns 200 when product and project belong to user", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });

    // Mock product belongs to user-1
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "product-1",
        user_id: "user-1",
      })
    );
    // Mock project belongs to user-1
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "project-1",
        user_id: "user-1", // Same user
      })
    );

    const formData = new FormData();
    const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
    formData.append("file", file);
    formData.append("productId", "product-1");
    formData.append("projectId", "project-1");

    const res = await POST(
      new Request("http://localhost/api/upload/product-image", {
        method: "POST",
        body: formData,
      })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBeDefined();
  });
});
