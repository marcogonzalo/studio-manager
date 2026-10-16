"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { SupportForm } from "./support-form";
import type { SupportReason } from "@/lib/support/reasons";

export type SupportFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultReason: SupportReason;
  defaultName?: string;
  defaultEmail?: string;
  contextPath?: string;
  contextPlanCode?: string;
};

export function SupportFormDialog({
  open,
  onOpenChange,
  defaultReason,
  defaultName,
  defaultEmail,
  contextPath,
  contextPlanCode,
}: SupportFormDialogProps) {
  const t = useTranslations("SupportForm");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>
        {open ? (
          <SupportForm
            key={defaultReason}
            defaultReason={defaultReason}
            defaultName={defaultName}
            defaultEmail={defaultEmail}
            contextPath={contextPath}
            contextPlanCode={contextPlanCode}
            variant="app"
            onSuccess={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
