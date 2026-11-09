import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectBudget } from "./project-budget";

const lastAddItemDialogProps = vi.hoisted(() => ({
  current: null as Record<string, unknown> | null,
}));

function createQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    single: vi.fn(async () => result),
    then: (
      onFulfilled?: (value: typeof result) => unknown,
      onRejected?: (reason: unknown) => unknown
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };
  return builder;
}

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase", () => ({
  getSupabaseClient: () => ({ from: mockFrom }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "es",
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/veta-app/projects/p1",
}));

vi.mock("@/components/auth-provider", () => ({
  useAuth: () => ({
    user: { id: "u1" },
    effectivePlan: { config: { pdf_export_mode: "full" } },
  }),
}));

vi.mock("@/components/providers/app-formatting-provider", () => ({
  useAppFormatting: () => ({
    formatCurrency: (val: number) => `${val} €`,
    lang: "es",
  }),
}));

vi.mock("@/lib/use-plan-capability", () => ({
  usePlanCapability: () => true,
}));

vi.mock("@/lib/use-project-budget-lines", () => ({
  useProjectBudgetLines: () => ({
    budgetLines: [],
    refetch: vi.fn(async () => undefined),
  }),
}));

vi.mock("@/lib/use-project-labels", () => ({
  usePhaseLabel: () => (phase: string) => phase,
}));

vi.mock("@/components/onboarding/use-onboarding-highlight", () => ({
  useOnboardingHighlight: () => undefined,
}));

vi.mock("@/components/dialogs/add-item-dialog", () => ({
  AddItemDialog: (props: Record<string, unknown>) => {
    lastAddItemDialogProps.current = props;
    return null;
  },
}));

vi.mock("@/components/dialogs/budget-line-dialog", () => ({
  BudgetLineDialog: () => null,
}));

vi.mock("@/components/product-detail-modal", () => ({
  ProductDetailModal: () => null,
}));

vi.mock("@/components/dialogs/budget-print-options-dialog", () => ({
  BudgetPrintOptionsDialog: () => null,
}));

vi.mock("@/components/dialogs/budget-customize-dialog", () => ({
  BudgetCustomizeDialog: () => null,
}));

vi.mock("@/components/dialogs/confirm-delete-dialog", () => ({
  ConfirmDeleteDialog: () => null,
}));

describe("ProjectBudget product grouping (#116)", () => {
  beforeEach(() => {
    lastAddItemDialogProps.current = null;
    mockFrom.mockImplementation((table: string) => {
      switch (table) {
        case "projects":
          return createQueryBuilder({
            data: {
              id: "p1",
              name: "Proyecto Test",
              currency: "EUR",
              tax_rate: 21,
            },
            error: null,
          });
        case "project_items":
          return createQueryBuilder({
            data: [
              {
                id: "item-1",
                name: "Lámpara Tolomeo",
                description: "",
                space_id: "space-salon",
                product_id: "prod-1",
                space: { name: "Salón", created_at: "2026-01-01T00:00:00Z" },
                quantity: 2,
                unit_cost: 100,
                markup: 20,
                unit_price: 120,
                status: "pending",
                image_url: "",
                created_at: "2026-01-01T00:00:00Z",
                product: {
                  name: "Lámpara Tolomeo",
                  supplier_id: "sup-artemide",
                  supplier: { id: "sup-artemide", name: "Artemide" },
                },
              },
              {
                id: "item-2",
                name: "Mesa a medida",
                description: "",
                space_id: null,
                product_id: null,
                quantity: 1,
                unit_cost: 500,
                markup: 10,
                unit_price: 550,
                status: "pending",
                image_url: "",
                created_at: "2026-01-02T00:00:00Z",
                product: undefined,
              },
            ],
            error: null,
          });
        case "spaces":
          return createQueryBuilder({
            data: [{ id: "space-salon", name: "Salón" }],
            error: null,
          });
        default:
          return createQueryBuilder({ data: [], error: null });
      }
    });
  });

  it("groups products by space by default and switches to supplier grouping with supplierId quick-add", async () => {
    const user = userEvent.setup();
    render(<ProjectBudget projectId="p1" />);

    await waitFor(() => {
      expect(screen.getByText("Salón")).toBeInTheDocument();
    });

    // Default grouping: Space ("Salón" and "spaceGeneral"), row shows supplier "Artemide"
    expect(screen.getByText("Artemide")).toBeInTheDocument();

    const addSpaceButtons = screen.getAllByRole("button", {
      name: "addToSpaceAria",
    });
    await user.click(addSpaceButtons[0]);
    expect(lastAddItemDialogProps.current).toMatchObject({
      open: true,
      spaceId: "space-salon",
      supplierId: undefined,
    });

    // Switch grouping to Supplier
    await user.click(screen.getByRole("tab", { name: "groupBySupplier" }));

    // Now headers are "Artemide" and "supplierUnassigned", and row subtitle shows space "Salón"
    expect(screen.getByText("supplierUnassigned")).toBeInTheDocument();
    expect(screen.getByText("Salón")).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "groupBySupplier" })
    ).toHaveAttribute("data-state", "active");

    const addSupplierButtons = screen.getAllByRole("button", {
      name: "addToSupplierAria",
    });
    await user.click(addSupplierButtons[0]);
    expect(lastAddItemDialogProps.current).toMatchObject({
      open: true,
      spaceId: undefined,
      supplierId: "sup-artemide",
    });
  }, 20_000);
});
