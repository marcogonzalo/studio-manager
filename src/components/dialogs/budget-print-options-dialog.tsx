"use client";

import { useState } from "react";
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
}

export function BudgetPrintOptionsDialog({
  open,
  onOpenChange,
  onConfirm,
  isGenerating = false,
}: BudgetPrintOptionsDialogProps) {
  const [selected, setSelected] = useState<BudgetPrintOption>("full");

  const handleConfirm = () => {
    onConfirm(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Opciones al exportar presupuesto</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="hover:bg-accent/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex cursor-pointer items-start gap-3 rounded-lg border p-3"
            >
              <input
                type="radio"
                name="print-option"
                value={opt.value}
                checked={selected === opt.value}
                onChange={() => setSelected(opt.value)}
                className="mt-1 h-4 w-4"
              />
              <div>
                <span className="font-medium">{opt.label}</span>
                <p className="text-muted-foreground text-sm">
                  {opt.description}
                </p>
              </div>
            </label>
          ))}
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
