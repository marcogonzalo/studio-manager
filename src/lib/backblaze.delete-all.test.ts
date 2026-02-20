import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { deleteAllFilesForUser } from "./backblaze";

const authResponse = {
  authorizationToken: "auth-token",
  apiUrl: "https://api.example.com",
  downloadUrl: "https://download.example.com",
};

describe("deleteAllFilesForUser", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.stubEnv("B2_APPLICATION_KEY_ID", "key-id");
    vi.stubEnv("B2_APPLICATION_KEY", "key");
    vi.stubEnv("B2_BUCKET_ID", "bucket-123");
    vi.stubEnv("B2_BUCKET_NAME", "bucket-name");
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllEnvs();
  });

  it("completes without calling delete when no files", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(authResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ files: [], nextFileName: null }),
      });

    vi.stubGlobal("fetch", fetchMock);

    await deleteAllFilesForUser("user-1");

    expect(fetchMock).toHaveBeenCalledTimes(2); // authorize + list
    const listCall = fetchMock.mock.calls[1];
    expect(listCall[0]).toContain("b2_list_file_names");
    expect(JSON.parse(listCall[1].body).prefix).toBe("assets/user-1/");
  });

  it("calls delete for each file returned by list", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(authResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            files: [
              { fileId: "f1", fileName: "assets/user-2/catalog/x.webp" },
              { fileId: "f2", fileName: "assets/user-2/projects/p1/img/y.webp" },
            ],
            nextFileName: null,
          }),
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true });

    vi.stubGlobal("fetch", fetchMock);

    await deleteAllFilesForUser("user-2");

    expect(fetchMock).toHaveBeenCalledTimes(4); // authorize, list, delete, delete
    const deleteCalls = fetchMock.mock.calls.slice(2);
    expect(deleteCalls[0][0]).toContain("b2_delete_file_version");
    expect(JSON.parse(deleteCalls[0][1].body)).toEqual({
      fileId: "f1",
      fileName: "assets/user-2/catalog/x.webp",
    });
    expect(JSON.parse(deleteCalls[1][1].body)).toEqual({
      fileId: "f2",
      fileName: "assets/user-2/projects/p1/img/y.webp",
    });
  });

  it("throws when B2_BUCKET_ID is missing", async () => {
    const bucketId = process.env.B2_BUCKET_ID;
    delete process.env.B2_BUCKET_ID;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(authResponse),
    }));

    await expect(deleteAllFilesForUser("user-1")).rejects.toThrow(
      "B2_BUCKET_ID es requerido"
    );

    if (bucketId !== undefined) process.env.B2_BUCKET_ID = bucketId;
  });
});
