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
const mockUploadDocument = vi.fn(() =>
  Promise.resolve({
    url: "https://b2.example.com/file.pdf",
    storagePath: "assets/user1/projects/proj1/doc/doc1.pdf",
  })
);

vi.mock("@/lib/backblaze", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/backblaze")>("@/lib/backblaze");
  return {
    ...actual,
    deleteProductImage: mockDeleteProductImage,
    uploadDocument: mockUploadDocument,
  };
});

vi.mock("@/lib/document-validation", () => ({
  validateDocumentFile: vi.fn(() => ({ valid: true })),
  getExtensionFromMime: vi.fn(() => ".pdf"),
  getExtensionFromFileName: vi.fn(() => ".pdf"),
}));

vi.mock("@/lib/storage-limit", () => ({
  checkStorageLimit: vi.fn(() => Promise.resolve({ allowed: true })),
}));

vi.mock("@/lib/assets", () => ({
  createAsset: vi.fn(() => Promise.resolve("asset-doc-123")),
  deleteAssetById: vi.fn(() => Promise.resolve()),
  getAssetIdByOwner: vi.fn(() => Promise.resolve(null)),
}));

const mockGetSupabaseUrl = vi.fn(() => "https://test.supabase.co");
const mockGetServerKey = vi.fn(() => "server-key");

vi.mock("@/lib/supabase/keys", () => ({
  getSupabaseUrl: () => mockGetSupabaseUrl(),
  getSupabaseServerKey: () => mockGetServerKey(),
  getSupabaseServiceRoleKey: () => undefined,
}));

function createMockChain(data: unknown, error: unknown = null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
  };
  return chain;
}

// Helper to create a chain that returns data on single() call
function createMockChainWithData(data: unknown) {
  return createMockChain(data, null);
}

// Helper to create a chain that returns error on single() call
function createMockChainWithError(error: unknown) {
  return createMockChain(null, error);
}

describe("DELETE /api/upload/document", () => {
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
        "http://localhost/api/upload/document?url=https://b2.example.com/file.pdf"
      )
    );

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("No autorizado");
  });

  it("returns 400 when url parameter is missing", async () => {
    const { DELETE } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });

    const res = await DELETE(
      new Request("http://localhost/api/upload/document")
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Falta el parámetro url");
  });

  it("returns 404 when document does not exist", async () => {
    const { DELETE } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });

    // First call: project_documents (not found)
    mockFrom.mockReturnValueOnce(
      createMockChainWithError(new Error("Not found"))
    );

    const res = await DELETE(
      new Request(
        "http://localhost/api/upload/document?url=https://b2.example.com/file.pdf"
      )
    );

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Documento no encontrado");
  });

  it("returns 403 when document belongs to another user", async () => {
    const { DELETE } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });

    // First call: project_documents (document exists)
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "doc-1",
        project_id: "project-1",
      })
    );

    // Second call: projects (belongs to user-2)
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "project-1",
        user_id: "user-2", // Different user!
      })
    );

    const res = await DELETE(
      new Request(
        "http://localhost/api/upload/document?url=https://b2.example.com/file.pdf"
      )
    );

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("No autorizado para eliminar este documento");
  });

  it("returns 200 when document belongs to user", async () => {
    const { DELETE } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });

    // First call: project_documents (document exists)
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "doc-1",
        project_id: "project-1",
      })
    );

    // Second call: projects (belongs to user-1)
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "project-1",
        user_id: "user-1", // Same user
      })
    );

    // Ensure deleteProductImage mock is set up
    mockDeleteProductImage.mockResolvedValue(undefined);

    const res = await DELETE(
      new Request(
        "http://localhost/api/upload/document?url=https://b2.example.com/file.pdf"
      )
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });
});

describe("POST /api/upload/document", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUploadDocument.mockResolvedValue({
      url: "https://b2.example.com/file.pdf",
      storagePath: "assets/user1/projects/proj1/doc/doc1.pdf",
    });
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
      new File(["content"], "test.pdf", { type: "application/pdf" })
    );
    formData.append("documentId", "doc-1");
    formData.append("projectId", "project-1");

    const res = await POST(
      new Request("http://localhost/api/upload/document", {
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
      new File(["content"], "test.pdf", { type: "application/pdf" })
    );
    formData.append("documentId", "doc-1");
    formData.append("projectId", "project-1");

    const res = await POST(
      new Request("http://localhost/api/upload/document", {
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
      new File(["content"], "test.pdf", { type: "application/pdf" })
    );
    formData.append("documentId", "doc-1");
    formData.append("projectId", "project-1");

    const res = await POST(
      new Request("http://localhost/api/upload/document", {
        method: "POST",
        body: formData,
      })
    );

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe(
      "No autorizado para subir documentos a este proyecto"
    );
  });

  it("returns 200 when project belongs to user", async () => {
    const { POST } = await import("./route");
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
      error: null,
    });

    // Mock project belongs to user-1
    mockFrom.mockReturnValueOnce(
      createMockChainWithData({
        id: "project-1",
        user_id: "user-1", // Same user
      })
    );

    const formData = new FormData();
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });
    formData.append("file", file);
    formData.append("documentId", "doc-1");
    formData.append("projectId", "project-1");

    const res = await POST(
      new Request("http://localhost/api/upload/document", {
        method: "POST",
        body: formData,
      })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBeDefined();
    expect(json.fileSizeBytes).toBeDefined();
    expect(typeof json.assetId === "string" || json.assetId === undefined).toBe(
      true
    );
  });
});
