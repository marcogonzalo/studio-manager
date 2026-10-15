"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveStorageLimitMb } from "@/lib/settings-plan-logic";

export interface StorageUsageState {
  usedBytes: number;
  limitMb: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useStorageUsage(): StorageUsageState {
  const { user, effectivePlan } = useAuth();
  const supabase = getSupabaseClient();
  const [usedBytes, setUsedBytes] = useState(0);
  const [loading, setLoading] = useState(true);

  const limitMb = resolveStorageLimitMb(effectivePlan?.config);

  const refresh = useCallback(async () => {
    if (!user) {
      setUsedBytes(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("user_storage_usage")
      .select("bytes_used")
      .eq("user_id", user.id)
      .single();
    setUsedBytes(Number(data?.bytes_used ?? 0));
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { usedBytes, limitMb, loading, refresh };
}
