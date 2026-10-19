import * as React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type EmptyStateAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: LucideIcon;
};

export type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Why this area matters for the user (value line). */
  value?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  variant?: "card" | "inline";
  className?: string;
  contentClassName?: string;
  "data-onboarding-target"?: string;
};

function ActionControl({
  action,
  primary,
}: {
  action: EmptyStateAction;
  primary: boolean;
}) {
  const Icon = action.icon;
  const content = (
    <>
      {Icon ? <Icon className="mr-2 h-4 w-4" aria-hidden /> : null}
      {action.label}
    </>
  );

  if (action.href) {
    return (
      <Button
        asChild
        variant={primary ? "default" : "link"}
        className={primary ? "mt-4 w-full sm:w-auto" : "mt-2"}
      >
        <Link href={action.href}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={primary ? "default" : "ghost"}
      className={primary ? "mt-4 w-full sm:w-auto" : "mt-2"}
      onClick={action.onClick}
    >
      {content}
    </Button>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  value,
  action,
  secondaryAction,
  variant = "card",
  className,
  contentClassName,
  "data-onboarding-target": dataOnboardingTarget,
}: EmptyStateProps) {
  const body = (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variant === "card" ? "py-12" : "py-6",
        contentClassName
      )}
    >
      <div className="bg-muted rounded-full p-4">
        <Icon className="text-muted-foreground h-8 w-8" aria-hidden />
      </div>
      <h3 className="text-foreground mt-4 font-medium">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">
        {description}
      </p>
      {value ? (
        <p className="text-muted-foreground mt-2 max-w-sm text-sm">{value}</p>
      ) : null}
      {action ? <ActionControl action={action} primary /> : null}
      {secondaryAction ? (
        <ActionControl action={secondaryAction} primary={false} />
      ) : null}
    </div>
  );

  if (variant === "inline") {
    return (
      <div
        className={cn("w-full", className)}
        data-onboarding-target={dataOnboardingTarget}
      >
        {body}
      </div>
    );
  }

  return (
    <Card
      className={cn("border-dashed", className)}
      data-onboarding-target={dataOnboardingTarget}
    >
      <CardContent className="p-0">{body}</CardContent>
    </Card>
  );
}
