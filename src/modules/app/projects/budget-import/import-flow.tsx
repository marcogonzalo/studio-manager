"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { appPath } from "@/lib/app-paths";
import type { ImportTarget } from "@/lib/budget-import/fields";
import { fieldsForTarget } from "@/lib/budget-import/fields";
import {
  autoMapColumns,
  type ColumnMapping,
} from "@/lib/budget-import/auto-map";
import {
  parseImportFile,
  rowsToObjects,
  type ParsedSheet,
} from "@/lib/budget-import/parse-file";
import {
  buildNameMap,
  resolveRows,
  type ResolvedBudgetLineRow,
  type ResolvedProductRow,
} from "@/lib/budget-import/resolve-row";
import {
  buildErrorReportCsv,
  validateBudgetLineRows,
  validateProductRows,
} from "@/lib/budget-import/validate-rows";
import { importBudgetRows } from "@/app/actions/import-budget-rows";
import { BUDGET_CATEGORY_KEYS } from "@/lib/budget-import/fields";
import type { BudgetCategory, ProjectPhase } from "@/types";
import { BudgetImportHelp } from "./budget-import-help";
import { FIELD_LABEL_I18N } from "./field-label-map";
import { useTemplateDownload } from "./use-template-download";
import { downloadBlob } from "@/lib/budget-import/template";

type Step = "upload" | "mapping" | "preview" | "confirm";

export type ImportFlowProps = {
  projectId: string;
  spaces: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  taxAppliesToProject: boolean;
  onDone: (counts: {
    created: number;
    skipped: number;
    spaces_created: number;
    suppliers_created: number;
  }) => void;
  onCancel?: () => void;
};

