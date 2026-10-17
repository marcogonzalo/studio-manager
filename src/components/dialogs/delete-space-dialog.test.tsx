import { describe, expect, it, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteSpaceDialog } from "./delete-space-dialog";

const mockRpc = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase", () => ({
  getSupabaseClient: () => ({ rpc: mockRpc }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: { count?: number }) =>
    values?.count != null ? `${key}:${values.count}` : key,
  useLocale: () => "en",
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("DeleteSpaceDialog", () => {
  beforeAll(() => {
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  beforeEach(() => {
    mockRpc.mockReset();
    mockRpc.mockResolvedValue({ error: null });
  });

  it("calls delete_space with move by default when space has items", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      <DeleteSpaceDialog
        open
        onOpenChange={vi.fn()}
        space={{ id: "space-1", name: "Kitchen", description: "" }}
        itemCount={3}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByText("descriptionWithItems:3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("delete_space", {
        p_space_id: "space-1",
        p_mode: "move",
      });
    });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("calls delete_space with delete_lines when chosen", async () => {
    const user = userEvent.setup();

    render(
      <DeleteSpaceDialog
        open
        onOpenChange={vi.fn()}
        space={{ id: "space-1", name: "Kitchen", description: "" }}
        itemCount={2}
        onSuccess={vi.fn()}
      />
    );

    await user.click(screen.getByRole("radio", { name: "deleteOption" }));
    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("delete_space", {
        p_space_id: "space-1",
        p_mode: "delete_lines",
      });
    });
  });

  it("shows PO blocked toast when RPC returns PO_LINKED", async () => {
    const { toast } = await import("sonner");
    mockRpc.mockResolvedValue({
      error: { message: "PO_LINKED: cannot delete", code: "P0001" },
    });
    const user = userEvent.setup();

    render(
      <DeleteSpaceDialog
        open
        onOpenChange={vi.fn()}
        space={{ id: "space-1", name: "Kitchen", description: "" }}
        itemCount={1}
        onSuccess={vi.fn()}
      />
    );

    await user.click(screen.getByRole("radio", { name: "deleteOption" }));
    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("toastPoBlocked");
    });
  });
});
