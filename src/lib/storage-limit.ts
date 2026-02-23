/**
 * Storage limit check for upload APIs.
 * Uses user_storage_usage (bytes_used) and get_effective_plan (effective_storage_limit_mb).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

const BYTES_PER_MB = 1024 * 1024;
const DEFAULT_LIMIT_MB = 500;

export interface StorageLimitResult {
  allowed: boolean;
  currentUsed: number;
  limitBytes: number;
  limitMb: number;
}

/**
 * Returns current usage and limit for the user. Does not modify anything.
 * effective_storage_limit_mb: -1 means unlimited.
 * @param overrideCurrentUsed - When set, use this instead of querying user_storage_usage (e.g. from service-role read for reliable value).
 */
export async function checkStorageLimit(
  supabase: SupabaseClient,
  userId: string,
  addBytes: number,
  overrideCurrentUsed?: number
): Promise<StorageLimitResult> {
  const [usageRes, planRes] = await Promise.all([
    overrideCurrentUsed !== undefined
      ? Promise.resolve({
          data: { bytes_used: overrideCurrentUsed },
          error: null,
        })
      : supabase
          .from("user_storage_usage")
          .select("bytes_used")
          .eq("user_id", userId)
          .single(),
    supabase.rpc("get_effective_plan", { p_user_id: userId }),
  ]);

  const currentUsed = Number(usageRes.data?.bytes_used ?? 0);
  const row = Array.isArray(planRes.data) ? planRes.data[0] : planRes.data;
  const config = row?.config ?? row;
  const limitMb =
    config?.effective_storage_limit_mb ??
    config?.storage_limit_mb ??
    DEFAULT_LIMIT_MB;
  const unlimited = limitMb === -1;
  const limitBytes = unlimited
    ? Number.MAX_SAFE_INTEGER
    : limitMb * BYTES_PER_MB;

  return {
    allowed: unlimited || currentUsed + addBytes <= limitBytes,
    currentUsed,
    limitBytes,
    limitMb,
  };
}
