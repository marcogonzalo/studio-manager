import type { BudgetCategory, ProjectPhase } from "@/types";
import { BUDGET_CATEGORIES, BUDGET_SUBCATEGORIES } from "@/lib/utils";

export type ImportTarget = "product" | "budget_line";

export type ImportFieldRequired = "always" | "pricing_pair" | "never";

export type ImportFieldType =
  | "text"
  | "integer"
  | "money"
  | "percent"
  | "boolean"
  | "enum"
  | "lookup"
  | "url";

export type ImportFieldDef = {
  key: string;
  target: ImportTarget;
  required: ImportFieldRequired;
  /** When set, column only applies under this project condition. */
  appliesWhen?: "multitax";
  type: ImportFieldType;
  enumValues?: readonly string[];
  lookup?: "space" | "supplier";
  /** i18n key under budgetImport.fields.<key> */
  labelKey: string;
  aliases: { es: readonly string[]; en: readonly string[] };
  example: { es: string; en: string };
};

export const PROJECT_PHASES: readonly ProjectPhase[] = [
  "diagnosis",
  "design",
  "executive",
  "budget",
  "construction",
  "delivery",
] as const;

export const BUDGET_CATEGORY_KEYS = Object.keys(
  BUDGET_CATEGORIES
) as BudgetCategory[];

export function allBudgetSubcategoryKeys(): string[] {
  const keys = new Set<string>();
  for (const category of BUDGET_CATEGORY_KEYS) {
    for (const sub of Object.keys(BUDGET_SUBCATEGORIES[category])) {
      keys.add(sub);
    }
  }
  return [...keys];
}

export const BOOLEAN_TRUE_ALIASES = [
  "yes",
  "y",
  "true",
  "1",
  "si",
  "sí",
  "s",
] as const;

export const BOOLEAN_FALSE_ALIASES = ["no", "n", "false", "0"] as const;

/**
 * Schema keys covered by import lookups / pricing derivation / exclusion.
 * Used by the contract test so new schema fields must be classified.
 */
export const PRODUCT_SCHEMA_LOOKUP_KEYS = ["space_id", "supplier_id"] as const;
export const PRODUCT_SCHEMA_DERIVED_KEYS = ["unit_price", "markup"] as const;
export const PRODUCT_SCHEMA_EXCLUDED_KEYS = [
  "product_id",
  "image_url",
  "is_excluded",
] as const;

export const BUDGET_LINE_SCHEMA_LOOKUP_KEYS = ["supplier_id"] as const;
export const BUDGET_LINE_SCHEMA_EXCLUDED_KEYS = [] as const;

