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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  type BudgetSortDirection,
  type BudgetSortField,
} from "@/lib/budget-settings";
import type { BudgetProductFieldVisibility } from "@/lib/budget-settings";
import { orderedBudgetPhaseKeys } from "@/lib/project-list-order";
import type { ProjectPhase } from "@/types";

export type BudgetCustomizeSavePayload = {
  notes: string | null;
  settings: BudgetSettings;
};

interface BudgetCustomizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialNotes: string | null | undefined;
  initialSettings: BudgetSettings | null | undefined;
  /** Phase keys present in project budget lines (e.g. design, no_phase). */
  availablePhases?: string[];
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
  availablePhases = [],
  onSave,
  saving = false,
}: BudgetCustomizeDialogProps) {
  const t = useTranslations("DialogBudgetCustomize");
  const tPhase = useTranslations("Phases");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [settings, setSettings] = useState(() =>
    normalizeBudgetSettings(initialSettings)
  );

  const phaseOptions = orderedBudgetPhaseKeys(
    Object.fromEntries(availablePhases.map((phase) => [phase, true]))
  );

  const updateSettings = (patch: Partial<BudgetSettings>) => {
    setSettings((prev) => normalizeBudgetSettings({ ...prev, ...patch }));
  };

  const phaseLabel = (phase: string) =>
    phase === "no_phase" ? t("phaseNoPhase") : tPhase(phase as ProjectPhase);

  const sortFieldLabel = (field: BudgetSortField) => {
    const labels: Record<BudgetSortField, string> = {
      created_at: t("sortFieldCreatedAt"),
      internal_code: t("sortFieldInternalCode"),
      alphabetical: t("sortFieldAlphabetical"),
      supplier: t("sortFieldSupplier"),
    };
    return labels[field];
  };

  const sortDirectionLabel = (direction: BudgetSortDirection) =>
    direction === "asc" ? t("sortDirectionAsc") : t("sortDirectionDesc");

  const productFieldOptions: {
    key: keyof BudgetProductFieldVisibility;
    label: string;
    help: string;
    helpAria: string;
  }[] = [
    {
      key: "model",
      label: t("productFieldModel"),
      help: t("productFieldModelHelp"),
      helpAria: t("productFieldModelHelpAria"),
    },
    {
      key: "supplier",
      label: t("productFieldSupplier"),
      help: t("productFieldSupplierHelp"),
      helpAria: t("productFieldSupplierHelpAria"),
    },
    {
      key: "sku",
      label: t("productFieldSku"),
      help: t("productFieldSkuHelp"),
      helpAria: t("productFieldSkuHelpAria"),
    },
  ];

  const toggleProductField = (
    key: keyof BudgetProductFieldVisibility,
    checked: boolean
  ) => {
    updateSettings({
      product_fields: {
        ...settings.product_fields,
        [key]: checked,
      },
    });
  };

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
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

            <div className="space-y-2">
              <FieldLabelWithInfo
                label={t("phaseFilterLabel")}
                info={t("phaseFilterHelp")}
                infoAriaLabel={t("phaseFilterHelpAria")}
              />
              <Select
                value={settings.phase_filter}
                onValueChange={(value) =>
                  updateSettings({
                    phase_filter: value as BudgetSettings["phase_filter"],
                  })
                }
                disabled={saving}
              >
                <SelectTrigger id="budget-phase-filter">
                  <SelectValue placeholder={t("phaseFilterAll")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("phaseFilterAll")}</SelectItem>
                  {phaseOptions.map((phase) => (
                    <SelectItem key={phase} value={phase}>
                      {phaseLabel(phase)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabelWithInfo
                  label={t("sortFieldLabel")}
                  info={t("sortFieldHelp")}
                  infoAriaLabel={t("sortFieldHelpAria")}
                />
                <Select
                  value={settings.sort_field}
                  onValueChange={(value) =>
                    updateSettings({ sort_field: value as BudgetSortField })
                  }
                  disabled={saving}
                >
                  <SelectTrigger id="budget-sort-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      [
                        "created_at",
                        "internal_code",
                        "alphabetical",
                        "supplier",
                      ] as const
                    ).map((field) => (
                      <SelectItem key={field} value={field}>
                        {sortFieldLabel(field)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <FieldLabelWithInfo
                  label={t("sortDirectionLabel")}
                  info={t("sortDirectionHelp")}
                  infoAriaLabel={t("sortDirectionHelpAria")}
                />
                <Select
                  value={settings.sort_direction}
                  onValueChange={(value) =>
                    updateSettings({
                      sort_direction: value as BudgetSortDirection,
                    })
                  }
                  disabled={saving}
                >
                  <SelectTrigger id="budget-sort-direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["asc", "desc"] as const).map((direction) => (
                      <SelectItem key={direction} value={direction}>
                        {sortDirectionLabel(direction)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabelWithInfo
                label={t("productFieldsLabel")}
                info={t("productFieldsHelp")}
                infoAriaLabel={t("productFieldsHelpAria")}
              />
              {productFieldOptions.map((option) => (
                <div
                  key={option.key}
                  className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`product-field-${option.key}`}
                      checked={settings.product_fields[option.key]}
                      onCheckedChange={(checked) =>
                        toggleProductField(option.key, checked === true)
                      }
                      disabled={saving}
                    />
                    <Label htmlFor={`product-field-${option.key}`}>
                      {option.label}
                    </Label>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground inline-flex items-center"
                        aria-label={option.helpAria}
                      >
                        <CircleHelp className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent variant="tertiary" className="max-w-64">
                      {option.help}
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
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
