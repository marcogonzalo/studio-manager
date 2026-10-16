"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanLimitCta } from "@/components/plan/plan-limit-cta";
import {
  dismissStorageBanner,
  isStorageBannerDismissed,
  isStorageFull,
  isStorageWarning,
} from "@/lib/plan-limit-ux";
import { cn } from "@/lib/utils";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) {
    return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
  }
  return `${(mb / 1024).toFixed(mb < 10240 ? 1 : 0)} GB`;
}

interface StorageWarningBannerProps {
  usedBytes: number;
  limitMb: number;
  className?: string;
}

export function StorageWarningBanner({
  usedBytes,
  limitMb,
  className,
}: StorageWarningBannerProps) {
  const t = useTranslations("PlanLimitUx");
  const [dismissed, setDismissed] = useState(() => isStorageBannerDismissed());

  if (dismissed || limitMb < 0) return null;
  if (!isStorageWarning(usedBytes, limitMb)) return null;

  const full = isStorageFull(usedBytes, limitMb);
  const limitBytes = limitMb * 1024 * 1024;
  const percent = Math.min(100, (usedBytes / limitBytes) * 100);

  function handleDismiss() {
    dismissStorageBanner();
    setDismissed(true);
  }

  return (
    <div
      role="status"
      className={cn(
        "border-border bg-muted/40 relative mb-3 rounded-lg border p-3",
        className
      )}
    >
      <div className="pr-8">
        <p className="text-foreground text-sm font-medium">
          {full ? t("storageFullTitle") : t("storageAlmostFullTitle")}
          <span className="text-muted-foreground ml-2 font-normal">
            {t("storageUsage", {
              used: formatBytes(usedBytes),
              limit: formatBytes(limitBytes),
            })}
          </span>
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          {full ? t("storageFullHint") : t("storageFreeSpaceHint")}
        </p>
        <div className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full rounded-full transition-[width]",
              full ? "bg-destructive" : "bg-primary"
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-2">
          <PlanLimitCta limitType="storage" size="sm" variant="secondary" />
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7"
        aria-label={t("dismissBanner")}
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
