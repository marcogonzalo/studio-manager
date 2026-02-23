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

const mockUploadSpaceImage = vi.fn(() =>
  Promise.resolve("https://b2.example.com/image.webp")
);

vi.mock("@/lib/backblaze", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/backblaze")>("@/lib/backblaze");
  return {
    ...actual,
    uploadSpaceImage: mockUploadSpaceImage,
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

describe("POST /api/upload/space-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUploadSpaceImage.mockResolvedValue("https://b2.example.com/image.webp");
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
    formData.append("projectId", "project-1");
    formData.append("spaceId", "space-1");
    formData.append("imageId", "image-1");

    const res = await POST(
      new Request("http://localhost/api/upload/space-image", {
        method: "POST",
        body: formData,
      })
    );

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("No autorizado");
  });

  it("returns 404 when project does not exist", async () => {
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
    formData.append("projectId", "project-1");
    formData.append("spaceId", "space-1");
    formData.append("imageId", "image-1");

    const res = await POST(
      new Request("http://localhost/api/upload/space-image", {
        method: "POST",
        body: formData,
      })
    );

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Proyecto no encontrado");
  });

  it("returns 403 when project belongs to another user", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });

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
    formData.append("projectId", "project-1");
    formData.append("spaceId", "space-1");
    formData.append("imageId", "image-1");

    const res = await POST(
      new Request("http://localhost/api/upload/space-image", {
        method: "POST",
        body: formData,
      })
    );

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe(
      "No autorizado para subir imágenes a este proyecto"
    );
  });

  it("returns 404 when space does not exist", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });

    // Mock project belongs to user-1
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "project-1",
        user_id: "user-1",
      })
    );
    // Mock space not found
    mockFrom.mockReturnValueOnce(
      createMockChainWithError(new Error("Not found"))
    );

    const formData = new FormData();
    formData.append(
      "file",
      new File(["content"], "test.jpg", { type: "image/jpeg" })
    );
    formData.append("projectId", "project-1");
    formData.append("spaceId", "space-1");
    formData.append("imageId", "image-1");

    const res = await POST(
      new Request("http://localhost/api/upload/space-image", {
        method: "POST",
        body: formData,
      })
    );

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Espacio no encontrado o no pertenece al proyecto");
  });

  it("returns 404 when space belongs to different project", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });

    // Mock project belongs to user-1
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "project-1",
        user_id: "user-1",
      })
    );
    // Mock space belongs to different project
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "space-1",
        project_id: "project-2", // Different project!
      })
    );

    const formData = new FormData();
    formData.append(
      "file",
      new File(["content"], "test.jpg", { type: "image/jpeg" })
    );
    formData.append("projectId", "project-1");
    formData.append("spaceId", "space-1");
    formData.append("imageId", "image-1");

    const res = await POST(
      new Request("http://localhost/api/upload/space-image", {
        method: "POST",
        body: formData,
      })
    );

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Espacio no encontrado o no pertenece al proyecto");
  });

  it("returns 200 when project and space belong to user", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });

    // Mock project belongs to user-1
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "project-1",
        user_id: "user-1",
      })
    );
    // Mock space belongs to project-1
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "space-1",
        project_id: "project-1", // Same project
      })
    );

    const formData = new FormData();
    const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
    formData.append("file", file);
    formData.append("projectId", "project-1");
    formData.append("spaceId", "space-1");
    formData.append("imageId", "image-1");

    const res = await POST(
      new Request("http://localhost/api/upload/space-image", {
        method: "POST",
        body: formData,
      })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBeDefined();
  });
});
