import { describe, expect, it, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { PurchaseOrderDialog } from "./purchase-order-dialog";

const projectId = "project-1";
const supplierId = "supplier-1";
const itemId = "item-1";

const mockRpc = vi.hoisted(() =>
  vi.fn(async () => ({ data: { id: "po-new" }, error: null }))
);

function createQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    neq: vi.fn(() => builder),
    in: vi.fn(() => builder),
    order: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => result),
    single: vi.fn(async () => result),
    then: (
      onFulfilled?: (value: typeof result) => unknown,
      onRejected?: (reason: unknown) => unknown
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };
  return builder;
}

const mockFrom = vi.hoisted(() => vi.fn());
const mockSupabaseClient = vi.hoisted(() => ({
  from: mockFrom,
  rpc: mockRpc,
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseClient: () => mockSupabaseClient,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: { count?: number }) =>
    values?.count !== undefined ? `${key}:${values.count}` : key,
  useLocale: () => "en",
}));

vi.mock("@/components/auth-provider", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/price-tbd-pill", () => ({
  ItemPriceOrTbd: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("PurchaseOrderDialog", () => {
  beforeAll(() => {
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);

    if (!HTMLElement.prototype.hasPointerCapture) {
      HTMLElement.prototype.hasPointerCapture = () => false;
    }
    if (!HTMLElement.prototype.setPointerCapture) {
      HTMLElement.prototype.setPointerCapture = () => undefined;
    }
    if (!HTMLElement.prototype.releasePointerCapture) {
      HTMLElement.prototype.releasePointerCapture = () => undefined;
    }
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockRpc.mockResolvedValue({ data: { id: "po-new" }, error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === "project_items") {
        return createQueryBuilder({
          data: [
            {
              id: itemId,
              name: "Chair",
              quantity: 1,
              unit_cost: 100,
              status: "pending",
              purchase_order_id: null,
              is_excluded: false,
              product: {
                supplier_id: supplierId,
                supplier: {
                  id: supplierId,
                  name: "Acme Studio",
                  user_id: "user-1",
                },
              },
            },
          ],
          error: null,
        });
      }
      if (table === "purchase_orders") {
        return createQueryBuilder({ data: [], error: null });
      }
      if (table === "suppliers") {
        return createQueryBuilder({
          data: { id: supplierId, name: "Acme Studio", user_id: "user-1" },
          error: null,
        });
      }
      return createQueryBuilder({ data: null, error: null });
    });
  });

  it("shows cancelled-order UI and does not render the edit form", () => {
    render(
      <PurchaseOrderDialog
        open
        onOpenChange={vi.fn()}
        projectId={projectId}
        onSuccess={vi.fn()}
        order={{
          id: "po-1",
          supplier_id: supplierId,
          order_number: "PO-CANCELLED",
          order_date: "2026-01-01",
          status: "cancelled",
          notes: null,
        }}
      />
    );

    expect(screen.getByText("cancelledOrderTitle")).toBeInTheDocument();
    expect(screen.getByText("cancelledOrderDescription")).toBeInTheDocument();
    expect(screen.queryByText("titleEdit")).not.toBeInTheDocument();
  });

  async function selectSupplierAndItem(
    user: ReturnType<typeof userEvent.setup>
  ) {
    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("project_items");
    });

    const supplierTrigger = await screen.findByRole("combobox", {
      name: /supplierLabel/i,
    });
    await user.click(supplierTrigger);
    await user.click(
      await screen.findByRole("option", { name: "Acme Studio" })
    );

    await waitFor(() => {
      expect(screen.getByText("Chair")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("checkbox"));
  }

  it("calls save_purchase_order_with_items on create success", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <PurchaseOrderDialog
        open
        onOpenChange={onOpenChange}
        projectId={projectId}
        onSuccess={onSuccess}
      />
    );

    await selectSupplierAndItem(user);
    await user.click(screen.getByRole("button", { name: "createOrder" }));

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith(
        "save_purchase_order_with_items",
        expect.objectContaining({
          p_project_id: projectId,
          p_purchase_order_id: null,
          p_supplier_id: supplierId,
          p_order_number: expect.stringMatching(/^PO-/),
          p_status: "draft",
          p_item_ids: [itemId],
        })
      );
    });

    expect(toast.success).toHaveBeenCalledWith("toastCreated");
    expect(onSuccess).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("locks the supplier when editing an existing order", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      <PurchaseOrderDialog
        open
        onOpenChange={vi.fn()}
        projectId={projectId}
        onSuccess={onSuccess}
        order={{
          id: "po-1",
          supplier_id: supplierId,
          order_number: "PO-100",
          order_date: "2026-01-01",
          status: "draft",
          notes: null,
          project_items: [{ id: itemId }],
        }}
      />
    );

    const supplierTrigger = await screen.findByRole("combobox", {
      name: /supplierLabel/i,
    });
    expect(supplierTrigger).toBeDisabled();
    expect(
      screen.getByRole("textbox", { name: /^orderNumberLabel/ })
    ).toBeDisabled();
    expect(screen.getByLabelText(/^dateLabel/)).toBeDisabled();
    expect(screen.getByText("lockedFieldsHint")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Chair")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "updateOrder" }));

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith(
        "save_purchase_order_with_items",
        expect.objectContaining({
          p_purchase_order_id: "po-1",
          p_supplier_id: supplierId,
          p_order_number: "PO-100",
          p_order_date: "2026-01-01",
          p_item_ids: [itemId],
        })
      );
    });
  });

  it("does not toast success when rpc returns an error", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();
    mockRpc.mockResolvedValue({
      data: null,
      error: new Error("rpc failed"),
    });

    render(
      <PurchaseOrderDialog
        open
        onOpenChange={onOpenChange}
        projectId={projectId}
        onSuccess={onSuccess}
      />
    );

    await selectSupplierAndItem(user);
    await user.click(screen.getByRole("button", { name: "createOrder" }));

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("rpc failed");
    });

    expect(toast.success).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
