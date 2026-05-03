"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { appPath } from "@/lib/app-paths";
import type { OnboardingStepId } from "@/lib/onboarding";

function buildOnboardingUrl(href: string, stepId: OnboardingStepId): string {
  const base = href.startsWith("/") ? href : appPath(href);
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}onboarding=${stepId}`;
}

export interface OnboardingStepModalProps {
  stepId: OnboardingStepId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOmitir: () => void;
  onWelcomeComplete: () => Promise<void>;
}

export function OnboardingStepModal({
  stepId,
  open,
  onOpenChange,
  onOmitir,
  onWelcomeComplete,
}: OnboardingStepModalProps) {
  const t = useTranslations("Onboarding");
  const handleOmitir = () => {
    onOmitir();
    onOpenChange(false);
  };

  if (stepId === "welcome") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-md"
          aria-describedby="onboarding-welcome-desc"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">{t("welcome.title")}</DialogTitle>
            <div
              id="onboarding-welcome-desc"
              className="text-muted-foreground mt-2 space-y-2 text-sm"
            >
              {[t("welcome.line1"), t("welcome.line2"), t("welcome.line3")].map(
                (line, i) => (
                  <p key={i}>{line}</p>
                )
              )}
            </div>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              className="w-full sm:w-auto"
              onClick={async () => {
                await onWelcomeComplete();
                // No cerrar: el siguiente paso (config) se mostrará al actualizar firstPendingStepId
              }}
            >
              {t("welcome.continue")}
            </Button>
            <Button
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={handleOmitir}
            >
              {t("later")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const stepConfig: Record<
    Exclude<OnboardingStepId, "welcome">,
    {
      title: string;
      description: string;
      primaryHref: string;
      primaryLabel: string;
      secondaryHref?: string;
      secondaryLabel?: string;
    }
  > = {
    config: {
      title: t("step.config.title"),
      description: t("step.config.description"),
      primaryHref: appPath("/settings/account"),
      primaryLabel: t("step.config.primaryLabel"),
      secondaryHref: appPath("/settings/customization"),
      secondaryLabel: t("step.config.secondaryLabel"),
    },
    client: {
      title: t("step.client.title"),
      description: t("step.client.description"),
      primaryHref: appPath("/clients"),
      primaryLabel: t("step.client.primaryLabel"),
    },
    project: {
      title: t("step.project.title"),
      description: t("step.project.description"),
      primaryHref: appPath("/projects"),
      primaryLabel: t("step.project.primaryLabel"),
    },
    "public-profile": {
      title: t("step.publicProfile.title"),
      description: t("step.publicProfile.description"),
      primaryHref: appPath("/settings/customization"),
      primaryLabel: t("step.publicProfile.primaryLabel"),
    },
  };

  const config = stepConfig[stepId];
  if (!config) return null;

  const primaryUrl = buildOnboardingUrl(config.primaryHref, stepId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby={`onboarding-step-desc-${stepId}`}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription id={`onboarding-step-desc-${stepId}`}>
            {config.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button asChild className="w-full sm:w-auto">
            <Link href={primaryUrl} onClick={() => onOpenChange(false)}>
              {config.primaryLabel}
            </Link>
          </Button>
          {config.secondaryHref && config.secondaryLabel && (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link
                href={buildOnboardingUrl(config.secondaryHref, stepId)}
                onClick={() => onOpenChange(false)}
              >
                {config.secondaryLabel}
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={handleOmitir}
          >
            {t("later")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
