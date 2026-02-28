"use client";

import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OnboardingStepStatus } from "@/lib/onboarding";

export interface OnboardingChecklistProps {
  steps: OnboardingStepStatus[];
  /** Exclude welcome from count and list */
  className?: string;
}

export function OnboardingChecklist({
  steps,
  className,
}: OnboardingChecklistProps) {
  const listSteps = steps.filter((s) => s.id !== "welcome");
  if (listSteps.length === 0) return null;

  const completedCount = listSteps.filter((s) => s.completed).length;
  const total = listSteps.length;
  const allComplete = completedCount === total;
  if (allComplete) return null;

  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Completa tu configuración ({completedCount}/{total})
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Sigue estos pasos para sacar el máximo partido a Veta.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {listSteps.map((step) => (
            <li key={step.id}>
              <Link
                href={step.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  step.completed
                    ? "text-muted-foreground"
                    : "hover:bg-primary/10 text-foreground"
                )}
              >
                {step.completed ? (
                  <Check
                    className="text-primary h-5 w-5 shrink-0"
                    aria-hidden
                  />
                ) : (
                  <Circle
                    className="text-muted-foreground h-5 w-5 shrink-0"
                    aria-hidden
                  />
                )}
                <span className={step.completed ? "line-through" : undefined}>
                  {step.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
