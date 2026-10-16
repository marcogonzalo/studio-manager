"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Supplier } from "@/types";

const SUPPLIER_COLUMNS = "id, name, contact_name, email, phone, website";

export interface UseSuppliersOptions {
  /** When false, skip automatic fetch. Default true. */
  enabled?: boolean;
}

export interface UseSuppliersResult {
  suppliers: Supplier[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSuppliers(
  options: UseSuppliersOptions = {}
): UseSuppliersResult {
  const { enabled = true } = options;
  const supabase = getSupabaseClient();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("suppliers")
      .select(SUPPLIER_COLUMNS)
      .order("name");

    if (fetchError) {
      setError(new Error(fetchError.message));
      setSuppliers([]);
    } else {
      setSuppliers((data as Supplier[] | null) ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void refetch();
  }, [enabled, refetch]);

  return { suppliers, loading, error, refetch };
}
