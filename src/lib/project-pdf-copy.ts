import type { Locale } from "@/i18n/config";
import en from "@/i18n/messages/en/app-common.json";
import es from "@/i18n/messages/es/app-common.json";
import type { BudgetCategory, ProjectPhase } from "@/types";

type CommonMessages = typeof es;
type PdfCopy = CommonMessages["ProjectPDF"];

const MESSAGES: Record<Locale, CommonMessages> = {
  en,
  es,
};

export function interpolatePdfCopy(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] === undefined ? `{${key}}` : String(vars[key])
  );
}

export function getProjectPdfCopy(lang: Locale): PdfCopy {
  return (MESSAGES[lang] ?? MESSAGES.es).ProjectPDF;
}

export function getPdfCategoryLabel(
  category: BudgetCategory,
  lang: Locale
): string {
  const labels = (MESSAGES[lang] ?? MESSAGES.es).BudgetCategory;
  return labels[category] ?? category;
}

export function getPdfSubcategoryLabel(
  category: BudgetCategory,
  subcategory: string,
  lang: Locale
): string {
  const groups = (MESSAGES[lang] ?? MESSAGES.es).BudgetSubcategory;
  const group = groups[category] as Record<string, string> | undefined;
  return group?.[subcategory] ?? subcategory;
}

export function getPdfPhaseLabel(
  phase: ProjectPhase | "no_phase",
  lang: Locale
): string {
  if (phase === "no_phase") return getProjectPdfCopy(lang).noPhase;
  const labels = (MESSAGES[lang] ?? MESSAGES.es).Phases;
  return labels[phase] ?? phase;
}
