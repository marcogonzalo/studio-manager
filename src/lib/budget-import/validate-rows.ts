import {
  buildAddItemFormSchema,
  type AddItemFormTranslate,
} from "@/lib/add-item-form-schema";
import {
  buildBudgetLineFormSchema,
  type BudgetLineFormTranslate,
} from "@/lib/budget-line-form-schema";
import type { ResolvedBudgetLineRow, ResolvedProductRow } from "./resolve-row";

export type RowValidation = {
  index: number;
  ok: boolean;
  errors: string[];
  /** Canonical payload ready for the import RPC / zod transform output. */
  data?: Record<string, unknown>;
};

export function validateProductRows(
  rows: ResolvedProductRow[],
  t: AddItemFormTranslate
): RowValidation[] {
  const schema = buildAddItemFormSchema(t);
  return rows.map((row, index) => {
    const errors = [...row.errors];
    if (row.name.trim().length < 2) errors.push("name_required");

    const parsed = schema.safeParse({
      name: row.name,
      quantity: row.quantity,
      unit_cost: row.is_price_tbd ? "" : row.unit_cost,
      markup: row.markup || "0",
      unit_price: row.is_price_tbd ? "" : row.unit_price,
      is_price_tbd: row.is_price_tbd,
      tax_rate: row.tax_rate,
      description: row.description,
      category: row.category,
      reference_code: row.reference_code,
      reference_url: row.reference_url,
      internal_reference: row.internal_reference,
      internal_notes: row.internal_notes,
      space_id: row.space.status === "matched" ? row.space.id : undefined,
      supplier_id:
        row.supplier.status === "matched" ? row.supplier.id : undefined,
    });

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(issue.path.join(".") || issue.message);
      }
    }

    return {
      index,
      ok: errors.length === 0 && parsed.success,
      errors,
      data: parsed.success
        ? {
            ...parsed.data,
            space:
              row.space.status === "empty"
                ? null
                : row.space.status === "matched"
                  ? { id: row.space.id, name: row.space.name }
                  : { create: row.space.name },
            supplier:
              row.supplier.status === "empty"
                ? null
                : row.supplier.status === "matched"
                  ? { id: row.supplier.id, name: row.supplier.name }
                  : { create: row.supplier.name },
          }
        : undefined,
    };
  });
}

export function validateBudgetLineRows(
  rows: ResolvedBudgetLineRow[],
  t: BudgetLineFormTranslate
): RowValidation[] {
  const schema = buildBudgetLineFormSchema(t);
  return rows.map((row, index) => {
    const errors = [...row.errors];
    if (row.needsCategory || !row.category) {
      errors.push("needs_category");
    }

    const parsed = schema.safeParse({
      category: row.category ?? "",
      subcategory: row.subcategory,
      description: row.description,
      estimated_amount: row.estimated_amount,
      actual_amount: row.actual_amount,
      is_internal_cost: row.is_internal_cost,
      is_price_tbd: row.is_price_tbd,
      tax_rate: row.tax_rate,
      phase: row.phase || undefined,
      notes: row.notes,
      supplier_id:
        row.supplier.status === "matched" ? row.supplier.id : undefined,
    });

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(issue.path.join(".") || issue.message);
      }
    }

    const uniqueErrors = [...new Set(errors)];
    return {
      index,
      ok: uniqueErrors.length === 0 && parsed.success && !!row.category,
      errors: uniqueErrors,
      data:
        parsed.success && row.category
          ? {
              ...parsed.data,
              category: row.category,
              supplier:
                row.supplier.status === "empty"
                  ? null
                  : row.supplier.status === "matched"
                    ? { id: row.supplier.id, name: row.supplier.name }
                    : { create: row.supplier.name },
            }
          : undefined,
    };
  });
}

export function buildErrorReportCsv(
  validations: RowValidation[],
  locale: "es" | "en" = "en"
): string {
  const header = locale === "es" ? "Fila,Errores" : "Row,Errors";
  const lines = validations
    .filter((v) => !v.ok)
    .map(
      (v) => `${v.index + 2},"${v.errors.join("; ").replaceAll('"', '""')}"`
    );
  return `\uFEFF${header}\n${lines.join("\n")}\n`;
}
