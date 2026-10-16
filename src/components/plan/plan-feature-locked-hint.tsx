"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { PlanLimitCta } from "@/components/plan/plan-limit-cta";
import { appPath } from "@/lib/app-paths";
import {
  markFeatureLimitHitThisSession,
  wasFeatureLimitHitThisSession,
} from "@/lib/plan-limit-ux";
import { trackUserEvent } from "@/app/actions/track-event";
import { cn } from "@/lib/utils";

interface PlanFeatureLockedHintProps {
  featureKey: string;
  explanation: string;
  className?: string;
}

export function PlanFeatureLockedHint({
  featureKey,
  explanation,
  className,
}: PlanFeatureLockedHintProps) {
  const t = useTranslations("PlanLimitUx");

  useEffect(() => {
    if (wasFeatureLimitHitThisSession(featureKey)) return;
    markFeatureLimitHitThisSession(featureKey);
    void trackUserEvent("limit_hit", { type: "feature", feature: featureKey });
  }, [featureKey]);

  return (
    <div className={cn("text-muted-foreground space-y-2 text-sm", className)}>
      <p>{explanation}</p>
      <p>{t("featureLockedHint")}</p>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={appPath("/settings/plan")}
          className="text-primary underline-offset-4 hover:underline"
        >
          {t("viewPlanDetails")}
        </Link>
        <PlanLimitCta limitType="feature" size="sm" variant="link" />
      </div>
    </div>
  );
}