export const PRODUCT_IMPORT_FIELDS: readonly ImportFieldDef[] = [
  {
    key: "name",
    target: "product",
    required: "always",
    type: "text",
    labelKey: "name",
    aliases: {
      es: ["nombre", "producto", "articulo", "artículo"],
      en: ["name", "product", "item", "title"],
    },
    example: { es: "Ejemplo: Silla de comedor", en: "Example: Dining chair" },
  },
  {
    key: "quantity",
    target: "product",
    required: "always",
    type: "integer",
    labelKey: "quantity",
    aliases: {
      es: ["cantidad", "uds", "unidades", "qty"],
      en: ["quantity", "qty", "units", "amount"],
    },
    example: { es: "2", en: "2" },
  },
  {
    key: "unit_cost",
    target: "product",
    required: "pricing_pair",
    type: "money",
    labelKey: "unitCost",
    aliases: {
      es: ["coste unitario", "coste", "precio coste", "costo"],
      en: ["unit cost", "cost", "purchase price", "buy price"],
    },
    example: { es: "100", en: "100" },
  },
  {
    key: "markup",
    target: "product",
    required: "pricing_pair",
    type: "percent",
    labelKey: "markup",
    aliases: {
      es: ["margen", "margen %", "markup", "beneficio"],
      en: ["markup", "markup %", "margin", "margin %"],
    },
    example: { es: "20", en: "20" },
  },
  {
    key: "unit_price",
    target: "product",
    required: "pricing_pair",
    type: "money",
    labelKey: "unitPrice",
    aliases: {
      es: ["precio unitario", "precio venta", "pvp", "precio"],
      en: ["unit price", "sale price", "sell price", "price"],
    },
    example: { es: "120", en: "120" },
  },
  {
    key: "is_price_tbd",
    target: "product",
    required: "never",
    type: "boolean",
    labelKey: "priceTbd",
    aliases: {
      es: ["precio por definir", "precio tbd", "por definir", "tbd"],
      en: ["price tbd", "price to be defined", "tbd", "tba"],
    },
    example: { es: "No", en: "No" },
  },
  {
    key: "tax_rate",
    target: "product",
    required: "never",
    appliesWhen: "multitax",
    type: "percent",
    labelKey: "taxRate",
    aliases: {
      es: ["iva", "iva %", "impuesto", "tax"],
      en: ["tax", "tax %", "vat", "vat %"],
    },
    example: { es: "21", en: "21" },
  },
  {
    key: "space",
    target: "product",
    required: "never",
    type: "lookup",
    lookup: "space",
    labelKey: "space",
    aliases: {
      es: ["espacio", "estancia", "habitacion", "habitación", "zona"],
      en: ["space", "room", "area", "zone"],
    },
    example: { es: "Salón", en: "Living room" },
  },
  {
    key: "supplier",
    target: "product",
    required: "never",
    type: "lookup",
    lookup: "supplier",
    labelKey: "supplier",
    aliases: {
      es: ["proveedor", "supplier", "fabricante"],
      en: ["supplier", "vendor", "manufacturer"],
    },
    example: { es: "Mobiliario Norte", en: "North Furnishings" },
  },
  {
    key: "description",
    target: "product",
    required: "never",
    type: "text",
    labelKey: "description",
    aliases: {
      es: ["descripcion", "descripción", "detalle", "notas"],
      en: ["description", "details", "notes"],
    },
    example: { es: "Tapizado en lino", en: "Linen upholstery" },
  },
  {
    key: "category",
    target: "product",
    required: "never",
    type: "text",
    labelKey: "category",
    aliases: {
      es: ["categoria", "categoría", "tipo"],
      en: ["category", "type"],
    },
    example: { es: "Mobiliario", en: "Furniture" },
  },
  {
    key: "reference_code",
    target: "product",
    required: "never",
    type: "text",
    labelKey: "referenceCode",
    aliases: {
      es: ["referencia", "codigo", "código", "sku", "ref"],
      en: ["reference", "reference code", "sku", "code", "ref"],
    },
    example: { es: "SKU-001", en: "SKU-001" },
  },
  {
    key: "reference_url",
    target: "product",
    required: "never",
    type: "url",
    labelKey: "referenceUrl",
    aliases: {
      es: ["url de referencia", "url", "enlace", "link"],
      en: ["reference url", "url", "link", "product url"],
    },
    example: {
      es: "https://ejemplo.com/silla",
      en: "https://example.com/chair",
    },
  },
  {
    key: "internal_reference",
    target: "product",
    required: "never",
    type: "text",
    labelKey: "internalReference",
    aliases: {
      es: ["referencia interna", "ref interna", "codigo interno"],
      en: ["internal reference", "internal ref", "internal code"],
    },
    example: { es: "INT-42", en: "INT-42" },
  },
  {
    key: "internal_notes",
    target: "product",
    required: "never",
    type: "text",
    labelKey: "internalNotes",
    aliases: {
      es: ["notas internas", "nota interna", "comentarios internos"],
      en: ["internal notes", "internal note", "private notes"],
    },
    example: { es: "Pedir muestra", en: "Request sample" },
  },
] as const;

