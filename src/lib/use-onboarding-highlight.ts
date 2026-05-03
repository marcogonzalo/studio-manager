"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { OnboardingStepId } from "@/lib/onboarding";

const HIGHLIGHT_DURATION_MS = 4000;

/**
 * When the page is loaded with ?onboarding={stepId}, scrolls to the element
 * with data-onboarding-target={stepId} and adds the onboarding-highlight class temporarily.
 * @param stepId - Step id matching the query param and data-onboarding-target.
 * @param ready - When true, the highlight runs. Pass e.g. !loading so the effect re-runs after content is mounted.
 */
export function useOnboardingHighlight(
  stepId: OnboardingStepId,
  ready = true
): void {
  const searchParams = useSearchParams();
  const param = searchParams.get("onboarding");

  useEffect(() => {
    if (param !== stepId || !ready) return;
    const el = document.querySelector(`[data-onboarding-target="${stepId}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("onboarding-highlight");
    const t = setTimeout(() => {
      el.classList.remove("onboarding-highlight");
    }, HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(t);
  }, [param, stepId, ready]);
}
