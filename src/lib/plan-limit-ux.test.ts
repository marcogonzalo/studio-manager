import { describe, it, expect, beforeEach } from "vitest";
import {
  isAtActiveProjectLimit,
  resolveActiveProjectsLimit,
  storageUsageRatio,
  isStorageWarning,
  isStorageFull,
  isStorageBannerDismissed,
  dismissStorageBanner,
  wasFeatureLimitHitThisSession,
  markFeatureLimitHitThisSession,
  buildStorageLimitErrorBody,
  isStorageLimitErrorBody,
  STORAGE_LIMIT_CODE,
  BANNER_DISMISS_TTL_MS,
} from "./plan-limit-ux";

describe("resolveActiveProjectsLimit / isAtActiveProjectLimit", () => {
  it("prefers effective_active_projects_limit", () => {
    expect(
      resolveActiveProjectsLimit({
        effective_active_projects_limit: 5,
        projects_limit: 1,
      })
    ).toBe(5);
  });

  it("defaults to 1", () => {
    expect(resolveActiveProjectsLimit(null)).toBe(1);
    expect(isAtActiveProjectLimit(1, null)).toBe(true);
    expect(isAtActiveProjectLimit(0, null)).toBe(false);
  });

  it("treats negative limit as unlimited", () => {
    expect(isAtActiveProjectLimit(100, { projects_limit: -1 })).toBe(false);
  });
});

describe("storage ratios", () => {
  const limitMb = 500;
  const bytesAt80 = 0.8 * 500 * 1024 * 1024;
  const bytesFull = 500 * 1024 * 1024;

  it("computes ratio and warning/full thresholds", () => {
    expect(storageUsageRatio(bytesAt80, limitMb)).toBeCloseTo(0.8);
    expect(isStorageWarning(bytesAt80 - 1, limitMb)).toBe(false);
    expect(isStorageWarning(bytesAt80, limitMb)).toBe(true);
    expect(isStorageFull(bytesFull - 1, limitMb)).toBe(false);
    expect(isStorageFull(bytesFull, limitMb)).toBe(true);
  });

  it("unlimited never warns", () => {
    expect(isStorageWarning(1e15, -1)).toBe(false);
    expect(isStorageFull(1e15, -1)).toBe(false);
  });
});

describe("banner dismiss persistence", () => {
  let store: Record<string, string>;
  const storage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
  };

  beforeEach(() => {
    store = {};
  });

  it("dismiss lasts until TTL", () => {
    const now = 1_000_000;
    dismissStorageBanner(now, storage);
    expect(isStorageBannerDismissed(now + 1000, storage)).toBe(true);
    expect(
      isStorageBannerDismissed(now + BANNER_DISMISS_TTL_MS + 1, storage)
    ).toBe(false);
  });
});

describe("feature limit session mark", () => {
  let store: Record<string, string>;
  const session = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
  };

  beforeEach(() => {
    store = {};
  });

  it("marks once per feature key", () => {
    expect(wasFeatureLimitHitThisSession("renders", session)).toBe(false);
    markFeatureLimitHitThisSession("renders", session);
    expect(wasFeatureLimitHitThisSession("renders", session)).toBe(true);
    expect(wasFeatureLimitHitThisSession("notes", session)).toBe(false);
  });
});

describe("storage limit error body", () => {
  it("builds and detects structured body", () => {
    const body = buildStorageLimitErrorBody(10 * 1024 * 1024, 500);
    expect(body.code).toBe(STORAGE_LIMIT_CODE);
    expect(body.limitMb).toBe(500);
    expect(isStorageLimitErrorBody(body)).toBe(true);
    expect(isStorageLimitErrorBody({ error: "x" })).toBe(false);
  });
});
