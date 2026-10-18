"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronDown, Circle, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { appPath } from "@/lib/app-paths";
import type { OnboardingStepStatus } from "@/lib/onboarding";

export interface OnboardingChecklistProps {
  primarySteps: OnboardingStepStatus[];
  secondarySteps: OnboardingStepStatus[];
  sampleProjectId: string | null;
  onDismiss: () => void | Promise<void>;
  className?: string;
}

function StepList({
  steps,
  t,
}: {
  steps: OnboardingStepStatus[];
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <ul className="space-y-2">
      {steps.map((step) => (
        <li key={step.id}>
          <Link
            href={step.href}
            className={cn(
              "flex items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              step.completed
                ? "text-muted-foreground"
                : "hover:bg-primary/10 text-foreground"
            )}
          >
            {step.completed ? (
              <Check
                className="text-primary mt-0.5 h-5 w-5 shrink-0"
                aria-hidden
              />
            ) : (
              <Circle
                className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0"
                aria-hidden
              />
            )}
            <span className="min-w-0">
              <span
                className={cn(
                  "block font-medium",
                  step.completed && "line-through"
                )}
              >
                {t(`steps.${step.id}`)}
              </span>
              {!step.completed && (
                <span className="text-muted-foreground block text-xs">
                  {t(`why.${step.id}`)}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function OnboardingChecklist({
  primarySteps,
  secondarySteps,
  sampleProjectId,
  onDismiss,
  className,
}: OnboardingChecklistProps) {
  const t = useTranslations("Onboarding");
  const [secondaryOpen, setSecondaryOpen] = useState(false);

  if (primarySteps.length === 0) return null;

  const completedCount = primarySteps.filter((s) => s.completed).length;
  const total = primarySteps.length;
  const progressPct = Math.round((completedCount / total) * 100);

  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-lg">
              {t("checklistTitle", { completed: completedCount, total })}
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("checklistDescription")}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground shrink-0"
            onClick={() => void onDismiss()}
          >
            <EyeOff className="mr-1 h-4 w-4" aria-hidden />
            {t("hideChecklist")}
          </Button>
        </div>
        <div
          className="bg-muted mt-3 h-2 w-full overflow-hidden rounded-full"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("checklistTitle", { completed: completedCount, total })}
        >
          <div
            className="bg-primary h-full transition-[width]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <StepList steps={primarySteps} t={t} />

        {sampleProjectId && (
          <p className="text-sm">
            <Link
              href={appPath(`/projects/${sampleProjectId}`)}
              className="text-primary font-medium underline underline-offset-2"
            >
              {t("seeExample")}
            </Link>
          </p>
        )}

        {secondarySteps.length > 0 && (
          <Collapsible open={secondaryOpen} onOpenChange={setSecondaryOpen}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground w-full justify-between px-3"
              >
                {t("secondaryTitle")}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    secondaryOpen && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <StepList steps={secondarySteps} t={t} />
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
