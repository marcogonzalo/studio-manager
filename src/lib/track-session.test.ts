import { describe, it, expect, vi, beforeEach } from "vitest";
import { trackSessionStart } from "./track-session";

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe("trackSessionStart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not track session if user is not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    await trackSessionStart();

    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it("tracks session if no recent session exists", async () => {
    const mockUser = { id: "user-123" };
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockGte = vi.fn().mockReturnThis();
    const mockLimit = vi.fn().mockResolvedValue({ data: [] });

    mockSupabase.from.mockReturnValueOnce({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValueOnce({
      eq: mockEq,
    });
    mockEq.mockReturnValueOnce({
      gte: mockGte,
    });
    mockGte.mockReturnValue({
      limit: mockLimit,
    });

    const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
    mockSupabase.from.mockReturnValueOnce({
      insert: mockInsert,
    });

    await trackSessionStart();

    expect(mockSupabase.from).toHaveBeenCalledWith("user_events");
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-123",
      event: "login",
      props: { session_start: true },
    });
  });

  it("does not track session if recent session exists (within 30 minutes)", async () => {
    const mockUser = { id: "user-123" };
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockGte = vi.fn().mockReturnThis();
    const mockLimit = vi.fn().mockResolvedValue({ data: [{ id: "event-1" }] });

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValueOnce({
      eq: mockEq,
    });
    mockEq.mockReturnValueOnce({
      gte: mockGte,
    });
    mockGte.mockReturnValue({
      limit: mockLimit,
    });

    await trackSessionStart();

    expect(mockSupabase.from).toHaveBeenCalledTimes(1); // Only the select, no insert
  });

  it("handles errors silently", async () => {
    mockSupabase.auth.getUser.mockRejectedValue(new Error("Auth error"));
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await trackSessionStart();

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
