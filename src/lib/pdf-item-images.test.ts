import { describe, expect, it, vi } from "vitest";
import {
  attachPdfItemThumbnails,
  fetchImageAsDataUrl,
  nextImageOptimizerUrl,
} from "./pdf-item-images";
import type { ProjectItem } from "@/types";

function imageResponse(type = "image/webp") {
  return {
    ok: true,
    blob: async () => new Blob([new Uint8Array([1, 2, 3, 4])], { type }),
  };
}

function item(overrides: Partial<ProjectItem> = {}): ProjectItem {
  return {
    id: "item-1",
    name: "Chair",
    description: "",
    space_id: null,
    product_id: "prod-1",
    quantity: 1,
    unit_cost: 10,
    markup: 20,
    unit_price: 12,
    status: "pending",
    image_url: "",
    ...overrides,
  };
}

describe("nextImageOptimizerUrl", () => {
  it("builds a same-origin optimizer URL", () => {
    expect(
      nextImageOptimizerUrl(
        "https://f003.backblazeb2.com/file/bucket/x.webp",
        "http://localhost:3000"
      )
    ).toBe(
      "http://localhost:3000/_next/image?url=https%3A%2F%2Ff003.backblazeb2.com%2Ffile%2Fbucket%2Fx.webp&w=64&q=75"
    );
  });
});

describe("fetchImageAsDataUrl", () => {
  it("returns an existing data URL unchanged", async () => {
    const data = "data:image/png;base64,AAAA";
    await expect(fetchImageAsDataUrl(data, vi.fn())).resolves.toBe(data);
  });

  it("returns null for empty or unsafe URLs", async () => {
    const fetchImpl = vi.fn();
    await expect(fetchImageAsDataUrl("", fetchImpl)).resolves.toBeNull();
    await expect(fetchImageAsDataUrl("  ", fetchImpl)).resolves.toBeNull();
    await expect(
      fetchImageAsDataUrl("javascript:alert(1)", fetchImpl)
    ).resolves.toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("converts a fetched image blob to a data URL", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(imageResponse());
    const result = await fetchImageAsDataUrl(
      "https://cdn.example.com/chair.webp",
      fetchImpl,
      "http://localhost:3000"
    );
    expect(result).toMatch(/^data:image\/webp;base64,/);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("falls back to the Next image optimizer when the remote fetch fails", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error("CORS"))
      .mockResolvedValueOnce(imageResponse("image/jpeg"));
    const result = await fetchImageAsDataUrl(
      "https://cdn.example.com/chair.webp",
      fetchImpl,
      "http://localhost:3000"
    );
    expect(result).toMatch(/^data:image\/jpeg;base64,/);
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      nextImageOptimizerUrl(
        "https://cdn.example.com/chair.webp",
        "http://localhost:3000"
      )
    );
  });

  it("returns null when every fetch fails", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("down"));
    await expect(
      fetchImageAsDataUrl(
        "https://cdn.example.com/missing.webp",
        fetchImpl,
        "http://localhost:3000"
      )
    ).resolves.toBeNull();
  });
});

describe("attachPdfItemThumbnails", () => {
  it("uses the catalog image when the line has none", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(imageResponse());
    const [out] = await attachPdfItemThumbnails(
      [
        item({
          image_url: "",
          product: { image_url: "https://cdn.example.com/chair.webp" },
        }),
      ],
      fetchImpl,
      "http://localhost:3000"
    );
    expect(out.image_url).toMatch(/^data:image\/webp;base64,/);
  });

  it("prefers the line image over the catalog image", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(imageResponse());
    await attachPdfItemThumbnails(
      [
        item({
          image_url: "https://cdn.example.com/line.webp",
          product: { image_url: "https://cdn.example.com/catalog.webp" },
        }),
      ],
      fetchImpl,
      "http://localhost:3000"
    );
    expect(fetchImpl).toHaveBeenCalledWith("https://cdn.example.com/line.webp");
  });

  it("reuses one fetch when several lines share the same URL", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(imageResponse());
    const shared = "https://cdn.example.com/shared.webp";
    await attachPdfItemThumbnails(
      [
        item({ id: "a", image_url: shared }),
        item({ id: "b", image_url: shared }),
      ],
      fetchImpl,
      "http://localhost:3000"
    );
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("leaves image_url empty when there is no image", async () => {
    const fetchImpl = vi.fn();
    const [out] = await attachPdfItemThumbnails(
      [item({ image_url: "" })],
      fetchImpl
    );
    expect(out.image_url).toBe("");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
