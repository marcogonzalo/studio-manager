import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { reportError, reportWarn } from "@/lib/utils";
import { useProjectBudgetLines } from "./use-project-budget-lines";

type QueryResult = { data: unknown; error: unknown };

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

const mockFrom = vi.hoisted(() => vi.fn());
const mockClient = vi.hoisted(() => ({ from: mockFrom }));

vi.mock("@/lib/supabase", () => ({
  getSupabaseClient: () => mockClient,
}));

vi.mock("@/lib/utils", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/utils")>("@/lib/utils");
  return {
    ...actual,
    reportError: vi.fn(),
    reportWarn: vi.fn(),
  };
});

function Harness({
  projectId,
  excludeInternal,
  costOnly,
  autoFetch,
}: {
  projectId: string;
  excludeInternal?: boolean;
  costOnly?: boolean;
  autoFetch?: boolean;
}) {
  const { budgetLines, loading } = useProjectBudgetLines(projectId, {
    excludeInternal,
    costOnly,
    autoFetch,
  });
  return (
    <div>
      <span data-testid="loading">{loading ? "yes" : "no"}</span>
      <span data-testid="count">{budgetLines.length}</span>
      <span data-testid="first-id">{budgetLines[0]?.id ?? "none"}</span>
      <span data-testid="ids">
        {budgetLines.map((line) => line.id).join(",") || "none"}
      </span>
    </div>
  );
}

function mockBudgetQuery(result: Promise<QueryResult>) {
  const query: Record<string, unknown> = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    order: vi.fn(() => query),
    or: vi.fn(() => query),
    then: (
      onFulfilled?: (value: QueryResult) => unknown,
      onRejected?: (reason: unknown) => unknown
    ) => result.then(onFulfilled, onRejected),
  };
  mockFrom.mockReturnValue(query);
  return query;
}

function line(id: string, category: string) {
  return {
    id,
    project_id: "p1",
    category,
    subcategory: "obra",
    estimated_amount: 10,
    actual_amount: 0,
    is_internal_cost: false,
    user_id: "u1",
    created_at: "2026-01-01",
  };
}

describe("useProjectBudgetLines", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    vi.mocked(reportError).mockClear();
    vi.mocked(reportWarn).mockClear();
  });

  it("loads lines for the project", async () => {
    mockBudgetQuery(
      Promise.resolve({
        data: [
          {
            id: "line-1",
            project_id: "p1",
            category: "construction",
            subcategory: "obra",
            estimated_amount: 10,
            actual_amount: 0,
            is_internal_cost: false,
            user_id: "u1",
            created_at: "2026-01-01",
          },
        ],
        error: null,
      })
    );

    render(<Harness projectId="p1" />);

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("no");
    });
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("first-id")).toHaveTextContent("line-1");
  });

  it("ignores a stale response after unmount", async () => {
    const first = createDeferred<QueryResult>();
    mockBudgetQuery(first.promise);

    const { unmount } = render(<Harness projectId="p1" />);
    expect(screen.getByTestId("loading")).toHaveTextContent("yes");

    unmount();

    await act(async () => {
      first.resolve({
        data: [
          {
            id: "stale",
            project_id: "p1",
            category: "construction",
            subcategory: "obra",
            estimated_amount: 1,
            actual_amount: 0,
            is_internal_cost: false,
            user_id: "u1",
            created_at: "2026-01-01",
          },
        ],
        error: null,
      });
      await first.promise;
    });
  });

  it("keeps the latest project when a slower prior fetch resolves later", async () => {
    const first = createDeferred<QueryResult>();
    mockBudgetQuery(first.promise);

    const { rerender } = render(<Harness projectId="p1" />);

    const second = createDeferred<QueryResult>();
    mockBudgetQuery(second.promise);
    rerender(<Harness projectId="p2" />);

    await act(async () => {
      second.resolve({
        data: [
          {
            id: "from-p2",
            project_id: "p2",
            category: "construction",
            subcategory: "obra",
            estimated_amount: 2,
            actual_amount: 0,
            is_internal_cost: false,
            user_id: "u1",
            created_at: "2026-01-01",
          },
        ],
        error: null,
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("first-id")).toHaveTextContent("from-p2");
    });

    await act(async () => {
      first.resolve({
        data: [
          {
            id: "from-p1",
            project_id: "p1",
            category: "construction",
            subcategory: "obra",
            estimated_amount: 1,
            actual_amount: 0,
            is_internal_cost: false,
            user_id: "u1",
            created_at: "2026-01-01",
          },
        ],
        error: null,
      });
    });

    expect(screen.getByTestId("first-id")).toHaveTextContent("from-p2");
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("filters internal costs when excludeInternal is set", async () => {
    const query = mockBudgetQuery(
      Promise.resolve({ data: [line("pub", "construction")], error: null })
    );

    render(<Harness projectId="p1" excludeInternal />);

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("no");
    });
    expect(query.or).toHaveBeenCalledWith(
      "is_internal_cost.eq.false,is_internal_cost.is.null"
    );
  });

  it("keeps only cost categories when costOnly is set", async () => {
    mockBudgetQuery(
      Promise.resolve({
        data: [line("cost", "construction"), line("fee", "own_fees")],
        error: null,
      })
    );

    render(<Harness projectId="p1" costOnly />);

    await waitFor(() => {
      expect(screen.getByTestId("ids")).toHaveTextContent("cost");
    });
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("warns and clears lines when the table is missing", async () => {
    mockBudgetQuery(
      Promise.resolve({
        data: null,
        error: { code: "42P01", message: "does not exist" },
      })
    );

    render(<Harness projectId="p1" />);

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("no");
    });
    expect(reportWarn).toHaveBeenCalled();
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("reports other fetch errors and clears lines", async () => {
    mockBudgetQuery(
      Promise.resolve({
        data: null,
        error: { code: "XX", message: "boom" },
      })
    );

    render(<Harness projectId="p1" />);

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("no");
    });
    expect(reportError).toHaveBeenCalled();
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("does not fetch when autoFetch is false", () => {
    mockBudgetQuery(Promise.resolve({ data: [], error: null }));
    render(<Harness projectId="p1" autoFetch={false} />);
    expect(mockFrom).not.toHaveBeenCalled();
    expect(screen.getByTestId("loading")).toHaveTextContent("no");
  });

  it("does not fetch when projectId is empty", () => {
    mockBudgetQuery(Promise.resolve({ data: [], error: null }));
    render(<Harness projectId="" />);
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
