"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { appPath } from "@/lib/app-paths";
import type { OnboardingStepId } from "@/lib/onboarding";

export interface OnboardingStepModalProps {
  stepId: OnboardingStepId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOmitir: () => void;
  onWelcomeComplete: () => Promise<void>;
  /** Seeded sample project for "See an example first" (#233). */
  sampleProjectId?: string | null;
}

/**
 * Welcome-only modal (#213). Activation steps live on the dashboard checklist.
 */
export function OnboardingStepModal({
  stepId,
  open,
  onOpenChange,
  onOmitir,
  onWelcomeComplete,
  sampleProjectId = null,
}: OnboardingStepModalProps) {
  const t = useTranslations("Onboarding");

  if (stepId !== "welcome") return null;

  const handleOmitir = () => {
    onOmitir();
    onOpenChange(false);
  };

  const markWelcomeSeen = () => {
    void onWelcomeComplete();
    onOpenChange(false);
  };

  const createProjectUrl = `${appPath("/projects")}?onboarding=create-project`;
  const exampleUrl = sampleProjectId
    ? appPath(`/projects/${sampleProjectId}`)
    : null;

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
            <p>{t("welcome.line1")}</p>
            <p>{t("welcome.line2")}</p>
          </div>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={handleOmitir}>
            {t("later")}
          </Button>
          {exampleUrl && (
            <Button asChild variant="outline">
              <Link href={exampleUrl} onClick={markWelcomeSeen}>
                {t("seeExample")}
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href={createProjectUrl} onClick={markWelcomeSeen}>
              {t("welcome.continue")}
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
