"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";

export interface ProfileDefaults {
  default_tax_rate: number | null;
  default_currency: string;
}

export function useProfileDefaults(): ProfileDefaults | null {
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const [defaults, setDefaults] = useState<ProfileDefaults | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("account_settings")
      .select("default_tax_rate, default_currency")
      .eq("user_id", user.id)
      .single()
      .then(
        (res: {
          data: {
            default_tax_rate?: number | null;
            default_currency?: string | null;
          } | null;
        }) => {
          const data = res.data;
          if (data) {
            setDefaults({
              default_tax_rate:
                data.default_tax_rate != null
                  ? Number(data.default_tax_rate)
                  : null,
              default_currency: data.default_currency ?? "EUR",
            });
          }
        }
      );
  }, [user?.id, supabase]);

  return defaults;
}
