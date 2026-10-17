import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockResolveBlogLocaleSwitchPath = vi.fn();

vi.mock("@/lib/blog-data", () => ({
  resolveBlogLocaleSwitchPath: (...args: unknown[]) =>
    mockResolveBlogLocaleSwitchPath(...args),
}));

describe("GET /api/blog/locale-target", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveBlogLocaleSwitchPath.mockResolvedValue("/blog/translated-slug");
  });

  it("returns resolved path for valid /blog query", async () => {
    const { GET } = await import("./route");
    const request = new NextRequest(
      "http://localhost/api/blog/locale-target?from=en&to=es&path=/blog"
    );

    const res = await GET(request);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ path: "/blog/translated-slug" });
    expect(mockResolveBlogLocaleSwitchPath).toHaveBeenCalledWith(
      "en",
      "es",
      "/blog"
    );
  });

  it("returns resolved path for valid /blog/{slug} and prefixes path without slash", async () => {
    const { GET } = await import("./route");
    const request = new NextRequest(
      "http://localhost/api/blog/locale-target?from=es&to=en&path=blog/my-post"
    );

    const res = await GET(request);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ path: "/blog/translated-slug" });
    expect(mockResolveBlogLocaleSwitchPath).toHaveBeenCalledWith(
      "es",
      "en",
      "/blog/my-post"
    );
  });

  it("returns 400 when from locale is invalid", async () => {
    const { GET } = await import("./route");
    const request = new NextRequest(
      "http://localhost/api/blog/locale-target?from=fr&to=es&path=/blog"
    );

    const res = await GET(request);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "Invalid query" });
    expect(mockResolveBlogLocaleSwitchPath).not.toHaveBeenCalled();
  });

  it("returns 400 when to locale is invalid", async () => {
    const { GET } = await import("./route");
    const request = new NextRequest(
      "http://localhost/api/blog/locale-target?from=en&to=de&path=/blog"
    );

    const res = await GET(request);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "Invalid query" });
    expect(mockResolveBlogLocaleSwitchPath).not.toHaveBeenCalled();
  });

  it("returns 400 when path is missing", async () => {
    const { GET } = await import("./route");
    const request = new NextRequest(
      "http://localhost/api/blog/locale-target?from=en&to=es"
    );

    const res = await GET(request);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "Invalid query" });
    expect(mockResolveBlogLocaleSwitchPath).not.toHaveBeenCalled();
  });

  it("returns 400 when path is not a blog path", async () => {
    const { GET } = await import("./route");
    const request = new NextRequest(
      "http://localhost/api/blog/locale-target?from=en&to=es&path=/pricing"
    );

    const res = await GET(request);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "Invalid query" });
    expect(mockResolveBlogLocaleSwitchPath).not.toHaveBeenCalled();
  });

  it("returns 400 when path has nested segments", async () => {
    const { GET } = await import("./route");
    const request = new NextRequest(
      "http://localhost/api/blog/locale-target?from=en&to=es&path=/blog/a/b"
    );

    const res = await GET(request);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "Invalid query" });
    expect(mockResolveBlogLocaleSwitchPath).not.toHaveBeenCalled();
  });
});
