/**
 * Helpers for "Add and create another" and budget_created origin tracking.
 */

export type BudgetCreatedOrigin = "form" | "repeat" | "space_add" | "duplicate";

export type BudgetCreatedSource = "manual" | "catalog";

/** Fields kept after "Add and create another" for product (AddItem) forms. */
export const ADD_ITEM_REPEAT_KEEP_KEYS = [
  "space_id",
  "supplier_id",
  "category",
] as const;

/** Fields kept after "Add and create another" for cost-line forms. */
export const BUDGET_LINE_REPEAT_KEEP_KEYS = [
  "category",
  "subcategory",
  "phase",
  "supplier_id",
] as const;

/**
 * Build form defaults for the next line after a successful "add another" save.
 * Kept fields come from `previous`; everything else from `emptyDefaults`.
 */
export function buildRepeatDefaults<T extends Record<string, unknown>>(
  previous: T,
  emptyDefaults: T,
  keepKeys: readonly (keyof T & string)[]
): T {
  const next = { ...emptyDefaults };
  for (const key of keepKeys) {
    if (key in previous) {
      next[key] = previous[key];
    }
  }
  return next;
}

/**
 * Resolve origin for the next create after "add another".
 * Once the user uses add-another, subsequent creates in the same dialog stay `repeat`.
 */
export function resolveNextCreateOrigin(
  current: BudgetCreatedOrigin | undefined,
  addAnother: boolean
): BudgetCreatedOrigin {
  if (addAnother) return "repeat";
  return current ?? "form";
}

/**
 * Origin used when emitting budget_created for this submit.
 * When addAnother is true, the save itself is tagged `repeat`.
 */
export function resolveSubmitOrigin(
  current: BudgetCreatedOrigin | undefined,
  addAnother: boolean
): BudgetCreatedOrigin {
  if (addAnother) return "repeat";
  return current ?? "form";
}
