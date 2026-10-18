"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import type { PlanCode } from "@/types";
import {
  getOnboardingStepsStatus,
  anyOnboardingStepCompleted,
  isRealProjectForOnboarding,
  onboardingWelcomeSeenKey,
  clearLegacyOnboardingSessionKeys,
  type OnboardingData,
  type OnboardingStepId,
  type OnboardingStepStatus,
} from "@/lib/onboarding";
import { isDemoAccountEmail } from "@/lib/utils";
import { trackUserEvent } from "@/app/actions/track-event";

export interface UseOnboardingStatusResult {
  steps: OnboardingStepStatus[];
  primarySteps: OnboardingStepStatus[];
  secondarySteps: OnboardingStepStatus[];
  firstPendingStepId: OnboardingStepId | null;
  allComplete: boolean;
  activationComplete: boolean;
  loading: boolean;
  sampleProjectId: string | null;
  dismissed: boolean;
  dismissChecklist: () => Promise<void>;
  restoreChecklist: () => Promise<void>;
  /** Hide checklist for demo account or when dismissed / loading. */
  showChecklist: boolean;
}

export function useOnboardingStatus(): UseOnboardingStatusResult {
  const { user, effectivePlan } = useAuth();
  const pathname = usePathname();
  const isDemo = isDemoAccountEmail(user?.email);
  const [data, setData] = useState<OnboardingData | null>(null);
  const [dismissedAt, setDismissedAt] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const userId = user?.id;
    if (!userId || isDemo) {
      setData(null);
      setDismissedAt(null);
      setCompletedAt(null);
      setLoading(false);
      return;
    }
    const supabase = getSupabaseClient();

    const [
      profileRes,
      settingsRes,
      projectsRes,
      pdfEventsRes,
      supplierEventsRes,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, company")
        .eq("id", userId)
        .single(),
      supabase
        .from("account_settings")
        .select(
          "default_currency, default_tax_rate, public_name, onboarding_dismissed_at, onboarding_completed_at"
        )
        .eq("user_id", userId)
        .maybeSingle()
        .then(
          async (res: {
            data: Record<string, unknown> | null;
            error: { message?: string; code?: string } | null;
          }) => {
            if (
              res.error &&
              (res.error.message?.includes("onboarding_dismissed_at") ||
                res.error.message?.includes("onboarding_completed_at") ||
                res.error.code === "42703")
            ) {
              return supabase
                .from("account_settings")
                .select("default_currency, default_tax_rate, public_name")
                .eq("user_id", userId)
                .maybeSingle();
            }
            return res;
          }
        ),
      supabase
        .from("projects")
        .select("id, is_sample, status, client_id, is_public_enabled")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("user_events")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("event", "pdf_exported"),
      supabase
        .from("user_events")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("event", "supplier_created"),
    ]);

    const planCode: PlanCode = (effectivePlan?.plan_code as PlanCode) ?? "BASE";

    type ProjectRow = {
      id: string;
      is_sample?: boolean | null;
      status?: string | null;
      client_id?: string | null;
      is_public_enabled?: boolean | null;
    };

    const projectRows = (projectsRes.data as ProjectRow[] | null) ?? [];
    const realProjects = projectRows.filter(isRealProjectForOnboarding);
    const sampleProjectId =
      projectRows.find((p) => p.is_sample === true)?.id ?? null;
    const targetProjectId = realProjects[0]?.id ?? null;
    const realProjectIds = realProjects.map((p) => p.id);

    let budgetItemCount = 0;
    let hasRealCost = false;

    if (realProjectIds.length > 0) {
      const [itemsRes, linesRes] = await Promise.all([
        supabase
          .from("project_items")
          .select("id, is_excluded, unit_cost")
          .in("project_id", realProjectIds),
        supabase
          .from("project_budget_lines")
          .select("id, actual_amount, category")
          .in("project_id", realProjectIds),
      ]);

      const items =
        (itemsRes.data as
          | {
              id: string;
              is_excluded?: boolean | null;
              unit_cost?: number | null;
            }[]
          | null) ?? [];
      const lines =
        (linesRes.data as
          | {
              id: string;
              actual_amount?: number | null;
              category?: string | null;
            }[]
          | null) ?? [];

      const includedItems = items.filter((i) => !i.is_excluded);
      budgetItemCount = includedItems.length + lines.length;

      hasRealCost =
        lines.some(
          (l) =>
            l.category !== "own_fees" &&
            l.actual_amount != null &&
            Number(l.actual_amount) > 0
        ) ||
        includedItems.some(
          (i) => i.unit_cost != null && Number(i.unit_cost) > 0
        );
    }

    const settings = settingsRes.data as {
      default_currency?: string | null;
      default_tax_rate?: number | null;
      public_name?: string | null;
      onboarding_dismissed_at?: string | null;
      onboarding_completed_at?: string | null;
    } | null;

    const profile = profileRes.data as {
      full_name?: string | null;
      company?: string | null;
    } | null;

    // Seeded sample suppliers (#233) must NOT complete this step — only real
    // supplier_created events (seed emits no user_events). Using row count
    // skipped the welcome modal for every new account.
    const hasSupplierEvent = (supplierEventsRes.count ?? 0) > 0;

    setDismissedAt(settings?.onboarding_dismissed_at ?? null);
    setCompletedAt(settings?.onboarding_completed_at ?? null);

    setData({
      welcomeSeen: false,
      planCode,
      projectsCount: realProjects.length,
      targetProjectId,
      sampleProjectId,
      hasSupplier: hasSupplierEvent,
      budgetItemCount,
      hasClientOnProject: realProjects.some((p) => Boolean(p.client_id)),
      hasPublishedClientView: realProjects.some(
        (p) => p.is_public_enabled === true
      ),
      hasPdfExported: (pdfEventsRes.count ?? 0) > 0,
      hasRealCost,
      publicName: settings?.public_name ?? null,
      defaultCurrency: settings?.default_currency ?? null,
      defaultTaxRate:
        settings?.default_tax_rate != null
          ? Number(settings.default_tax_rate)
          : null,
      fullName: profile?.full_name ?? null,
      company: profile?.company ?? null,
    });
    setLoading(false);
  }, [user?.id, effectivePlan?.plan_code, isDemo]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await fetchData();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchData, pathname]);

  const welcomeSeenFromSession =
    typeof window !== "undefined" &&
    !!user?.id &&
    sessionStorage.getItem(onboardingWelcomeSeenKey(user.id)) === "1";
  // Skip welcome only for THIS user's real primary progress or their own session flag.
  // Do not use unscoped sessionStorage (leaked across signups in the same tab).
  const welcomeSeen =
    data && (anyOnboardingStepCompleted(data) || welcomeSeenFromSession);

  useEffect(() => {
    clearLegacyOnboardingSessionKeys();
  }, [user?.id]);
  const dataWithWelcome: OnboardingData | null = data
    ? { ...data, welcomeSeen: !!welcomeSeen }
    : null;

  const result = dataWithWelcome
    ? getOnboardingStepsStatus(dataWithWelcome)
    : {
        steps: [],
        primarySteps: [],
        secondarySteps: [],
        firstPendingStepId: null as OnboardingStepId | null,
        allComplete: true,
        activationComplete: true,
      };

  // Persist activation completion once
  useEffect(() => {
    if (
      !user?.id ||
      isDemo ||
      !result.activationComplete ||
      completedAt ||
      loading
    ) {
      return;
    }
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();
    void supabase
      .from("account_settings")
      .update({
        onboarding_completed_at: now,
        updated_at: now,
      })
      .eq("user_id", user.id)
      .is("onboarding_completed_at", null)
      .then(() => setCompletedAt(now));
  }, [user?.id, isDemo, result.activationComplete, completedAt, loading]);

  const dismissChecklist = useCallback(async () => {
    if (!user?.id) return;
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();
    await supabase
      .from("account_settings")
      .update({
        onboarding_dismissed_at: now,
        updated_at: now,
      })
      .eq("user_id", user.id);
    setDismissedAt(now);
    void trackUserEvent("onboarding_dismissed");
  }, [user]);

  const restoreChecklist = useCallback(async () => {
    if (!user?.id) return;
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();
    await supabase
      .from("account_settings")
      .update({
        onboarding_dismissed_at: null,
        updated_at: now,
      })
      .eq("user_id", user.id);
    setDismissedAt(null);
    void trackUserEvent("onboarding_restored");
  }, [user]);

  const dismissed = Boolean(dismissedAt);
  const showChecklist =
    !isDemo &&
    !loading &&
    !dismissed &&
    !result.activationComplete &&
    result.primarySteps.length > 0;

  return {
    steps: result.steps,
    primarySteps: result.primarySteps,
    secondarySteps: result.secondarySteps,
    firstPendingStepId: result.firstPendingStepId,
    allComplete: result.allComplete,
    activationComplete: result.activationComplete,
    loading,
    sampleProjectId: data?.sampleProjectId ?? null,
    dismissed,
    dismissChecklist,
    restoreChecklist,
    showChecklist,
  };
}
