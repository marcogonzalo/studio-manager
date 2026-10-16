"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isPaymentsEnabled } from "@/lib/payments-flag";
import { appPath } from "@/lib/app-paths";
import type { LimitHitType } from "@/lib/plan-limit-ux";

interface PlanLimitCtaProps {
  limitType: LimitHitType;
  variant?: "default" | "outline" | "link" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
  onAfterNotify?: () => void;
}

export function PlanLimitCta({
  limitType,
  variant = "default",
  size = "default",
  className,
  onAfterNotify,
}: PlanLimitCtaProps) {
  const t = useTranslations("PlanLimitUx");
  const [loading, setLoading] = useState(false);
  const paymentsOn = isPaymentsEnabled();

  if (paymentsOn) {
    return (
      <Button asChild variant={variant} size={size} className={className}>
        <Link href={appPath("/settings/plan/change")}>{t("upgradeCta")}</Link>
      </Button>
    );
  }

  async function handleWaitlist() {
    setLoading(true);
    try {
      const res = await fetch("/api/plan/notify-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: limitType }),
      });
      if (!res.ok) throw new Error("notify failed");
      toast.success(t("waitlistSuccess"));
      onAfterNotify?.();
    } catch {
      toast.error(t("waitlistError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={loading}
      onClick={() => void handleWaitlist()}
    >
      {t("waitlistCta")}
    </Button>
  );
}
