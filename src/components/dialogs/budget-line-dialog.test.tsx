import { describe, expect, it, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BudgetLineDialog } from "./budget-line-dialog";

const insertedLines = vi.hoisted(() => [] as Record<string, unknown>[]);

function createQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    insert: vi.fn((rows: Record<string, unknown>[]) => {
      if (Array.isArray(rows)) insertedLines.push(...rows);
      return builder;
    }),
    update: vi.fn(() => builder),
    single: vi.fn(async () => result),
    then: (
      onFulfilled?: (value: typeof result) => unknown,
      onRejected?: (reason: unknown) => unknown
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };
  return builder;
}

const mockFrom = vi.hoisted(() => vi.fn());
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

vi.mock("@/lib/use-plan-capability", () => ({
  usePlanCapability: () => false,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/link", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("./supplier-dialog", () => ({
  SupplierDialog: () => null,
}));

vi.mock("@/lib/use-project-labels", () => ({
  usePhaseLabel: () => (phase: string) => phase,
  useCategoryOptions: () => [{ value: "construction", label: "Construction" }],
  useSubcategoryOptions: () => [{ value: "masonry", label: "Masonry" }],
}));

const mockTrackUserEvent = vi.hoisted(() => vi.fn());
vi.mock("@/app/actions/track-event", () => ({
  trackUserEvent: (...args: unknown[]) => mockTrackUserEvent(...args),
}));

describe("BudgetLineDialog", () => {
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
    insertedLines.length = 0;
    mockTrackUserEvent.mockClear();
    mockFrom.mockImplementation((table: string) => {
      if (table === "projects") {
        return createQueryBuilder({
          data: { tax_rate: 21, multitax: false },
          error: null,
        });
      }
      if (table === "suppliers") {
        return createQueryBuilder({ data: [], error: null });
      }
      return createQueryBuilder({ data: null, error: null });
    });
  });

  it("duplicate initialValues prefills without inserting", async () => {
    render(
      <BudgetLineDialog
        open
        onOpenChange={vi.fn()}
        projectId="proj-1"
        onSuccess={vi.fn()}
        origin="duplicate"
        initialValues={{
          category: "construction",
          subcategory: "masonry",
          description: "Wall redo",
          estimated_amount: "500",
        }}
      />
    );

    expect(await screen.findByDisplayValue("Wall redo")).toBeInTheDocument();
    expect(insertedLines).toHaveLength(0);
    expect(mockTrackUserEvent).not.toHaveBeenCalled();
  });

  it("add-and-create-another clears description and emits origin repeat", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onCreated = vi.fn();

    render(
      <BudgetLineDialog
        open
        onOpenChange={vi.fn()}
        projectId="proj-1"
        onSuccess={onSuccess}
        onCreated={onCreated}
        initialValues={{
          category: "construction",
          subcategory: "masonry",
          description: "First wall",
          estimated_amount: "100",
        }}
      />
    );

    expect(await screen.findByDisplayValue("First wall")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "addAndCreateAnother" })
    );

    await waitFor(() => {
      expect(insertedLines).toHaveLength(1);
    });

    expect(insertedLines[0]).toMatchObject({
      category: "construction",
      subcategory: "masonry",
    });
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onCreated).toHaveBeenCalledOnce();
    expect(mockTrackUserEvent).toHaveBeenCalledWith("budget_created", {
      project_id: "proj-1",
      source: "manual",
      origin: "repeat",
    });

    await waitFor(() => {
      expect(
        screen.getByRole("textbox", { name: /descriptionLabel/i })
      ).toHaveValue("");
    });
  });
});
