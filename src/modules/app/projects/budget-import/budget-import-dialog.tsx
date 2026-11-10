"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { ImportFlow } from "./import-flow";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  spaces: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  taxAppliesToProject: boolean;
  onImported: () => void;
};

export function BudgetImportDialog({
  open,
  onOpenChange,
  projectId,
  spaces,
  suppliers,
  taxAppliesToProject,
  onImported,
}: Props) {
  const t = useTranslations("ProjectModuleBudget");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("importDialogTitle")}</DialogTitle>
        </DialogHeader>
        <ImportFlow
          projectId={projectId}
          spaces={spaces}
          suppliers={suppliers}
          taxAppliesToProject={taxAppliesToProject}
          onCancel={() => onOpenChange(false)}
          onDone={() => {
            onOpenChange(false);
            onImported();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
