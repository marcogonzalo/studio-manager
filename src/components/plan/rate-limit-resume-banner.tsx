"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RateLimitResumeBannerProps {
  /** When true, show countdown pause copy; otherwise active upload progress. */
  isPaused: boolean;
  secondsLeft: number;
  pendingCount: number;
  onCancel: () => void;
  className?: string;
}

export function RateLimitResumeBanner({
  isPaused,
  secondsLeft,
  pendingCount,
  onCancel,
  className,
}: RateLimitResumeBannerProps) {
  const t = useTranslations("UploadRateLimit");

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "border-border bg-muted/40 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2",
        className
      )}
    >
      <p className="text-foreground text-sm">
        {isPaused
          ? t("pausing", { count: pendingCount, seconds: secondsLeft })
          : t("uploading", { count: pendingCount })}
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-auto shrink-0"
        onClick={onCancel}
        aria-label={t("cancelAria")}
      >
        {t("cancel")}
      </Button>
    </div>
  );
}
