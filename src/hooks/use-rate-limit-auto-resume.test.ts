import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRateLimitAutoResume } from "@/hooks/use-rate-limit-auto-resume";

describe("useRateLimitAutoResume", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down and auto-resumes once", () => {
    const onResume = vi.fn();
    const { result } = renderHook(() => useRateLimitAutoResume(onResume));

    act(() => {
      result.current.startPause(2, 3);
    });

    expect(result.current.isPaused).toBe(true);
    expect(result.current.secondsLeft).toBe(2);
    expect(result.current.pendingCount).toBe(3);
    expect(onResume).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(1);
    expect(onResume).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.isPaused).toBe(false);
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it("cancel prevents auto-resume", () => {
    const onResume = vi.fn();
    const { result } = renderHook(() => useRateLimitAutoResume(onResume));

    act(() => {
      result.current.startPause(2, 1);
    });
    act(() => {
      result.current.cancel();
    });

    expect(result.current.isPaused).toBe(false);
    expect(result.current.pendingCount).toBe(0);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onResume).not.toHaveBeenCalled();
  });

  it("unmount prevents auto-resume", () => {
    const onResume = vi.fn();
    const { result, unmount } = renderHook(() =>
      useRateLimitAutoResume(onResume)
    );

    act(() => {
      result.current.startPause(1, 1);
    });
    unmount();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onResume).not.toHaveBeenCalled();
  });
});
