"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import type { PlanCode } from "@/types";
import {
  getOnboardingStepsStatus,
  anyOnboardingStepCompleted,
  ONBOARDING_WELCOME_SEEN_SESSION_KEY,
  type OnboardingData,
  type OnboardingStepId,
  type OnboardingStepStatus,
} from "@/lib/onboarding";

export interface UseOnboardingStatusResult {
  steps: OnboardingStepStatus[];
  firstPendingStepId: OnboardingStepId | null;
  allComplete: boolean;
  loading: boolean;
}

export function useOnboardingStatus(): UseOnboardingStatusResult {
  const { user, effectivePlan } = useAuth();
  const pathname = usePathname();
  const [data, setData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      setData(null);
      setLoading(false);
      return;
    }
    const supabase = getSupabaseClient();
    let cancelled = false;

    async function fetchData() {
      const [profileRes, settingsRes, clientsRes, projectsRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("full_name")
            .eq("id", userId)
            .single(),
          supabase
            .from("account_settings")
            .select("default_currency, default_tax_rate, public_name")
            .eq("user_id", userId)
            .single(),
          supabase
            .from("clients")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId),
          supabase.from("projects").select("id").eq("user_id", userId),
        ]);

      if (cancelled) return;

      const planCode: PlanCode =
        (effectivePlan?.plan_code as PlanCode) ?? "BASE";

      const projectRows = projectsRes.data as { id: string }[] | null;
      const projectIds = projectRows?.map((p) => p.id) ?? [];

      const profile = profileRes.data as { full_name?: string | null } | null;
      const settings = settingsRes.data as {
        default_currency?: string | null;
        default_tax_rate?: number | null;
        public_name?: string | null;
      } | null;

      setData({
        fullName: profile?.full_name ?? null,
        defaultCurrency: settings?.default_currency ?? null,
        defaultTaxRate: settings?.default_tax_rate ?? null,
        welcomeSeen: false,
        publicName: settings?.public_name ?? null,
        clientsCount: clientsRes.count ?? 0,
        projectsCount: projectIds.length,
        planCode,
      });
      setLoading(false);
    }

    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [user?.id, effectivePlan?.plan_code, pathname]);

  const welcomeSeenFromSession =
    typeof window !== "undefined" &&
    sessionStorage.getItem(ONBOARDING_WELCOME_SEEN_SESSION_KEY) === "1";
  const welcomeSeen =
    data && (anyOnboardingStepCompleted(data) || welcomeSeenFromSession);
  const dataWithWelcome: OnboardingData | null = data
    ? { ...data, welcomeSeen: !!welcomeSeen }
    : null;

  const result = dataWithWelcome
    ? getOnboardingStepsStatus(dataWithWelcome)
    : { steps: [], firstPendingStepId: null, allComplete: true };

  return {
    steps: result.steps,
    firstPendingStepId: result.firstPendingStepId,
    allComplete: result.allComplete,
    loading,
  };
}
