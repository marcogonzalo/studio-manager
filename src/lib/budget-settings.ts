import { z } from "zod";
import type { ProjectPhase } from "@/types";

export type BudgetSortField =
  | "created_at"
  | "internal_code"
  | "alphabetical"
  | "supplier";

export type BudgetSortDirection = "asc" | "desc";

export type BudgetPhaseFilter = "all" | ProjectPhase | "no_phase";

export interface BudgetProductFieldVisibility {
  model: boolean;
  supplier: boolean;
  sku: boolean;
}

export interface BudgetSettings {
  phase_filter?: BudgetPhaseFilter;
  sort_field?: BudgetSortField;
  sort_direction?: BudgetSortDirection;
  product_fields?: BudgetProductFieldVisibility;
  /** null or undefined = all spaces (including unassigned). */
  visible_space_ids?: string[] | null;
}

export const DEFAULT_PRODUCT_FIELD_VISIBILITY: BudgetProductFieldVisibility =
  {
    model: false,
    supplier: false,
    sku: false,
  };

export const DEFAULT_BUDGET_SETTINGS: Required<
  Pick<
    BudgetSettings,
    "phase_filter" | "sort_field" | "sort_direction" | "product_fields"
  >
> & { visible_space_ids: string[] | null } = {
  phase_filter: "all",
  sort_field: "created_at",
  sort_direction: "asc",
  product_fields: { ...DEFAULT_PRODUCT_FIELD_VISIBILITY },
  visible_space_ids: null,
};

const budgetPhaseFilterSchema = z.union([
  z.literal("all"),
  z.literal("no_phase"),
  z.enum([
    "diagnosis",
    "design",
    "executive",
    "budget",
    "construction",
    "delivery",
  ]),
]);

const budgetSettingsSchema = z
  .object({
    phase_filter: budgetPhaseFilterSchema.optional(),
    sort_field: z
      .enum(["created_at", "internal_code", "alphabetical", "supplier"])
      .optional(),
    sort_direction: z.enum(["asc", "desc"]).optional(),
    product_fields: z
      .object({
        model: z.boolean(),
        supplier: z.boolean(),
        sku: z.boolean(),
      })
      .optional(),
    visible_space_ids: z.array(z.string()).nullable().optional(),
  })
  .strict();

export function parseBudgetSettings(raw: unknown): BudgetSettings {
  if (raw == null || (typeof raw === "object" && Object.keys(raw).length === 0)) {
    return {};
  }
  const result = budgetSettingsSchema.safeParse(raw);
  return result.success ? result.data : {};
}

export function normalizeBudgetSettings(
  raw: BudgetSettings | null | undefined
): Required<
  Pick<
    BudgetSettings,
    "phase_filter" | "sort_field" | "sort_direction" | "product_fields"
  >
> & { visible_space_ids: string[] | null } {
  const parsed = parseBudgetSettings(raw);
  return {
    phase_filter: parsed.phase_filter ?? DEFAULT_BUDGET_SETTINGS.phase_filter,
    sort_field: parsed.sort_field ?? DEFAULT_BUDGET_SETTINGS.sort_field,
    sort_direction:
      parsed.sort_direction ?? DEFAULT_BUDGET_SETTINGS.sort_direction,
    product_fields: {
      model:
        parsed.product_fields?.model ??
        DEFAULT_BUDGET_SETTINGS.product_fields.model,
      supplier:
        parsed.product_fields?.supplier ??
        DEFAULT_BUDGET_SETTINGS.product_fields.supplier,
      sku:
        parsed.product_fields?.sku ?? DEFAULT_BUDGET_SETTINGS.product_fields.sku,
    },
    visible_space_ids:
      parsed.visible_space_ids === undefined
        ? DEFAULT_BUDGET_SETTINGS.visible_space_ids
        : parsed.visible_space_ids,
  };
}

export function mergeBudgetSettings(
  current: BudgetSettings | null | undefined,
  patch: Partial<BudgetSettings>
): BudgetSettings {
  const base = normalizeBudgetSettings(current);
  return normalizeBudgetSettings({
    ...base,
    ...patch,
    product_fields: patch.product_fields
      ? { ...base.product_fields, ...patch.product_fields }
      : base.product_fields,
  });
}

/** Whether all spaces are visible (null = all). */
export function isAllSpacesVisible(
  visibleSpaceIds: string[] | null | undefined
): boolean {
  return visibleSpaceIds == null;
}

export function shouldShowProductField(
  settings: BudgetSettings | null | undefined,
  field: keyof BudgetProductFieldVisibility
): boolean {
  return normalizeBudgetSettings(settings).product_fields[field];
}
