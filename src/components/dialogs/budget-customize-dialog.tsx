"use client";

import { useEffect, useState } from "react";
import { CircleHelp, Settings2 } from "lucide-react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BUDGET_NOTES_MAX_LENGTH,
  isBudgetNotesTooLong,
  normalizeBudgetNotes,
} from "@/lib/budget-notes";
import {
  normalizeBudgetSettings,
  type BudgetSettings,
} from "@/lib/budget-settings";

export type BudgetCustomizeSavePayload = {
  notes: string | null;
  settings: BudgetSettings;
};

interface BudgetCustomizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialNotes: string | null | undefined;
  initialSettings: BudgetSettings | null | undefined;
  onSave: (payload: BudgetCustomizeSavePayload) => Promise<void> | void;
  saving?: boolean;
}

function FieldLabelWithInfo({
  htmlFor,
  label,
  info,
  infoAriaLabel,
}: {
  htmlFor?: string;
  label: string;
  info: string;
  infoAriaLabel: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground inline-flex items-center"
            aria-label={infoAriaLabel}
          >
            <CircleHelp className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent variant="tertiary" className="max-w-64">
          {info}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export function BudgetCustomizeDialog({
  open,
  onOpenChange,
  initialNotes,
  initialSettings,
  onSave,
  saving = false,
}: BudgetCustomizeDialogProps) {
  const t = useTranslations("DialogBudgetCustomize");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [settings, setSettings] = useState(() =>
    normalizeBudgetSettings(initialSettings)
  );

  useEffect(() => {
    if (open) {
      setNotes(initialNotes ?? "");
      setSettings(normalizeBudgetSettings(initialSettings));
    }
  }, [open, initialNotes, initialSettings]);

  const tooLong = isBudgetNotesTooLong(notes);

  const handleSave = async () => {
    if (tooLong) return;
    await onSave({
      notes: normalizeBudgetNotes(notes),
      settings,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" aria-hidden />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <TooltipProvider>
          <div className="space-y-6 py-2">
            <div className="space-y-2">
              <FieldLabelWithInfo
                htmlFor="budget-notes"
                label={t("notesLabel")}
                info={t("notesHelp")}
                infoAriaLabel={t("notesHelpAria")}
              />
              <Textarea
                id="budget-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("notesPlaceholder")}
                rows={6}
                maxLength={BUDGET_NOTES_MAX_LENGTH + 1}
                disabled={saving}
                className="min-h-[8rem] resize-y font-mono text-sm"
              />
              <p className="text-muted-foreground text-xs">
                {t("charCount", {
                  count: notes.length,
                  max: BUDGET_NOTES_MAX_LENGTH,
                })}
              </p>
              {tooLong && (
                <p className="text-destructive text-xs">{t("tooLong")}</p>
              )}
            </div>
          </div>
        </TooltipProvider>
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
