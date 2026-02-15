"use client";

import { useState, useEffect } from "react";
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

const OPTIONS: {
  value: BudgetPrintOption;
  label: string;
  description: string;
}[] = [
  {
    value: "full",
    label: "Presupuesto completo",
    description: "Productos y partidas de presupuesto",
  },
  {
    value: "products",
    label: "Solo productos",
    description: "Solo mobiliario y productos por ubicación",
  },
  {
    value: "lines",
    label: "Solo partidas",
    description: "Solo servicios y partidas de presupuesto",
  },
];

interface BudgetPrintOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (option: BudgetPrintOption) => void;
  isGenerating?: boolean;
  /** Si false (plan base), solo se permite "Presupuesto completo". "Solo productos" y "Solo partidas" quedan deshabilitados. */
  pdfExportFull?: boolean;
}

export function BudgetPrintOptionsDialog({
  open,
  onOpenChange,
  onConfirm,
  isGenerating = false,
  pdfExportFull = true,
}: BudgetPrintOptionsDialogProps) {
  const [selected, setSelected] = useState<BudgetPrintOption>("full");

  useEffect(() => {
    if (open && !pdfExportFull) setSelected("full");
  }, [open, pdfExportFull]);

  const handleConfirm = () => {
    const valueToSend =
      !pdfExportFull && selected !== "full" ? "full" : selected;
    onConfirm(valueToSend);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Opciones al exportar presupuesto</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {OPTIONS.map((opt) => {
            const isDisabled =
              !pdfExportFull &&
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
                      Mejora tu plan para exportar por productos o partidas.
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
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isGenerating}>
            <Printer className="mr-2 h-4 w-4" />
            {isGenerating ? "Generando..." : "Generar PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
