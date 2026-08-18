import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteSpaceImage } from "./delete-space-image";

function createSupabase(error: unknown = null) {
  const eq = vi.fn().mockResolvedValue({ error });
  const from = vi.fn().mockReturnValue({
    delete: () => ({ eq }),
  });
  return { from, eq };
}

describe("deleteSpaceImage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deletes via upload API when url is present", async () => {
    const supabase = createSupabase();
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    const result = await deleteSpaceImage({
      id: "img-1",
      url: "https://b2.example.com/render.webp",
      supabase,
      fetchImpl,
    });

    expect(result).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/upload/product-image?url=https%3A%2F%2Fb2.example.com%2Frender.webp",
      { method: "DELETE" }
    );
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("returns API error payload when delete request fails", async () => {
    const supabase = createSupabase();
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        code: "DEMO_ACCOUNT_READ_ONLY",
        message: "Demo blocked",
      }),
    });

    const result = await deleteSpaceImage({
      id: "img-1",
      url: "https://b2.example.com/render.webp",
      supabase,
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual({
        code: "DEMO_ACCOUNT_READ_ONLY",
        message: "Demo blocked",
      });
    }
  });

  it("returns thrown fetch error", async () => {
    const supabase = createSupabase();
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network"));

    const result = await deleteSpaceImage({
      id: "img-1",
      url: "https://b2.example.com/render.webp",
      supabase,
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toEqual(new Error("network"));
  });

  it("deletes db row when url is empty", async () => {
    const supabase = createSupabase();

    const result = await deleteSpaceImage({
      id: "img-2",
      url: "  ",
      supabase,
    });

    expect(result).toEqual({ ok: true });
    expect(supabase.from).toHaveBeenCalledWith("space_images");
    expect(supabase.eq).toHaveBeenCalledWith("id", "img-2");
  });

  it("returns supabase error when row delete fails", async () => {
    const dbError = { message: "permission denied" };
    const supabase = createSupabase(dbError);

    const result = await deleteSpaceImage({
      id: "img-3",
      url: "",
      supabase,
    });

    expect(result).toEqual({ ok: false, error: dbError });
  });
});
