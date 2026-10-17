import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useSuppliers } from "./use-suppliers";

type QueryResult = { data: unknown; error: unknown };

const mockFrom = vi.hoisted(() => vi.fn());
const mockClient = vi.hoisted(() => ({ from: mockFrom }));

vi.mock("@/lib/supabase", () => ({
  getSupabaseClient: () => mockClient,
}));

function mockSuppliersQuery(result: Promise<QueryResult>) {
  const query: Record<string, unknown> = {
    select: vi.fn(() => query),
    order: vi.fn(() => query),
    then: (
      onFulfilled?: (value: QueryResult) => unknown,
      onRejected?: (reason: unknown) => unknown
    ) => result.then(onFulfilled, onRejected),
  };
  mockFrom.mockReturnValue(query);
  return query;
}

const sampleSupplier = {
  id: "sup-1",
  name: "Acme",
  contact_name: "Ada",
  email: "ada@acme.test",
  phone: "555",
  website: "https://acme.test",
};

describe("useSuppliers", () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it("loads suppliers ordered by name with explicit columns", async () => {
    const query = mockSuppliersQuery(
      Promise.resolve({ data: [sampleSupplier], error: null })
    );

    const { result } = renderHook(() => useSuppliers({ enabled: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFrom).toHaveBeenCalledWith("suppliers");
    expect(query.select).toHaveBeenCalledWith(
      "id, name, contact_name, email, phone, website"
    );
    expect(query.order).toHaveBeenCalledWith("name");
    expect(result.current.suppliers).toEqual([sampleSupplier]);
    expect(result.current.error).toBeNull();
  });

  it("returns an empty list when there are no suppliers", async () => {
    mockSuppliersQuery(Promise.resolve({ data: [], error: null }));

    const { result } = renderHook(() => useSuppliers({ enabled: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.suppliers).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("exposes an error and clears suppliers on fetch failure", async () => {
    mockSuppliersQuery(
      Promise.resolve({
        data: null,
        error: { message: "permission denied" },
      })
    );

    const { result } = renderHook(() => useSuppliers({ enabled: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.suppliers).toEqual([]);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("permission denied");
  });

  it("does not fetch when enabled is false", () => {
    mockSuppliersQuery(Promise.resolve({ data: [], error: null }));

    const { result } = renderHook(() => useSuppliers({ enabled: false }));

    expect(mockFrom).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.suppliers).toEqual([]);
  });

  it("refetch reloads suppliers", async () => {
    mockSuppliersQuery(Promise.resolve({ data: [], error: null }));

    const { result } = renderHook(() => useSuppliers({ enabled: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockSuppliersQuery(
      Promise.resolve({ data: [sampleSupplier], error: null })
    );

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.suppliers).toEqual([sampleSupplier]);
  });
});
