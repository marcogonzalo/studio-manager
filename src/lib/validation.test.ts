import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  canDeleteSupplier,
  canDeleteProduct,
  canDeleteClient,
} from "./validation";

type SupabaseResponse = { data: unknown[] | null; error: Error | null };

let responseQueue: SupabaseResponse[] = [];

const createChain = () => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        limit: () =>
          Promise.resolve(responseQueue.shift() ?? { data: [], error: null }),
      }),
    }),
  }),
});

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseClient: () => createChain(),
}));

describe("canDeleteSupplier", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    responseQueue = [];
  });

  it("should return true when supplier has no products and no purchase orders", async () => {
    responseQueue = [
      { data: [], error: null },
      { data: [], error: null },
    ];
    const result = await canDeleteSupplier("supplier-1");
    expect(result).toBe(true);
  });

  it("should return false when supplier has products", async () => {
    responseQueue = [{ data: [{ id: "product-1" }], error: null }];
    const result = await canDeleteSupplier("supplier-1");
    expect(result).toBe(false);
  });

  it("should return false when supplier has purchase orders", async () => {
    responseQueue = [
      { data: [], error: null },
      { data: [{ id: "po-1" }], error: null },
    ];
    const result = await canDeleteSupplier("supplier-1");
    expect(result).toBe(false);
  });

  it("should return false on products query error", async () => {
    responseQueue = [{ data: null, error: new Error("DB error") }];
    const result = await canDeleteSupplier("supplier-1");
    expect(result).toBe(false);
  });

  it("should return false on purchase_orders query error", async () => {
    responseQueue = [
      { data: [], error: null },
      { data: null, error: new Error("DB error") },
    ];
    const result = await canDeleteSupplier("supplier-1");
    expect(result).toBe(false);
  });
});

describe("canDeleteProduct", () => {
  beforeEach(() => {
    responseQueue = [];
  });

  it("should return true when product has no project_items", async () => {
    responseQueue = [{ data: [], error: null }];
    const result = await canDeleteProduct("product-1");
    expect(result).toBe(true);
  });

  it("should return false when product has project_items", async () => {
    responseQueue = [{ data: [{ id: "item-1" }], error: null }];
    const result = await canDeleteProduct("product-1");
    expect(result).toBe(false);
  });

  it("should return false on query error", async () => {
    responseQueue = [{ data: null, error: new Error("DB error") }];
    const result = await canDeleteProduct("product-1");
    expect(result).toBe(false);
  });
});

describe("canDeleteClient", () => {
  beforeEach(() => {
    responseQueue = [];
  });

  it("should return true when client has no projects", async () => {
    responseQueue = [{ data: [], error: null }];
    const result = await canDeleteClient("client-1");
    expect(result).toBe(true);
  });

  it("should return false when client has projects", async () => {
    responseQueue = [{ data: [{ id: "project-1" }], error: null }];
    const result = await canDeleteClient("client-1");
    expect(result).toBe(false);
  });

  it("should return false on query error", async () => {
    responseQueue = [{ data: null, error: new Error("DB error") }];
    const result = await canDeleteClient("client-1");
    expect(result).toBe(false);
  });
});
