import * as z from "zod";

export type AddItemFormMessageKey =
  | "validationNameRequired"
  | "validationQuantityInteger"
  | "validationUnitCostPositive"
  | "validationUnitPricePositive";

export type AddItemFormTranslate = (key: AddItemFormMessageKey) => string;

export type NumericInputMode = "positive-integer" | "positive-float";

export function shouldBlockNumericKey(
  key: string,
  mode: NumericInputMode
): boolean {
  if (["e", "E", "+", "-"].includes(key)) return true;
  if (mode === "positive-integer" && (key === "." || key === ",")) return true;
  return false;
}

function parseRequiredNumber(value: string): number {
  const trimmed = value.trim();
  if (trimmed === "") return Number.NaN;
  // Reject scientific notation (can still arrive via paste).
  if (/[eE]/.test(trimmed)) return Number.NaN;
  // Allow comma decimals.
  return Number(trimmed.replace(",", "."));
}

function positiveInteger(t: AddItemFormTranslate) {
  return z
    .string()
    .refine((v) => /^\d+$/.test(v.trim()), t("validationQuantityInteger"))
    .transform(parseRequiredNumber)
    .refine(
      (val) => Number.isInteger(val) && val >= 1,
      t("validationQuantityInteger")
    );
}

function isPositiveMoney(raw: string): boolean {
  return /^\d+(?:[.,]\d+)?$/.test(raw.trim()) && parseRequiredNumber(raw) > 0;
}

export function buildAddItemFormSchema(t: AddItemFormTranslate) {
  return z
    .object({
      product_id: z.string().optional(),
      space_id: z.string().optional(),
      supplier_id: z.string().optional(),
      name: z.string().min(2, t("validationNameRequired")),
      description: z.string().optional(),
      reference_code: z.string().optional(),
      reference_url: z.string().optional(),
      category: z.string().optional(),
      internal_reference: z.string().optional(),
      internal_notes: z.string().optional(),
      quantity: positiveInteger(t),
      unit_cost: z.string().optional(),
      markup: z.string().transform((v) => parseFloat(v) || 0),
      unit_price: z.string().optional(),
      image_url: z.string().optional(),
      is_excluded: z.boolean().optional(),
      is_price_tbd: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.is_price_tbd) return;
      if (!isPositiveMoney(data.unit_cost ?? "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["unit_cost"],
          message: t("validationUnitCostPositive"),
        });
      }
      if (!isPositiveMoney(data.unit_price ?? "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["unit_price"],
          message: t("validationUnitPricePositive"),
        });
      }
    })
    .transform((data) => ({
      ...data,
      is_price_tbd: data.is_price_tbd === true,
      unit_cost: data.is_price_tbd
        ? 0
        : parseRequiredNumber(data.unit_cost ?? ""),
      unit_price: data.is_price_tbd
        ? 0
        : parseRequiredNumber(data.unit_price ?? ""),
    }));
}
