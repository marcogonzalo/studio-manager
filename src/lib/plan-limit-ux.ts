/**
 * Helpers for plan-limit messaging UX (#218).
 */

export const STORAGE_WARNING_RATIO = 0.8;
export const BANNER_DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const STORAGE_BANNER_DISMISS_KEY = "veta_storage_banner_dismissed_until";

export type LimitHitType = "projects" | "storage" | "feature";

export function resolveActiveProjectsLimit(
  config:
    | {
        effective_active_projects_limit?: number;
        projects_limit?: number;
      }
    | null
    | undefined
): number {
  return config?.effective_active_projects_limit ?? config?.projects_limit ?? 1;
}

export function isAtActiveProjectLimit(
  activeCount: number,
  config:
    | {
        effective_active_projects_limit?: number;
        projects_limit?: number;
      }
    | null
    | undefined
): boolean {
  const limit = resolveActiveProjectsLimit(config);
  if (limit < 0) return false; // unlimited
  return activeCount >= limit;
}

export function storageUsageRatio(usedBytes: number, limitMb: number): number {
  if (limitMb < 0) return 0; // unlimited
  if (limitMb === 0) return 1;
  const limitBytes = limitMb * 1024 * 1024;
  if (limitBytes <= 0) return 1;
  return usedBytes / limitBytes;
}

export function isStorageWarning(usedBytes: number, limitMb: number): boolean {
  if (limitMb < 0) return false;
  return storageUsageRatio(usedBytes, limitMb) >= STORAGE_WARNING_RATIO;
}

export function isStorageFull(usedBytes: number, limitMb: number): boolean {
  if (limitMb < 0) return false;
  return storageUsageRatio(usedBytes, limitMb) >= 1;
}

export function readBannerDismissedUntil(
  storage: Pick<Storage, "getItem"> | null = typeof window !== "undefined"
    ? window.localStorage
    : null
): number | null {
  if (!storage) return null;
  const raw = storage.getItem(STORAGE_BANNER_DISMISS_KEY);
  if (!raw) return null;
  const until = Number(raw);
  return Number.isFinite(until) ? until : null;
}

export function isStorageBannerDismissed(
  nowMs: number = Date.now(),
  storage: Pick<Storage, "getItem"> | null = typeof window !== "undefined"
    ? window.localStorage
    : null
): boolean {
  const until = readBannerDismissedUntil(storage);
  if (until == null) return false;
  return nowMs < until;
}

export function dismissStorageBanner(
  nowMs: number = Date.now(),
  storage: Pick<Storage, "setItem"> | null = typeof window !== "undefined"
    ? window.localStorage
    : null
): void {
  if (!storage) return;
  storage.setItem(
    STORAGE_BANNER_DISMISS_KEY,
    String(nowMs + BANNER_DISMISS_TTL_MS)
  );
}

const SESSION_FEATURE_HIT_PREFIX = "veta_limit_hit_feature_";

export function wasFeatureLimitHitThisSession(
  featureKey: string,
  session: Pick<Storage, "getItem"> | null = typeof window !== "undefined"
    ? window.sessionStorage
    : null
): boolean {
  if (!session) return false;
  return session.getItem(SESSION_FEATURE_HIT_PREFIX + featureKey) === "1";
}

export function markFeatureLimitHitThisSession(
  featureKey: string,
  session: Pick<Storage, "setItem"> | null = typeof window !== "undefined"
    ? window.sessionStorage
    : null
): void {
  if (!session) return;
  session.setItem(SESSION_FEATURE_HIT_PREFIX + featureKey, "1");
}

/** Structured upload API error code for storage quota. */
export const STORAGE_LIMIT_CODE = "STORAGE_LIMIT" as const;

export interface StorageLimitErrorBody {
  error: string;
  code: typeof STORAGE_LIMIT_CODE;
  currentUsed: number;
  limitMb: number;
}

export function buildStorageLimitErrorBody(
  currentUsed: number,
  limitMb: number
): StorageLimitErrorBody {
  const usedMb = Math.round(currentUsed / 1024 / 1024);
  return {
    error: `Storage limit reached (${usedMb} MB / ${limitMb} MB).`,
    code: STORAGE_LIMIT_CODE,
    currentUsed,
    limitMb,
  };
}

export function isStorageLimitErrorBody(
  data: unknown
): data is StorageLimitErrorBody {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return d.code === STORAGE_LIMIT_CODE;
}
