import { catalogProductCurrencyFromProject } from "./catalog-product-currency";

export type CatalogProductProjectFields = {
  name: string;
  description?: string;
  reference_code?: string;
  reference_url?: string | null;
  category?: string;
  unit_cost: unknown;
  image_url?: string | null;
  supplier_id?: string | null;
};

export type BuildCatalogProductInsertParams = CatalogProductProjectFields & {
  user_id: string;
  projectCurrency?: string | null;
  pendingImageUpload?: boolean;
};

function resolveSupplierId(supplier_id?: string | null): string | null {
  return supplier_id === "none" || !supplier_id ? null : supplier_id;
}

/** Payload for products.insert when creating a catalog row from a project item. */
export function buildCatalogProductInsertFromProject(
  params: BuildCatalogProductInsertParams
): Record<string, unknown> {
  return {
    name: params.name,
    description: params.description || "",
    reference_code: params.reference_code || "",
    reference_url: params.reference_url || null,
    category: params.category || "",
    cost_price: params.unit_cost,
    currency: catalogProductCurrencyFromProject(params.projectCurrency),
    image_url: params.pendingImageUpload ? null : params.image_url || null,
    supplier_id: resolveSupplierId(params.supplier_id),
    user_id: params.user_id,
  };
}

export type BuildCatalogProductUpdateParams = Omit<
  CatalogProductProjectFields,
  "description"
> & {
  projectCurrency?: string | null;
};

/** Base payload for products.update on custom project-linked catalog rows. */
export function buildCatalogProductUpdateFromProject(
  params: BuildCatalogProductUpdateParams
): Record<string, unknown> {
  return {
    name: params.name,
    reference_code: params.reference_code || "",
    reference_url: params.reference_url || null,
    category: params.category || "",
    cost_price: params.unit_cost,
    currency: catalogProductCurrencyFromProject(params.projectCurrency),
    image_url: params.image_url || null,
    supplier_id: resolveSupplierId(params.supplier_id),
  };
}