export function ImportFlow({
  projectId,
  spaces,
  suppliers,
  taxAppliesToProject,
  onDone,
  onCancel,
}: ImportFlowProps) {
  const t = useTranslations("ProjectModuleBudget");
  const tCat = useTranslations("ProjectModuleBudget.budgetCategory");
  const tSub = useTranslations("ProjectModuleBudget.budgetSubcategory");
  const tPhase = useTranslations("DialogProject");
  const { download } = useTemplateDownload();

  const [step, setStep] = useState<Step>("upload");
  const [target, setTarget] = useState<ImportTarget>("product");
  const [sheets, setSheets] = useState<ParsedSheet[]>([]);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [skipInvalid, setSkipInvalid] = useState(true);
  const [createCatalog, setCreateCatalog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [categoryOverrides, setCategoryOverrides] = useState<
    Record<number, BudgetCategory>
  >({});
  const [bulkCategory, setBulkCategory] =
    useState<BudgetCategory>("construction");
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const sheet = sheets[sheetIndex];

  const lookup = useMemo(
    () => ({
      spacesByName: buildNameMap(spaces),
      suppliersByName: buildNameMap(suppliers),
    }),
    [spaces, suppliers]
  );

  const translateCategory = useCallback(
    (key: BudgetCategory) => tCat(key),
    [tCat]
  );
  const translateSubcategory = useCallback(
    (category: BudgetCategory, key: string) =>
      tSub(`${category}.${key}` as never),
    [tSub]
  );
  const translatePhase = useCallback(
    (key: ProjectPhase) => {
      const map: Record<ProjectPhase, string> = {
        diagnosis: "phaseDiagnosis",
        design: "phaseDesign",
        executive: "phaseExecutive",
        budget: "phaseBudget",
        construction: "phaseConstruction",
        delivery: "phaseDelivery",
      };
      return tPhase(map[key] as never);
    },
    [tPhase]
  );

  const onFile = useCallback(
    async (file: File | null) => {
      if (!file || isParsing) return;
      setIsParsing(true);
      try {
        const parsed = await parseImportFile(file);
        if (!parsed.ok) {
          toast.error(t("importError"));
          return;
        }
        setSheets(parsed.sheets);
        setSheetIndex(0);
        const first = parsed.sheets[0];
        const mapped = autoMapColumns({ headers: first.headers, target });
        setMappings(mapped.mappings);
        setStep("mapping");
      } finally {
        setIsParsing(false);
        setIsDragging(false);
      }
    },
    [isParsing, t, target]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (isParsing) return;
      const file = e.dataTransfer.files[0];
      if (file) void onFile(file);
    },
    [isParsing, onFile]
  );

  const remappedRequired = useMemo(() => {
    const used = new Set(
      mappings.map((m) => m.fieldKey).filter(Boolean) as string[]
    );
    return fieldsForTarget(target)
      .filter((f) => f.required === "always" && !used.has(f.key))
      .map((f) => f.key);
  }, [mappings, target]);

  const sources = useMemo(() => {
    if (!sheet) return [];
    return rowsToObjects(sheet.headers, sheet.rows);
  }, [sheet]);

  const resolved = useMemo(() => {
    if (!sheet) return [];
    const rows = resolveRows({
      target,
      sources,
      mappings,
      lookup,
      translateCategory,
      translateSubcategory,
      translatePhase,
    });
    if (target === "budget_line") {
      return (rows as ResolvedBudgetLineRow[]).map((row, index) => {
        const override = categoryOverrides[index];
        if (!override) return row;
        return {
          ...row,
          category: override,
          subcategory: "other",
          needsCategory: false,
          errors: row.errors.filter(
            (e) => e !== "needs_category" && e !== "category_unmatched"
          ),
        };
      });
    }
    return rows;
  }, [
    sheet,
    target,
    sources,
    mappings,
    lookup,
    translateCategory,
    translateSubcategory,
    translatePhase,
    categoryOverrides,
  ]);

  const validations = useMemo(() => {
    if (target === "product") {
      return validateProductRows(resolved as ResolvedProductRow[], (k) => k);
    }
    return validateBudgetLineRows(
      resolved as ResolvedBudgetLineRow[],
      (k) => k
    );
  }, [resolved, target]);

  const validCount = validations.filter((v) => v.ok).length;
  const errorCount = validations.filter((v) => !v.ok).length;
  const spacesToCreate = resolved.filter(
    (r) =>
      r.target === "product" &&
      (r as ResolvedProductRow).space.status === "create"
  ).length;
  const suppliersToCreate = resolved.filter((r) => {
    const supplier =
      r.target === "product"
        ? (r as ResolvedProductRow).supplier
        : (r as ResolvedBudgetLineRow).supplier;
    return supplier.status === "create";
  }).length;

  const canConfirm =
    (skipInvalid ? validCount > 0 : errorCount === 0 && validCount > 0) &&
    (target !== "budget_line" ||
      (resolved as ResolvedBudgetLineRow[]).every((r) => !r.needsCategory));

  const submit = async () => {
    setSubmitting(true);
    try {
      const rows = validations
        .filter((v) => v.ok && v.data)
        .map((v) => v.data as Record<string, unknown>);
      if (rows.length === 0) {
        toast.error(t("importError"));
        return;
      }
      const result = await importBudgetRows({
        importId: crypto.randomUUID(),
        projectId,
        target,
        createCatalog,
        rows,
      });
      if (!result.ok) {
        toast.error(
          result.code === "DEMO_ACCOUNT_READ_ONLY"
            ? t("importDemoBlocked")
            : t("importError")
        );
        return;
      }
      toast.success(
        t("importSuccess", {
          created: result.created,
          skipped: result.skipped,
        })
      );
      onDone(result);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
        <span
          className={step === "upload" ? "text-foreground font-medium" : ""}
        >
          {t("importStepUpload")}
        </span>
        <span>/</span>
        <span
          className={step === "mapping" ? "text-foreground font-medium" : ""}
        >
          {t("importStepMapping")}
        </span>
        <span>/</span>
        <span
          className={step === "preview" ? "text-foreground font-medium" : ""}
        >
          {t("importStepPreview")}
        </span>
        <span>/</span>
        <span
          className={step === "confirm" ? "text-foreground font-medium" : ""}
        >
          {t("importStepConfirm")}
        </span>
        <Button
          type="button"
          variant="link"
          className="ml-auto h-auto p-0"
          onClick={() => setHelpOpen(true)}
        >
          {t("howToFillTemplate")}
        </Button>
      </div>

      {step === "upload" && (
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>{t("importTargetLabel")}</Label>
            <Select
              value={target}
              onValueChange={(v) => setTarget(v as ImportTarget)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">
                  {t("importTargetProducts")}
                </SelectItem>
                <SelectItem value="budget_line">
                  {t("importTargetBudgetLines")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isParsing) setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            className={cn(
              "relative flex min-h-[100px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
              "bg-muted/30 border-muted-foreground/25",
              isDragging && "border-primary bg-primary/5",
              isParsing && "pointer-events-none opacity-60",
              !isParsing && "hover:border-primary/50 cursor-pointer"
            )}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              aria-label={t("importSelectFile")}
              disabled={isParsing}
              onChange={(e) => {
                void onFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
              className="absolute inset-0 z-10 cursor-pointer opacity-0"
            />
            {isParsing ? (
              <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                <Loader2 className="text-muted-foreground h-10 w-10 animate-spin" />
                <p className="text-muted-foreground text-sm">
                  {t("importParsing")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                <FileSpreadsheet className="text-muted-foreground h-10 w-10" />
                <div className="text-muted-foreground text-sm">
                  <p className="font-medium">{t("importDropFile")}</p>
                  <p>{t("importClickToSelect")}</p>
                </div>
                <p className="text-muted-foreground/80 text-xs">
                  {t("importFormats")}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void download(target, "xlsx")}
            >
              {t("downloadTemplate")}
            </Button>
            <Button type="button" variant="link" asChild className="h-auto p-0">
              <Link href={appPath("/help/budget-import")}>
                {t("howToFillTemplate")}
              </Link>
            </Button>
          </div>
        </div>
      )}

      {step === "mapping" && sheet && (
        <div className="space-y-4">
          {sheets.length > 1 && (
            <div className="grid gap-2">
              <Label>{t("importSheetLabel")}</Label>
              <Select
                value={String(sheetIndex)}
                onValueChange={(v) => {
                  const idx = Number(v);
                  setSheetIndex(idx);
                  setMappings(
                    autoMapColumns({
                      headers: sheets[idx].headers,
                      target,
                    }).mappings
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sheets.map((s, i) => (
                    <SelectItem key={s.name} value={String(i)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {mappings.map((mapping, index) => (
              <div
                key={`${mapping.sourceHeader}-${index}`}
                className="grid grid-cols-2 items-center gap-2"
              >
                <span className="truncate text-sm">{mapping.sourceHeader}</span>
                <Select
                  value={mapping.fieldKey ?? "__ignore__"}
                  onValueChange={(v) => {
                    setMappings((prev) =>
                      prev.map((m, i) =>
                        i === index
                          ? {
                              ...m,
                              fieldKey: v === "__ignore__" ? null : v,
                              confidence: "exact",
                            }
                          : m
                      )
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__ignore__">
                      {t("importIgnoreColumn")}
                    </SelectItem>
                    {fieldsForTarget(target).map((f) => (
                      <SelectItem key={f.key} value={f.key}>
                        {t(
                          (FIELD_LABEL_I18N[f.labelKey] ?? f.labelKey) as never
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          {remappedRequired.length > 0 && (
            <p className="text-destructive text-sm">
              {t("importRequiredUnmapped")}
            </p>
          )}
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm">
            {t("importPreviewErrors", { count: errorCount })}
          </p>
          <div className="flex items-center gap-2">
            <Checkbox
              id="skip-invalid"
              checked={skipInvalid}
              onCheckedChange={(v) => setSkipInvalid(v === true)}
            />
            <Label htmlFor="skip-invalid">{t("importSkipInvalid")}</Label>
          </div>
          {target === "budget_line" && (
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={bulkCategory}
                onValueChange={(v) => setBulkCategory(v as BudgetCategory)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_CATEGORY_KEYS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {tCat(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const next: Record<number, BudgetCategory> = {
                    ...categoryOverrides,
                  };
                  (resolved as ResolvedBudgetLineRow[]).forEach((row, i) => {
                    if (row.needsCategory) next[i] = bulkCategory;
                  });
                  setCategoryOverrides(next);
                }}
              >
                {t("importApplyCategoryAll")}
              </Button>
            </div>
          )}
          <div className="border-border max-h-64 overflow-auto rounded-md border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Data</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {resolved.slice(0, 20).map((row, i) => {
                  const validation = validations[i];
                  const label =
                    row.target === "product"
                      ? (row as ResolvedProductRow).name
                      : (row as ResolvedBudgetLineRow).description ||
                        (row as ResolvedBudgetLineRow).category ||
                        "—";
                  return (
                    <tr
                      key={i}
                      className={
                        validation?.ok ? undefined : "bg-destructive/10"
                      }
                    >
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2">
                        {label}
                        {row.target === "product" &&
                          (row as ResolvedProductRow).space.status ===
                            "create" && (
                            <span className="bg-primary/10 ml-2 rounded px-1">
                              {t("importNewBadge")} space
                            </span>
                          )}
                        {((row.target === "product" &&
                          (row as ResolvedProductRow).supplier.status ===
                            "create") ||
                          (row.target === "budget_line" &&
                            (row as ResolvedBudgetLineRow).supplier.status ===
                              "create")) && (
                          <span className="bg-primary/10 ml-2 rounded px-1">
                            {t("importNewBadge")} supplier
                          </span>
                        )}
                        {row.target === "budget_line" &&
                          (row as ResolvedBudgetLineRow).needsCategory && (
                            <Select
                              value={categoryOverrides[i] ?? ""}
                              onValueChange={(v) =>
                                setCategoryOverrides((prev) => ({
                                  ...prev,
                                  [i]: v as BudgetCategory,
                                }))
                              }
                            >
                              <SelectTrigger className="mt-1 h-8">
                                <SelectValue
                                  placeholder={t("importNeedsCategory")}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {BUDGET_CATEGORY_KEYS.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {tCat(c)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                      </td>
                      <td className="p-2">
                        {validation?.ok ? "OK" : validation?.errors.join(", ")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {errorCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const csv = buildErrorReportCsv(validations);
                downloadBlob(
                  "veta-import-errors.csv",
                  new Blob([csv], { type: "text/csv;charset=utf-8" })
                );
              }}
            >
              {t("importDownloadErrors")}
            </Button>
          )}
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-4">
          <p className="text-sm">
            {t("importConfirmSummary", {
              created: skipInvalid ? validCount : resolved.length,
              spaces: spacesToCreate,
              suppliers: suppliersToCreate,
            })}
          </p>
          {target === "product" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="create-catalog"
                  checked={createCatalog}
                  onCheckedChange={(v) => setCreateCatalog(v === true)}
                />
                <Label htmlFor="create-catalog">
                  {t("importCreateCatalog")}
                </Label>
              </div>
              <p className="text-muted-foreground text-xs">
                {t("importCreateCatalogHint")}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="border-border flex flex-wrap justify-end gap-2 border-t pt-4">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t("importCancel")}
          </Button>
        )}
        {step !== "upload" && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (step === "mapping") setStep("upload");
              if (step === "preview") setStep("mapping");
              if (step === "confirm") setStep("preview");
            }}
          >
            {t("importBack")}
          </Button>
        )}
        {step === "mapping" && (
          <Button
            type="button"
            disabled={remappedRequired.length > 0}
            onClick={() => setStep("preview")}
          >
            {t("importNext")}
          </Button>
        )}
        {step === "preview" && (
          <Button
            type="button"
            disabled={!canConfirm}
            onClick={() => setStep("confirm")}
          >
            {t("importNext")}
          </Button>
        )}
        {step === "confirm" && (
          <Button
            type="button"
            disabled={submitting}
            onClick={() => void submit()}
          >
            {t("importConfirm")}
          </Button>
        )}
      </div>

      <Sheet open={helpOpen} onOpenChange={setHelpOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{t("howToFillTemplate")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <BudgetImportHelp taxAppliesToProject={taxAppliesToProject} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
