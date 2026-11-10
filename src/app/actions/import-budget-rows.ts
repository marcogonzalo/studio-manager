"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { trackEvent } from "@/lib/track-event";
import { isDemoAccountEmail } from "@/lib/utils";
import { buildAddItemFormSchema } from "@/lib/add-item-form-schema";
import { buildBudgetLineFormSchema } from "@/lib/budget-line-form-schema";
import { IMPORT_MAX_ROWS } from "@/lib/budget-import/parse-file";

const lookupSchema = z
  .union([
    z.object({ id: z.string().uuid(), name: z.string().optional() }),
    z.object({ create: z.string().min(1) }),
    z.null(),
  ])
  .optional();

const productRowSchema = z.object({
  name: z.string().min(2),
  quantity: z.number().int().positive(),
  unit_cost: z.number(),
  markup: z.number(),
  unit_price: z.number(),
  is_price_tbd: z.boolean().optional(),
  tax_rate: z.number().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  reference_code: z.string().optional().nullable(),
  reference_url: z.string().optional().nullable(),
  internal_reference: z.string().optional().nullable(),
  internal_notes: z.string().optional().nullable(),
  space: lookupSchema,
  supplier: lookupSchema,
});

const budgetLineRowSchema = z.object({
  category: z.string().min(1),
  subcategory: z.string().min(1),
  description: z.string().optional().nullable(),
  estimated_amount: z.number(),
  actual_amount: z.number(),
  is_internal_cost: z.boolean().optional(),
  is_price_tbd: z.boolean().optional(),
  tax_rate: z.number().optional().nullable(),
  phase: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  supplier: lookupSchema,
});

const inputSchema = z.object({
  importId: z.string().uuid(),
  projectId: z.string().uuid(),
  target: z.enum(["product", "budget_line"]),
  createCatalog: z.boolean().default(false),
  rows: z.array(z.record(z.string(), z.unknown())).min(1).max(IMPORT_MAX_ROWS),
});

export type ImportBudgetResult =
  | {
      ok: true;
      created: number;
      skipped: number;
      spaces_created: number;
      suppliers_created: number;
    }
  | {
      ok: false;
      code:
        | "UNAUTHORIZED"
        | "DEMO_ACCOUNT_READ_ONLY"
        | "RATE_LIMITED"
        | "VALIDATION"
        | "RPC_ERROR";
      message: string;
      details?: unknown;
    };

const identityT = (key: string) => key;

export async function importBudgetRows(
  raw: unknown
): Promise<ImportBudgetResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "Invalid import payload",
      details: parsed.error.flatten(),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, code: "UNAUTHORIZED", message: "Not authenticated" };
  }

  if (isDemoAccountEmail(user.email)) {
    return {
      ok: false,
      code: "DEMO_ACCOUNT_READ_ONLY",
      message: "Demo account is read-only",
    };
  }

  const rate = checkRateLimit(`user:${user.id}`, "upload");
  if (!rate.allowed) {
    return {
      ok: false,
      code: "RATE_LIMITED",
      message: "Too many uploads. Try again shortly.",
    };
  }

  const { importId, projectId, target, createCatalog, rows } = parsed.data;

  // Re-validate with the same form zod builders (string inputs).
  if (target === "product") {
    const formSchema = buildAddItemFormSchema(identityT as never);
    for (const [index, row] of rows.entries()) {
      const shaped = productRowSchema.safeParse(row);
      if (!shaped.success) {
        return {
          ok: false,
          code: "VALIDATION",
          message: `Row ${index + 1} invalid`,
          details: shaped.error.flatten(),
        };
      }
      const formCheck = formSchema.safeParse({
        name: shaped.data.name,
        quantity: String(shaped.data.quantity),
        unit_cost: String(shaped.data.unit_cost),
        markup: String(shaped.data.markup),
        unit_price: String(shaped.data.unit_price),
        is_price_tbd: shaped.data.is_price_tbd === true,
        tax_rate:
          shaped.data.tax_rate == null ? "" : String(shaped.data.tax_rate),
        description: shaped.data.description ?? "",
        category: shaped.data.category ?? "",
        reference_code: shaped.data.reference_code ?? "",
        reference_url: shaped.data.reference_url ?? "",
        internal_reference: shaped.data.internal_reference ?? "",
        internal_notes: shaped.data.internal_notes ?? "",
      });
      if (!formCheck.success) {
        return {
          ok: false,
          code: "VALIDATION",
          message: `Row ${index + 1} failed schema`,
          details: formCheck.error.flatten(),
        };
      }
    }
  } else {
    const formSchema = buildBudgetLineFormSchema(identityT as never);
    for (const [index, row] of rows.entries()) {
      const shaped = budgetLineRowSchema.safeParse(row);
      if (!shaped.success) {
        return {
          ok: false,
          code: "VALIDATION",
          message: `Row ${index + 1} invalid`,
          details: shaped.error.flatten(),
        };
      }
      const formCheck = formSchema.safeParse({
        category: shaped.data.category,
        subcategory: shaped.data.subcategory,
        description: shaped.data.description ?? "",
        estimated_amount: String(shaped.data.estimated_amount),
        actual_amount: String(shaped.data.actual_amount),
        is_internal_cost: shaped.data.is_internal_cost === true,
        is_price_tbd: shaped.data.is_price_tbd === true,
        tax_rate:
          shaped.data.tax_rate == null ? "" : String(shaped.data.tax_rate),
        phase: shaped.data.phase ?? "",
        notes: shaped.data.notes ?? "",
      });
      if (!formCheck.success) {
        return {
          ok: false,
          code: "VALIDATION",
          message: `Row ${index + 1} failed schema`,
          details: formCheck.error.flatten(),
        };
      }
    }
  }

  const { data, error } = await supabase.rpc("import_budget_rows", {
    p_import_id: importId,
    p_project_id: projectId,
    p_target: target,
    p_rows: rows,
    p_create_catalog: createCatalog,
  });

  if (error) {
    return {
      ok: false,
      code: "RPC_ERROR",
      message: error.message,
    };
  }

  const result = data as {
    created?: number;
    skipped?: number;
    spaces_created?: number;
    suppliers_created?: number;
  };

  await trackEvent(
    "budget_imported",
    {
      project_id: projectId,
      target,
      created: result.created ?? 0,
      skipped: result.skipped ?? 0,
    },
    { userId: user.id }
  );

  return {
    ok: true,
    created: result.created ?? 0,
    skipped: result.skipped ?? 0,
    spaces_created: result.spaces_created ?? 0,
    suppliers_created: result.suppliers_created ?? 0,
  };
}