export const BUDGET_LINE_IMPORT_FIELDS: readonly ImportFieldDef[] = [
  {
    key: "category",
    target: "budget_line",
    required: "never",
    type: "enum",
    enumValues: BUDGET_CATEGORY_KEYS,
    labelKey: "lineCategory",
    aliases: {
      es: ["categoria", "categoría", "tipo partida"],
      en: ["category", "budget category", "line category"],
    },
    example: { es: "Obra", en: "Construction" },
  },
  {
    key: "subcategory",
    target: "budget_line",
    required: "never",
    type: "enum",
    enumValues: allBudgetSubcategoryKeys(),
    labelKey: "lineSubcategory",
    aliases: {
      es: ["subcategoria", "subcategoría", "subpartida"],
      en: ["subcategory", "sub category", "line subcategory"],
    },
    example: { es: "Albañilería", en: "Masonry" },
  },
  {
    key: "description",
    target: "budget_line",
    required: "never",
    type: "text",
    labelKey: "description",
    aliases: {
      es: ["descripcion", "descripción", "concepto", "partida"],
      en: ["description", "concept", "line description"],
    },
    example: { es: "Tabiquería", en: "Partition walls" },
  },
  {
    key: "estimated_amount",
    target: "budget_line",
    required: "never",
    type: "money",
    labelKey: "estimatedAmount",
    aliases: {
      es: ["importe estimado", "estimado", "presupuesto"],
      en: ["estimated amount", "estimated", "budget amount"],
    },
    example: { es: "1500", en: "1500" },
  },
  {
    key: "actual_amount",
    target: "budget_line",
    required: "never",
    type: "money",
    labelKey: "actualAmount",
    aliases: {
      es: ["importe real", "real", "ejecutado"],
      en: ["actual amount", "actual", "spent"],
    },
    example: { es: "0", en: "0" },
  },
  {
    key: "tax_rate",
    target: "budget_line",
    required: "never",
    appliesWhen: "multitax",
    type: "percent",
    labelKey: "taxRate",
    aliases: {
      es: ["iva", "iva %", "impuesto", "tax"],
      en: ["tax", "tax %", "vat", "vat %"],
    },
    example: { es: "21", en: "21" },
  },
  {
    key: "phase",
    target: "budget_line",
    required: "never",
    type: "enum",
    enumValues: PROJECT_PHASES,
    labelKey: "phase",
    aliases: {
      es: ["fase", "etapa", "phase"],
      en: ["phase", "stage", "project phase"],
    },
    example: { es: "Obra", en: "Construction" },
  },
  {
    key: "supplier",
    target: "budget_line",
    required: "never",
    type: "lookup",
    lookup: "supplier",
    labelKey: "supplier",
    aliases: {
      es: ["proveedor", "supplier", "fabricante"],
      en: ["supplier", "vendor", "manufacturer"],
    },
    example: { es: "Constructora Sur", en: "South Builders" },
  },
  {
    key: "is_internal_cost",
    target: "budget_line",
    required: "never",
    type: "boolean",
    labelKey: "internalCost",
    aliases: {
      es: ["coste interno", "interno", "internal"],
      en: ["internal cost", "internal", "in-house"],
    },
    example: { es: "No", en: "No" },
  },
  {
    key: "is_price_tbd",
    target: "budget_line",
    required: "never",
    type: "boolean",
    labelKey: "priceTbd",
    aliases: {
      es: ["precio por definir", "precio tbd", "por definir", "tbd"],
      en: ["price tbd", "price to be defined", "tbd", "tba"],
    },
    example: { es: "No", en: "No" },
  },
  {
    key: "notes",
    target: "budget_line",
    required: "never",
    type: "text",
    labelKey: "notes",
    aliases: {
      es: ["notas", "comentarios", "observaciones"],
      en: ["notes", "comments", "remarks"],
    },
    example: { es: "Incluye materiales", en: "Includes materials" },
  },
] as const;

export function fieldsForTarget(
  target: ImportTarget
): readonly ImportFieldDef[] {
  return target === "product"
    ? PRODUCT_IMPORT_FIELDS
    : BUDGET_LINE_IMPORT_FIELDS;
}

export function isRequiredMarker(field: ImportFieldDef): boolean {
  return field.required === "always";
}

export function productImportFieldKeys(): string[] {
  return PRODUCT_IMPORT_FIELDS.map((f) => f.key);
}

export function budgetLineImportFieldKeys(): string[] {
  return BUDGET_LINE_IMPORT_FIELDS.map((f) => f.key);
}
