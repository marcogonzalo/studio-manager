"use client";

import { useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ImportTarget } from "@/lib/budget-import/fields";
import {
  buildCsvTemplate,
  buildXlsxTemplate,
  downloadBlob,
  type TemplateLocale,
} from "@/lib/budget-import/template";
import { fieldNotesForTemplate } from "@/lib/budget-import/help-content";
import { FIELD_LABEL_I18N } from "./field-label-map";
import type { BudgetCategory, ProjectPhase } from "@/types";

export function useTemplateDownload() {
  const locale = useLocale() as TemplateLocale;
  const t = useTranslations("ProjectModuleBudget");
  const tCat = useTranslations("ProjectModuleBudget.budgetCategory");
  const tSub = useTranslations("ProjectModuleBudget.budgetSubcategory");
  const tPhase = useTranslations("DialogProject");

  const translateLabel = useCallback(
    (labelKey: string) => {
      const i18nKey = FIELD_LABEL_I18N[labelKey] ?? labelKey;
      return t(i18nKey as never);
    },
    [t]
  );

  const translateCategory = useCallback(
    (key: string) => tCat(key as BudgetCategory),
    [tCat]
  );

  const translateSubcategory = useCallback(
    (category: string, key: string) => tSub(`${category}.${key}` as never),
    [tSub]
  );

  const translatePhase = useCallback(
    (key: string) => {
      const map: Record<ProjectPhase, string> = {
        diagnosis: "phaseDiagnosis",
        design: "phaseDesign",
        executive: "phaseExecutive",
        budget: "phaseBudget",
        construction: "phaseConstruction",
        delivery: "phaseDelivery",
      };
      return tPhase(map[key as ProjectPhase] as never);
    },
    [tPhase]
  );

  const download = useCallback(
    async (target: ImportTarget, format: "csv" | "xlsx") => {
      const fieldNotes = (field: Parameters<typeof fieldNotesForTemplate>[0]) =>
        fieldNotesForTemplate(field, locale);

      if (format === "csv") {
        const csv = buildCsvTemplate({
          target,
          locale,
          translateLabel,
        });
        downloadBlob(
          csv.filename,
          new Blob([csv.content], { type: csv.mimeType })
        );
        return;
      }

      const xlsx = await buildXlsxTemplate({
        target,
        locale,
        translateLabel,
        translateCategory,
        translateSubcategory,
        translatePhase,
        fieldNotes,
      });
      downloadBlob(
        xlsx.filename,
        new Blob([xlsx.buffer], { type: xlsx.mimeType })
      );
    },
    [
      locale,
      translateLabel,
      translateCategory,
      translateSubcategory,
      translatePhase,
    ]
  );

  return { download, translateLabel, locale };
}
