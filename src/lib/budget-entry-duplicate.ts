import type { ProjectBudgetLine, ProjectItem, Product } from "@/types";

/** Prefill for create/duplicate — never includes id; save always inserts. */
export type AddItemInitialValues = {
  product_id?: string;
  space_id?: string;
  supplier_id?: string;
  name?: string;
  description?: string;
  reference_code?: string;
  reference_url?: string;
  category?: string;
  internal_reference?: string;
  internal_notes?: string;
  quantity?: string;
  unit_cost?: string;
  markup?: string;
  unit_price?: string;
  image_url?: string;
  is_excluded?: boolean;
  is_price_tbd?: boolean;
  tax_rate?: string;
};

export type BudgetLineInitialValues = {
  category?: string;
  subcategory?: string;
  description?: string;
  estimated_amount?: string;
  actual_amount?: string;
  is_internal_cost?: boolean;
  is_price_tbd?: boolean;
  tax_rate?: string;
  phase?: string;
  supplier_id?: string;
  notes?: string;
};

/**
 * Map a project item to dialog prefill for Duplicate.
 * Drops id, purchase_order_id, status; keeps image URL as reference only.
 */
export function projectItemToDuplicateValues(
  item: ProjectItem,
  product?: Partial<
    Pick<
      Product,
      "description" | "reference_code" | "reference_url" | "category"
    >
  > | null
): AddItemInitialValues {
  return {
    product_id: item.product_id || "custom",
    space_id: item.space_id || "none",
    supplier_id: item.supplier_id || "none",
    name: item.name || "",
    description: item.description || product?.description || "",
    reference_code: product?.reference_code || "",
    reference_url: product?.reference_url || "",
    category: product?.category || "",
    internal_reference: item.internal_reference || "",
    internal_notes: item.internal_notes || "",
    quantity: item.quantity?.toString() || "1",
    unit_cost:
      item.is_price_tbd && !item.unit_cost
        ? ""
        : item.unit_cost?.toString() || "0",
    markup: item.markup?.toString() || "20",
    unit_price:
      item.is_price_tbd && !item.unit_price
        ? ""
        : item.unit_price?.toString() || "0",
    image_url: item.image_url || "",
    is_excluded: false,
    is_price_tbd: item.is_price_tbd || false,
    tax_rate: item.tax_rate != null ? String(item.tax_rate) : undefined,
  };
}

/**
 * Map a budget line to dialog prefill for Duplicate.
 * Drops id; saves nothing until confirmed.
 */
export function budgetLineToDuplicateValues(
  line: ProjectBudgetLine
): BudgetLineInitialValues {
  return {
    category: line.category,
    subcategory: line.subcategory,
    description: line.description || "",
    estimated_amount:
      line.is_price_tbd && !line.estimated_amount
        ? ""
        : line.estimated_amount.toString(),
    actual_amount:
      line.is_price_tbd && !line.actual_amount
        ? ""
        : line.actual_amount.toString(),
    is_internal_cost: line.is_internal_cost,
    is_price_tbd: line.is_price_tbd || false,
    tax_rate: line.tax_rate != null ? String(line.tax_rate) : undefined,
    phase: line.phase || undefined,
    supplier_id: line.supplier_id || undefined,
    notes: line.notes || "",
  };
}
