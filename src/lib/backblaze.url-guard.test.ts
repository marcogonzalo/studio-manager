import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { deleteProductImage } from "./backblaze";

describe("deleteProductImage URL guard", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.stubEnv("B2_BUCKET_NAME", "my-bucket");
    vi.stubEnv("B2_BUCKET_ID", "bucket-123");
    vi.stubEnv("B2_APPLICATION_KEY_ID", "key-id");
    vi.stubEnv("B2_APPLICATION_KEY", "key");
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("does not call fetch when host is not a real *.backblazeb2.com subdomain", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await deleteProductImage(
      "https://evil.com/file/my-bucket/https%3A%2F%2Ff003.backblazeb2.com%2Ffile%2Fmy-bucket%2Fx.webp"
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not call fetch for look-alike host backblazeb2.com.evil.com", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await deleteProductImage(
      "https://f003.backblazeb2.com.evil.com/file/my-bucket/x.webp"
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not call fetch when scheme is not https", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await deleteProductImage(
      "http://f003.backblazeb2.com/file/my-bucket/x.webp"
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not call fetch when bucket in path does not match env", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await deleteProductImage(
      "https://f003.backblazeb2.com/file/other-bucket/x.webp"
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
