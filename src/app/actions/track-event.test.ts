import { describe, it, expect, vi, beforeEach } from "vitest";
import { trackUserEvent } from "./track-event";

const mockTrackEvent = vi.fn();

vi.mock("@/lib/track-event", () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

describe("trackUserEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTrackEvent.mockResolvedValue(true);
  });

  it("forwards event and props only (no options / userId)", async () => {
    const result = await trackUserEvent("supplier_created", {
      supplier_id: "s1",
    });

    expect(result).toBe(true);
    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith("supplier_created", {
      supplier_id: "s1",
    });
    expect(mockTrackEvent.mock.calls[0]).toHaveLength(2);
  });

  it("forwards event without props", async () => {
    await trackUserEvent("login");

    expect(mockTrackEvent).toHaveBeenCalledWith("login", undefined);
    expect(mockTrackEvent.mock.calls[0]).toHaveLength(2);
  });
});
