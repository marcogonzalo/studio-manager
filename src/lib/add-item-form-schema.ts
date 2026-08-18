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
  return Number(trimmed);
}

function positiveInteger(t: AddItemFormTranslate) {
  return z
    .string()
    .transform(parseRequiredNumber)
    .refine(
      (val) => Number.isInteger(val) && val >= 1,
      t("validationQuantityInteger")
    );
}

function positiveFloat(message: string) {
  return z
    .string()
    .transform(parseRequiredNumber)
    .refine((val) => Number.isFinite(val) && val > 0, message);
}

export function buildAddItemFormSchema(t: AddItemFormTranslate) {
  return z.object({
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
    unit_cost: positiveFloat(t("validationUnitCostPositive")),
    markup: z.string().transform((v) => parseFloat(v) || 0),
    unit_price: positiveFloat(t("validationUnitPricePositive")),
    image_url: z.string().optional(),
    is_excluded: z.boolean().optional(),
  });
}
