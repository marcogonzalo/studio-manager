import type { BudgetCategory } from "@/types";
import { BUDGET_CATEGORIES, BUDGET_SUBCATEGORIES } from "@/lib/utils";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

export function getLocalizedCategoryOptions(
  t: (key: BudgetCategory) => string
): SelectOption<BudgetCategory>[] {
  return (Object.keys(BUDGET_CATEGORIES) as BudgetCategory[]).map((value) => ({
    value,
    label: t(value),
  }));
}

export function getLocalizedSubcategoryOptions(
  category: BudgetCategory | "",
  t: (key: string) => string
): SelectOption[] {
  if (!category) return [];
  const subcategories = BUDGET_SUBCATEGORIES[category];
  if (!subcategories) return [];

  return Object.keys(subcategories).map((value) => ({
    value,
    label: t(`${category}.${value}`),
  }));
}
