import { describe, expect, it, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddItemDialog } from "./add-item-dialog";

const projectId = "project-usd-1";
const supplierId = "supplier-1";

const insertedProducts = vi.hoisted(() => [] as Record<string, unknown>[]);
const insertedProjectItems = vi.hoisted(() => [] as Record<string, unknown>[]);

function createQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    insert: vi.fn((rows: Record<string, unknown>[]) => {
      if (Array.isArray(rows) && rows[0]) {
        if ("project_id" in rows[0]) {
          insertedProjectItems.push(rows[0]);
        } else {
          insertedProducts.push(rows[0]);
        }
      }
      return builder;
    }),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    single: vi.fn(async () => result),
    then: (
      onFulfilled?: (value: typeof result) => unknown,
      onRejected?: (reason: unknown) => unknown
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };
  return builder;
}

const mockFrom = vi.hoisted(() => vi.fn(/* assigned below */));
const mockSupabaseClient = vi.hoisted(() => ({ from: mockFrom }));

vi.mock("@/lib/supabase", () => ({
  getSupabaseClient: () => mockSupabaseClient,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

vi.mock("@/components/auth-provider", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

vi.mock("@/components/providers/app-formatting-provider", () => ({
  useAppFormatting: () => ({
    getCurrencySymbol: (currency?: string) => (currency === "USD" ? "$" : "€"),
  }),
}));

vi.mock("@/lib/use-plan-capability", () => ({
  usePlanCapability: () => false,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("next/link", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/components/product-image-upload", () => ({
  ProductImageUpload: () => null,
}));

vi.mock("@/components/product-detail-modal", () => ({
  ProductDetailModal: () => null,
}));

vi.mock("@/components/catalog-product-select-card", () => ({
  CatalogProductSelectCard: () => null,
}));

vi.mock("./supplier-dialog", () => ({
  SupplierDialog: () => null,
}));

const mockTrackUserEvent = vi.hoisted(() => vi.fn());
vi.mock("@/app/actions/track-event", () => ({
  trackUserEvent: (...args: unknown[]) => mockTrackUserEvent(...args),
}));

describe("AddItemDialog", () => {
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
    mockFrom.mockImplementation((table: string) => {
      switch (table) {
        case "spaces":
          return createQueryBuilder({ data: [], error: null });
        case "projects":
          return createQueryBuilder({
            data: { currency: "USD" },
            error: null,
          });
        case "products": {
          const builder = createQueryBuilder({ data: [], error: null });
          builder.single = vi.fn(async () => ({
            data: { id: "new-product-id" },
            error: null,
          }));
          return builder;
        }
        case "suppliers":
          return createQueryBuilder({
            data: [{ id: supplierId, name: "Acme Studio" }],
            error: null,
          });
        case "project_items":
          return createQueryBuilder({ data: null, error: null });
        default:
          return createQueryBuilder({ data: null, error: null });
      }
    });

    vi.clearAllMocks();
    insertedProducts.length = 0;
    insertedProjectItems.length = 0;
  });

  it("persists project currency when creating a catalog product from the budget", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      <AddItemDialog
        open
        onOpenChange={vi.fn()}
        projectId={projectId}
        onSuccess={onSuccess}
      />
    );

    await screen.findByPlaceholderText("searchPlaceholder");

    await user.click(screen.getByRole("tab", { name: "tabNewProduct" }));

    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: "tabNewProduct" })
      ).toHaveAttribute("aria-selected", "true");
    });

    const nameInput = await screen.findByRole("textbox", {
      name: /productNameLabel/i,
    });
    await user.type(nameInput, "Custom USD chair");

    await user.click(screen.getByRole("combobox", { name: /supplierLabel/i }));
    await user.click(
      await screen.findByRole("option", { name: "Acme Studio" })
    );

    const unitCostInput = screen.getByRole("spinbutton", {
      name: /unitCostLabel/i,
    });
    await user.clear(unitCostInput);
    await user.type(unitCostInput, "250");

    await user.click(screen.getByRole("button", { name: "addToBudget" }));

    await waitFor(() => {
      expect(insertedProducts).toHaveLength(1);
    });

    expect(insertedProducts[0]).toMatchObject({
      name: "Custom USD chair",
      currency: "USD",
      cost_price: 250,
      user_id: "user-1",
    });
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(mockTrackUserEvent).toHaveBeenCalledWith("budget_created", {
      project_id: projectId,
      source: "manual",
      origin: "form",
    });
  });

  it("add-and-create-another keeps space/supplier/category and calls onCreated", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onCreated = vi.fn();

    mockFrom.mockImplementation((table: string) => {
      switch (table) {
        case "spaces":
          return createQueryBuilder({
            data: [{ id: "space-1", name: "Living" }],
            error: null,
          });
        case "projects":
          return createQueryBuilder({
            data: { currency: "USD", tax_rate: 21, multitax: false },
            error: null,
          });
        case "products": {
          const builder = createQueryBuilder({ data: [], error: null });
          builder.single = vi.fn(async () => ({
            data: { id: "new-product-id" },
            error: null,
          }));
          return builder;
        }
        case "suppliers":
          return createQueryBuilder({
            data: [{ id: supplierId, name: "Acme Studio" }],
            error: null,
          });
        case "project_items":
          return createQueryBuilder({ data: null, error: null });
        default:
          return createQueryBuilder({ data: null, error: null });
      }
    });

    render(
      <AddItemDialog
        open
        onOpenChange={vi.fn()}
        projectId={projectId}
        onSuccess={onSuccess}
        onCreated={onCreated}
        spaceId="space-1"
        origin="space_add"
      />
    );

    await user.click(screen.getByRole("tab", { name: "tabNewProduct" }));

    const nameInput = await screen.findByRole("textbox", {
      name: /productNameLabel/i,
    });
    await user.type(nameInput, "First chair");

    await user.click(screen.getByRole("combobox", { name: /supplierLabel/i }));
    await user.click(
      await screen.findByRole("option", { name: "Acme Studio" })
    );

    const categoryInput = screen.getByRole("textbox", {
      name: /categoryLabel/i,
    });
    await user.type(categoryInput, "furniture");

    const unitCostInput = screen.getByRole("spinbutton", {
      name: /unitCostLabel/i,
    });
    await user.clear(unitCostInput);
    await user.type(unitCostInput, "100");

    await user.click(
      screen.getByRole("button", { name: "addAndCreateAnother" })
    );

    await waitFor(() => {
      expect(insertedProjectItems.length).toBeGreaterThanOrEqual(1);
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onCreated).toHaveBeenCalledOnce();
    expect(mockTrackUserEvent).toHaveBeenCalledWith("budget_created", {
      project_id: projectId,
      source: "manual",
      origin: "repeat",
    });

    await waitFor(() => {
      expect(
        screen.getByRole("textbox", { name: /productNameLabel/i })
      ).toHaveValue("");
    });
    expect(screen.getByRole("textbox", { name: /categoryLabel/i })).toHaveValue(
      "furniture"
    );
  });

  it("duplicate initialValues prefills without saving until submit", async () => {
    render(
      <AddItemDialog
        open
        onOpenChange={vi.fn()}
        projectId={projectId}
        onSuccess={vi.fn()}
        origin="duplicate"
        initialValues={{
          name: "Dup chair",
          space_id: "space-1",
          supplier_id: supplierId,
          category: "seating",
          quantity: "3",
          unit_cost: "50",
          unit_price: "60",
          product_id: "custom",
        }}
      />
    );

    expect(await screen.findByDisplayValue("Dup chair")).toBeInTheDocument();
    expect(insertedProjectItems).toHaveLength(0);
    expect(mockTrackUserEvent).not.toHaveBeenCalled();
  });
});
