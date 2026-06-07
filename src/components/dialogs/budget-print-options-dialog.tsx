"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export type BudgetPrintOption = "full" | "products" | "lines";

interface BudgetPrintOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (option: BudgetPrintOption) => void;
  isGenerating?: boolean;
  /** Si false, solo se permite exportación completa; productos y partidas quedan deshabilitados. */
  printFilterOptionsEnabled?: boolean;
}

export function BudgetPrintOptionsDialog({
  open,
  onOpenChange,
  onConfirm,
  isGenerating = false,
  printFilterOptionsEnabled = true,
}: BudgetPrintOptionsDialogProps) {
  const t = useTranslations("DialogBudgetPrintOptions");
  const [selected, setSelected] = useState<BudgetPrintOption>("full");

  const options: {
    value: BudgetPrintOption;
    label: string;
    description: string;
  }[] = [
    {
      value: "full",
      label: t("optionFullLabel"),
      description: t("optionFullDescription"),
    },
    {
      value: "products",
      label: t("optionProductsLabel"),
      description: t("optionProductsDescription"),
    },
    {
      value: "lines",
      label: t("optionLinesLabel"),
      description: t("optionLinesDescription"),
    },
  ];

  useEffect(() => {
    if (open && !printFilterOptionsEnabled) setSelected("full");
  }, [open, printFilterOptionsEnabled]);

  const handleConfirm = () => {
    const valueToSend =
      !printFilterOptionsEnabled && selected !== "full" ? "full" : selected;
    onConfirm(valueToSend);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {options.map((opt) => {
            const isDisabled =
              !printFilterOptionsEnabled &&
              (opt.value === "products" || opt.value === "lines");
            return (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                  isDisabled
                    ? "cursor-not-allowed opacity-60"
                    : "hover:bg-accent/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                }`}
              >
                <input
                  type="radio"
                  name="print-option"
                  value={opt.value}
                  checked={selected === opt.value}
                  onChange={() => !isDisabled && setSelected(opt.value)}
                  disabled={isDisabled}
                  className="mt-1 h-4 w-4"
                />
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{opt.label}</span>
                  <p className="text-muted-foreground text-sm">
                    {opt.description}
                  </p>
                  {isDisabled && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      {t("upgradeHint")}
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            {t("cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={isGenerating}>
            <Printer className="mr-2 h-4 w-4" />
            {isGenerating ? t("generating") : t("generatePdf")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
