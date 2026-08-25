"use client";

import type { BudgetSettings } from "@/lib/budget-settings";
import { shouldShowProductField } from "@/lib/budget-settings";

type ProductMetaSource = {
  reference_code?: string | null;
  internal_reference?: string | null;
  supplier_name?: string | null;
  product?: { reference_code?: string | null; supplier?: { name?: string | null } | null };
};

export function getProductPublicMeta(
  item: ProductMetaSource,
  settings: BudgetSettings | null | undefined
) {
  const referenceCode =
    item.reference_code?.trim() ||
    item.product?.reference_code?.trim() ||
    "";
  const internalReference = item.internal_reference?.trim() || "";
  const supplierName =
    item.supplier_name?.trim() || item.product?.supplier?.name?.trim() || "";

  return {
    model: shouldShowProductField(settings, "model") ? referenceCode : "",
    sku: shouldShowProductField(settings, "sku") ? internalReference : "",
    supplier: shouldShowProductField(settings, "supplier") ? supplierName : "",
  };
}
