import type { BudgetCategory } from "@/types";
import { BUDGET_CATEGORIES, BUDGET_SUBCATEGORIES } from "@/lib/utils";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

function sortByLocalizedLabel<T extends string>(
  options: SelectOption<T>[],
  locale?: string
): SelectOption<T>[] {
  return [...options].sort((a, b) =>
    a.label.localeCompare(b.label, locale, { sensitivity: "base" })
  );
}

export function getLocalizedCategoryOptions(
  t: (key: BudgetCategory) => string,
  locale?: string
): SelectOption<BudgetCategory>[] {
  const options = (Object.keys(BUDGET_CATEGORIES) as BudgetCategory[]).map(
    (value) => ({
      value,
      label: t(value),
    })
  );
  return sortByLocalizedLabel(options, locale);
}

export function getLocalizedSubcategoryOptions(
  category: BudgetCategory | "",
  t: (key: string) => string,
  locale?: string
): SelectOption[] {
  if (!category) return [];
  const subcategories = BUDGET_SUBCATEGORIES[category];
  if (!subcategories) return [];

  const options = Object.keys(subcategories).map((value) => ({
    value,
    label: t(`${category}.${value}`),
  }));
  return sortByLocalizedLabel(options, locale);
}
