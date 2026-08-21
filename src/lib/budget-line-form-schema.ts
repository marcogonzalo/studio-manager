import * as z from "zod";

export type BudgetLineFormMessageKey =
  | "validationCategoryRequired"
  | "validationSubcategoryRequired"
  | "validationTaxNonNegative";

export type BudgetLineFormTranslate = (key: BudgetLineFormMessageKey) => string;

function parseAmount(value: string): number {
  const trimmed = value.trim();
  if (trimmed === "") return 0;
  return parseFloat(trimmed.replace(",", ".")) || 0;
}

export function buildBudgetLineFormSchema(t: BudgetLineFormTranslate) {
  return z
    .object({
      category: z.string().min(1, t("validationCategoryRequired")),
      subcategory: z.string().min(1, t("validationSubcategoryRequired")),
      description: z.string().optional(),
      estimated_amount: z.string().optional(),
      actual_amount: z.string().optional(),
      is_internal_cost: z.boolean().default(false),
      is_price_tbd: z.boolean().optional(),
      tax_rate: z.string().optional(),
      phase: z.string().optional(),
      supplier_id: z.string().optional(),
      notes: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const taxRaw = data.tax_rate?.trim() ?? "";
      if (taxRaw === "") return;
      const tax = parseFloat(taxRaw.replace(",", "."));
      if (Number.isNaN(tax) || tax < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tax_rate"],
          message: t("validationTaxNonNegative"),
        });
      }
    })
    .transform((data) => {
      const taxRaw = data.tax_rate?.trim() ?? "";
      const taxParsed =
        taxRaw === "" ? undefined : parseFloat(taxRaw.replace(",", "."));
      return {
        ...data,
        is_price_tbd: data.is_price_tbd === true,
        estimated_amount: data.is_price_tbd
          ? 0
          : parseAmount(data.estimated_amount ?? ""),
        actual_amount: data.is_price_tbd
          ? 0
          : parseAmount(data.actual_amount ?? ""),
        tax_rate:
          taxParsed != null && !Number.isNaN(taxParsed) ? taxParsed : undefined,
      };
    });
}
