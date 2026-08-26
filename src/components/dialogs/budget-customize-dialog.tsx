"use client";

import { useEffect, useState } from "react";
import { CircleHelp, Settings2, ArrowUp, ArrowDown } from "lucide-react";
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
  type BudgetSpaceOption,
  allSpaceOptionIds,
  getSelectedSpaceIds,
  isSensitiveProductDataVisible,
  productFieldsFromSensitiveToggle,
  toStoredVisibleSpaceIds,
} from "@/lib/budget-settings";
import {
  UNASSIGNED_SPACE_KEY,
  BUDGET_PHASE_DISPLAY_ORDER,
} from "@/lib/project-list-order";
import type { ProjectPhase } from "@/types";
import { cn } from "@/lib/utils";

const EMPTY_SPACES: BudgetSpaceOption[] = [];

export type BudgetCustomizeSavePayload = {
  notes: string | null;
  settings: BudgetSettings;
};

interface BudgetCustomizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialNotes: string | null | undefined;
  initialSettings: BudgetSettings | null | undefined;
  /** Phase keys for the filter select. Defaults to all project phases + no_phase. */
  availablePhases?: readonly string[];
  availableSpaces?: BudgetSpaceOption[];
  includeUnassignedSpace?: boolean;
  unassignedSpaceLabel?: string;
  /** Phase filter, sort, field visibility, and space filter (plus/full plans only). */
  customizationEnabled?: boolean;
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
  availablePhases = BUDGET_PHASE_DISPLAY_ORDER,
  availableSpaces = EMPTY_SPACES,
  includeUnassignedSpace = false,
  unassignedSpaceLabel = "General",
  customizationEnabled = true,
  onSave,
  saving = false,
}: BudgetCustomizeDialogProps) {
  const t = useTranslations("DialogBudgetCustomize");
  const tPhase = useTranslations("Phases");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [settings, setSettings] = useState(() =>
    normalizeBudgetSettings(initialSettings)
  );
  const allSpaceIds = allSpaceOptionIds(
    availableSpaces,
    includeUnassignedSpace
  );
  const spaceOptionsKey = [
    ...availableSpaces.map((space) => space.id),
    includeUnassignedSpace ? UNASSIGNED_SPACE_KEY : "",
  ].join("|");
  const [selectedSpaceIds, setSelectedSpaceIds] = useState<string[]>(() =>
    getSelectedSpaceIds(
      normalizeBudgetSettings(initialSettings).visible_space_ids,
      allSpaceOptionIds(availableSpaces, includeUnassignedSpace)
    )
  );

  const phaseOptions = availablePhases;

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

  const setSortDirection = (direction: BudgetSortDirection) => {
    updateSettings({ sort_direction: direction });
  };

  const showSensitiveProductData = isSensitiveProductDataVisible(settings);

  const toggleSensitiveProductData = (checked: boolean) => {
    updateSettings({
      product_fields: productFieldsFromSensitiveToggle(checked),
    });
  };

  const toggleSpaceSelection = (spaceId: string, checked: boolean) => {
    setSelectedSpaceIds((prev) => {
      const next = checked
        ? [...new Set([...prev, spaceId])]
        : prev.filter((id) => id !== spaceId);
      updateSettings({
        visible_space_ids: toStoredVisibleSpaceIds(next, allSpaceIds),
      });
      return next;
    });
  };

  const selectAllSpaces = () => {
    setSelectedSpaceIds(allSpaceIds);
    updateSettings({ visible_space_ids: null });
  };

  const deselectAllSpaces = () => {
    setSelectedSpaceIds([]);
    updateSettings({ visible_space_ids: [] });
  };

  useEffect(() => {
    if (!open) return;
    setNotes(initialNotes ?? "");
    const normalized = normalizeBudgetSettings(initialSettings);
    const spaceIds = allSpaceOptionIds(availableSpaces, includeUnassignedSpace);
    setSettings(normalized);
    setSelectedSpaceIds(
      getSelectedSpaceIds(normalized.visible_space_ids, spaceIds)
    );
  }, [
    open,
    initialNotes,
    initialSettings,
    includeUnassignedSpace,
    spaceOptionsKey,
    availableSpaces,
  ]);

  const tooLong = isBudgetNotesTooLong(notes);

  const handleSave = async () => {
    if (tooLong) return;
    const normalizedSettings = normalizeBudgetSettings(initialSettings);
    await onSave({
      notes: normalizeBudgetNotes(notes),
      settings: customizationEnabled ? settings : normalizedSettings,
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
            {customizationEnabled ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="show-sensitive-product-data"
                      checked={showSensitiveProductData}
                      onCheckedChange={(checked) =>
                        toggleSensitiveProductData(checked === true)
                      }
                      disabled={saving}
                    />
                    <Label htmlFor="show-sensitive-product-data">
                      {t("productFieldsShowLabel")}
                    </Label>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground inline-flex items-center"
                        aria-label={t("productFieldsHelpAria")}
                      >
                        <CircleHelp className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent variant="tertiary" className="max-w-64">
                      {t("productFieldsHelp")}
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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
                        <SelectItem value="all">
                          {t("phaseFilterAll")}
                        </SelectItem>
                        {phaseOptions.map((phase) => (
                          <SelectItem key={phase} value={phase}>
                            {phaseLabel(phase)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <FieldLabelWithInfo
                      label={t("sortFieldLabel")}
                      info={t("sortFieldHelp")}
                      infoAriaLabel={t("sortFieldHelpAria")}
                    />
                    <div className="flex items-stretch">
                      <Select
                        value={settings.sort_field}
                        onValueChange={(value) =>
                          updateSettings({
                            sort_field: value as BudgetSortField,
                          })
                        }
                        disabled={saving}
                      >
                        <SelectTrigger
                          id="budget-sort-field"
                          className="rounded-r-none border-r-0 shadow-none"
                        >
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
                      <div
                        className="border-input flex h-10 shrink-0 overflow-hidden rounded-r-md border"
                        role="group"
                        aria-label={t("sortDirectionLabel")}
                      >
                        {(["asc", "desc"] as const).map((direction) => {
                          const isActive =
                            settings.sort_direction === direction;
                          const Icon =
                            direction === "asc" ? ArrowUp : ArrowDown;
                          return (
                            <Button
                              key={direction}
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-full w-10 rounded-none",
                                isActive &&
                                  "bg-muted text-foreground hover:bg-muted"
                              )}
                              aria-label={sortDirectionLabel(direction)}
                              aria-pressed={isActive}
                              onClick={() => setSortDirection(direction)}
                              disabled={saving}
                            >
                              <Icon className="h-4 w-4" />
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {allSpaceIds.length > 0 ? (
                  <div className="space-y-3">
                    <FieldLabelWithInfo
                      label={t("spacesLabel")}
                      info={t("spacesHelp")}
                      infoAriaLabel={t("spacesHelpAria")}
                    />
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="text-muted-foreground h-auto px-0 text-xs font-normal"
                        onClick={selectAllSpaces}
                        disabled={saving}
                      >
                        {t("spacesSelectAll")}
                      </Button>
                      <span
                        className="bg-border h-3 w-px shrink-0"
                        aria-hidden
                      />
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="text-muted-foreground h-auto px-0 text-xs font-normal"
                        onClick={deselectAllSpaces}
                        disabled={saving}
                      >
                        {t("spacesDeselectAll")}
                      </Button>
                    </div>
                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
                      {includeUnassignedSpace ? (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="space-unassigned"
                            checked={selectedSpaceIds.includes(
                              UNASSIGNED_SPACE_KEY
                            )}
                            onCheckedChange={(checked) =>
                              toggleSpaceSelection(
                                UNASSIGNED_SPACE_KEY,
                                checked === true
                              )
                            }
                            disabled={saving}
                          />
                          <Label htmlFor="space-unassigned">
                            {unassignedSpaceLabel}
                          </Label>
                        </div>
                      ) : null}
                      {availableSpaces.map((space) => (
                        <div key={space.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`space-${space.id}`}
                            checked={selectedSpaceIds.includes(space.id)}
                            onCheckedChange={(checked) =>
                              toggleSpaceSelection(space.id, checked === true)
                            }
                            disabled={saving}
                          />
                          <Label htmlFor={`space-${space.id}`}>
                            {space.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}

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
