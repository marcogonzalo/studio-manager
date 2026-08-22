"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  BUDGET_NOTES_MAX_LENGTH,
  isBudgetNotesTooLong,
  normalizeBudgetNotes,
} from "@/lib/budget-notes";

interface BudgetNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialNotes: string | null | undefined;
  onSave: (notes: string | null) => Promise<void> | void;
  saving?: boolean;
}

export function BudgetNotesDialog({
  open,
  onOpenChange,
  initialNotes,
  onSave,
  saving = false,
}: BudgetNotesDialogProps) {
  const t = useTranslations("DialogBudgetNotes");
  const [value, setValue] = useState(initialNotes ?? "");

  useEffect(() => {
    if (open) setValue(initialNotes ?? "");
  }, [open, initialNotes]);

  const tooLong = isBudgetNotesTooLong(value);

  const handleSave = async () => {
    if (tooLong) return;
    await onSave(normalizeBudgetNotes(value));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="budget-notes">{t("notesLabel")}</Label>
          <Textarea
            id="budget-notes"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t("notesPlaceholder")}
            rows={8}
            maxLength={BUDGET_NOTES_MAX_LENGTH + 1}
            disabled={saving}
            className="min-h-[10rem] resize-y font-mono text-sm"
          />
          <p className="text-muted-foreground text-xs">
            {t("charCount", {
              count: value.length,
              max: BUDGET_NOTES_MAX_LENGTH,
            })}
          </p>
          {tooLong && (
            <p className="text-destructive text-xs">{t("tooLong")}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving || tooLong}>
            {saving ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
