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
    expect(mockGetUser).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledWith("user_events");
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-123",
      event: "signup",
      props: { plan_code: "PRO" },
    });
  });

  it("uses options.userId and skips getUser", async () => {
    mockInsert.mockResolvedValue({ error: null });

    const result = await trackEvent(
      "limit_cta_clicked",
      { type: "storage" },
      { userId: "trusted-user-id" }
    );

    expect(result).toBe(true);
    expect(mockGetUser).not.toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "trusted-user-id",
      event: "limit_cta_clicked",
      props: { type: "storage" },
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

  it("tracks sample and note funnel events with project_id", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-789" } },
      error: null,
    });
    mockInsert.mockResolvedValue({ error: null });

    await trackEvent("sample_viewed", { project_id: "proj-1" });
    await trackEvent("sample_reopened", { project_id: "proj-1" });
    await trackEvent("note_created", { project_id: "proj-1" });
    await trackEvent("budget_created", {
      project_id: "proj-1",
      source: "catalog",
      origin: "form",
    });

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-789",
      event: "sample_viewed",
      props: { project_id: "proj-1" },
    });
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-789",
      event: "budget_created",
      props: { project_id: "proj-1", source: "catalog", origin: "form" },
    });
  });

  it("tracks budget_created with origin variants", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-789" } },
      error: null,
    });
    mockInsert.mockResolvedValue({ error: null });

    await trackEvent("budget_created", {
      project_id: "proj-1",
      source: "manual",
      origin: "repeat",
    });
    await trackEvent("budget_created", {
      project_id: "proj-1",
      source: "manual",
      origin: "space_add",
    });
    await trackEvent("budget_created", {
      project_id: "proj-1",
      source: "manual",
      origin: "duplicate",
    });

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-789",
      event: "budget_created",
      props: { project_id: "proj-1", source: "manual", origin: "repeat" },
    });
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-789",
      event: "budget_created",
      props: { project_id: "proj-1", source: "manual", origin: "space_add" },
    });
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-789",
      event: "budget_created",
      props: { project_id: "proj-1", source: "manual", origin: "duplicate" },
    });
  });

  it("handles unexpected errors gracefully", async () => {
    mockGetUser.mockRejectedValue(new Error("Network error"));

    const result = await trackEvent("signup");

    expect(result).toBe(false);
  });
});
