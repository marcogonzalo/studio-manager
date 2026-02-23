import { describe, expect, it, vi } from "vitest";
import { createAsset, deleteAssetById, getAssetIdByOwner } from "./assets";
import type { SupabaseClient } from "@supabase/supabase-js";

function makeInsertChain(
  singlePromise: Promise<{
    data: { id?: string } | null;
    error: { message: string } | null;
  }>
) {
  return {
    insert: vi.fn().mockReturnValue({
      select: vi
        .fn()
        .mockReturnValue({ single: vi.fn().mockReturnValue(singlePromise) }),
    }),
  };
}

function makeDeleteChain(
  eqPromise: Promise<{ error: { message: string } | null }>
) {
  const eqFn = vi.fn().mockReturnValue(eqPromise);
  return {
    delete: vi.fn().mockReturnValue({ eq: eqFn }),
    _eq: eqFn,
  };
}

function makeGetByIdChain(
  maybeSinglePromise: Promise<{
    data: { id: string } | null;
    error: { message: string } | null;
  }>
) {
  const eq2 = vi.fn().mockReturnValue({
    maybeSingle: vi.fn().mockReturnValue(maybeSinglePromise),
  });
  const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
  return {
    select: vi.fn().mockReturnValue({ eq: eq1 }),
    _eq1: eq1,
    _eq2: eq2,
  };
}

describe("createAsset", () => {
  it("inserts with correct payload and returns id", async () => {
    const id = "asset-uuid-1";
    const singleRes = Promise.resolve({ data: { id }, error: null });
    const chain = makeInsertChain(singleRes);
    const supabase = { from: vi.fn(() => chain) } as unknown as SupabaseClient;

    const result = await createAsset(supabase, {
      userId: "user-1",
      source: "b2",
      url: "https://b2.example.com/file/bucket/path.webp",
      storagePath: "assets/user1/catalog/p1.webp",
      bytes: 1024,
      mimeType: "image/webp",
      kind: "product_image",
      ownerTable: "products",
      ownerId: "product-1",
    });

    expect(result).toBe(id);
    expect(supabase.from).toHaveBeenCalledWith("assets");
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        source: "b2",
        url: "https://b2.example.com/file/bucket/path.webp",
        storage_path: "assets/user1/catalog/p1.webp",
        bytes: 1024,
        mime_type: "image/webp",
        kind: "product_image",
        owner_table: "products",
        owner_id: "product-1",
      })
    );
  });

  it("allows null storagePath and bytes", async () => {
    const singleRes = Promise.resolve({ data: { id: "a2" }, error: null });
    const chain = makeInsertChain(singleRes);
    const supabase = { from: vi.fn(() => chain) } as unknown as SupabaseClient;

    await createAsset(supabase, {
      userId: "user-2",
      source: "external",
      url: "https://example.com/image.jpg",
      kind: "space_image",
      ownerTable: "space_images",
      ownerId: "img-1",
    });

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        storage_path: null,
        bytes: null,
      })
    );
  });

  it("throws when insert returns error", async () => {
    const singleRes = Promise.resolve({
      data: null,
      error: { message: "Constraint violation" },
    });
    const chain = makeInsertChain(singleRes);
    const supabase = { from: vi.fn(() => chain) } as unknown as SupabaseClient;

    await expect(
      createAsset(supabase, {
        userId: "user-1",
        source: "b2",
        url: "https://x.com/f",
        kind: "document",
        ownerTable: "project_documents",
        ownerId: "doc-1",
      })
    ).rejects.toMatchObject({ message: "Constraint violation" });
  });

  it("throws when insert returns no id", async () => {
    const singleRes = Promise.resolve({ data: {}, error: null });
    const chain = makeInsertChain(singleRes);
    const supabase = { from: vi.fn(() => chain) } as unknown as SupabaseClient;

    await expect(
      createAsset(supabase, {
        userId: "user-1",
        source: "b2",
        url: "https://x.com/f",
        kind: "product_image",
        ownerTable: "products",
        ownerId: "p1",
      })
    ).rejects.toThrow("Asset insert did not return id");
  });
});

describe("deleteAssetById", () => {
  it("calls delete with asset id", async () => {
    const eqRes = Promise.resolve({ error: null });
    const chain = makeDeleteChain(eqRes);
    const supabase = { from: vi.fn(() => chain) } as unknown as SupabaseClient;

    await deleteAssetById(supabase, "asset-to-delete");

    expect(supabase.from).toHaveBeenCalledWith("assets");
    expect(chain.delete).toHaveBeenCalled();
    expect(chain._eq).toHaveBeenCalledWith("id", "asset-to-delete");
  });

  it("throws when delete returns error", async () => {
    const eqRes = Promise.resolve({ error: { message: "Not found" } });
    const chain = makeDeleteChain(eqRes);
    const supabase = { from: vi.fn(() => chain) } as unknown as SupabaseClient;

    await expect(deleteAssetById(supabase, "missing")).rejects.toMatchObject({
      message: "Not found",
    });
  });
});

describe("getAssetIdByOwner", () => {
  it("returns id when asset exists", async () => {
    const maybeSingleRes = Promise.resolve({
      data: { id: "found-asset-id" },
      error: null,
    });
    const chain = makeGetByIdChain(maybeSingleRes);
    const supabase = { from: vi.fn(() => chain) } as unknown as SupabaseClient;

    const result = await getAssetIdByOwner(supabase, "products", "product-99");

    expect(result).toBe("found-asset-id");
    expect(supabase.from).toHaveBeenCalledWith("assets");
    expect(chain._eq1).toHaveBeenCalledWith("owner_table", "products");
    expect(chain._eq2).toHaveBeenCalledWith("owner_id", "product-99");
  });

  it("returns null when no asset", async () => {
    const maybeSingleRes = Promise.resolve({ data: null, error: null });
    const chain = makeGetByIdChain(maybeSingleRes);
    const supabase = { from: vi.fn(() => chain) } as unknown as SupabaseClient;

    const result = await getAssetIdByOwner(supabase, "space_images", "img-x");

    expect(result).toBeNull();
  });

  it("throws when query returns error", async () => {
    const maybeSingleRes = Promise.resolve({
      data: null,
      error: { message: "DB error" },
    });
    const chain = makeGetByIdChain(maybeSingleRes);
    const supabase = { from: vi.fn(() => chain) } as unknown as SupabaseClient;

    await expect(
      getAssetIdByOwner(supabase, "project_documents", "doc-1")
    ).rejects.toMatchObject({ message: "DB error" });
  });
});
