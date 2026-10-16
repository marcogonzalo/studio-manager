"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { PlanLimitCta } from "@/components/plan/plan-limit-cta";
import { trackUserEvent } from "@/app/actions/track-event";
import type { StorageLimitErrorBody } from "@/lib/plan-limit-ux";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) {
    return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
  }
  return `${(mb / 1024).toFixed(1)} GB`;
}

interface StorageLimitInlineErrorProps {
  body: StorageLimitErrorBody;
}

export function StorageLimitInlineError({
  body,
}: StorageLimitInlineErrorProps) {
  const t = useTranslations("PlanLimitUx");
  const limitBytes = body.limitMb * 1024 * 1024;

  useEffect(() => {
    void trackUserEvent("limit_hit", { type: "storage" });
  }, []);

  return (
    <div className="bg-destructive/10 text-destructive space-y-2 rounded-md px-3 py-2 text-sm">
      <p className="font-medium">
        {t("storageFullTitle")}
        <span className="ml-2 font-normal">
          {t("storageUsage", {
            used: formatBytes(body.currentUsed),
            limit: formatBytes(limitBytes),
          })}
        </span>
      </p>
      <p className="text-destructive/90">{t("storageFullHint")}</p>
      <PlanLimitCta limitType="storage" size="sm" variant="secondary" />
    </div>
  );
}
