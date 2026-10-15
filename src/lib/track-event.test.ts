import { describe, it, expect, vi, beforeEach } from "vitest";
import { trackEvent } from "./track-event";

const mockGetUser = vi.fn();
const mockInsert = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

describe("trackEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      insert: mockInsert,
    });
  });

  it("tracks event successfully when user is authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
    mockInsert.mockResolvedValue({ error: null });

    const result = await trackEvent("signup", { plan_code: "PRO" });

    expect(result).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith("user_events");
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-123",
      event: "signup",
      props: { plan_code: "PRO" },
    });
  });

  it("returns false when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await trackEvent("login");

    expect(result).toBe(false);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns false when database insert fails", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
    mockInsert.mockResolvedValue({ error: { message: "DB error" } });

    const result = await trackEvent("project_created");

    expect(result).toBe(false);
  });

  it("tracks event without props", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-456" } },
      error: null,
    });
    mockInsert.mockResolvedValue({ error: null });

    const result = await trackEvent("login");

    expect(result).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-456",
      event: "login",
      props: {},
    });
  });

  it("handles unexpected errors gracefully", async () => {
    mockGetUser.mockRejectedValue(new Error("Network error"));

    const result = await trackEvent("signup");

    expect(result).toBe(false);
  });
});
