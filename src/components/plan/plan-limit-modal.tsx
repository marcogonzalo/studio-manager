"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlanLimitCta } from "@/components/plan/plan-limit-cta";
import {
  COMPACT_FEATURE_KEYS,
  STATIC_PLAN_CONFIGS,
  getCommercialFeatures,
  translatePlanCopyItem,
} from "@/lib/plan-copy";
import { appPath } from "@/lib/app-paths";
import { trackUserEvent } from "@/app/actions/track-event";

interface PlanLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanLimitModal({ open, onOpenChange }: PlanLimitModalProps) {
  const t = useTranslations("PlanLimitUx");
  const tPlanCopy = useTranslations("PlanCopy");

  const baseFeatures = useMemo(
    () =>
      getCommercialFeatures(STATIC_PLAN_CONFIGS.BASE, {
        include: COMPACT_FEATURE_KEYS,
      }).map((item) => translatePlanCopyItem(item, tPlanCopy)),
    [tPlanCopy]
  );

  const proFeatures = useMemo(
    () =>
      getCommercialFeatures(STATIC_PLAN_CONFIGS.PRO, {
        include: COMPACT_FEATURE_KEYS,
      }).map((item) => translatePlanCopyItem(item, tPlanCopy)),
    [tPlanCopy]
  );

  useEffect(() => {
    if (!open) return;
    void trackUserEvent("limit_hit", { type: "projects" });
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("projectModalTitle")}</DialogTitle>
          <DialogDescription>{t("projectModalWhy")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-foreground mb-2 text-sm font-semibold">
              {t("baseIncludes")}
            </h3>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              {baseFeatures.slice(0, 6).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-foreground mb-2 text-sm font-semibold">
              {t("proAdds")}
            </h3>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              {proFeatures.slice(0, 6).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-muted-foreground text-sm">
          {t("stayOnBase")}{" "}
          <Link
            href={appPath("/projects")}
            className="text-primary underline-offset-4 hover:underline"
            onClick={() => onOpenChange(false)}
          >
            {t("goToProjects")}
          </Link>
        </p>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("notNow")}
          </Button>
          <PlanLimitCta
            limitType="projects"
            onAfterNotify={() => onOpenChange(false)}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
