import type { BudgetCategory, ProjectPhase } from "@/types";
import { BUDGET_CATEGORIES, BUDGET_SUBCATEGORIES } from "@/lib/utils";
import type { ColumnMapping } from "./auto-map";
import type { ImportTarget } from "./fields";
import {
  BOOLEAN_FALSE_ALIASES,
  BOOLEAN_TRUE_ALIASES,
  BUDGET_CATEGORY_KEYS,
  PROJECT_PHASES,
} from "./fields";
import { normalizeHeader } from "./normalize-header";
import { resolveProductPricing } from "./pricing";
import { toCanonicalNumberString } from "./parse-locale-number";

export type NameLookup = {
  spacesByName: Map<string, string>; // normalized name → id
  suppliersByName: Map<string, string>;
};

export type ResolvedLookup =
  | { status: "empty" }
  | { status: "matched"; id: string; name: string }
  | { status: "create"; name: string };

export type ResolvedProductRow = {
  target: "product";
  name: string;
  quantity: string;
  unit_cost: string;
  markup: string;
  unit_price: string;
  is_price_tbd: boolean;
  tax_rate: string;
  description: string;
  category: string;
  reference_code: string;
  reference_url: string;
  internal_reference: string;
  internal_notes: string;
  space: ResolvedLookup;
  supplier: ResolvedLookup;
  pricingWarning?: "markup_recomputed";
  errors: string[];
};

export type ResolvedBudgetLineRow = {
  target: "budget_line";
  category: BudgetCategory | null;
  subcategory: string;
  needsCategory: boolean;
  description: string;
  estimated_amount: string;
  actual_amount: string;
  tax_rate: string;
  phase: ProjectPhase | "";
  supplier: ResolvedLookup;
  is_internal_cost: boolean;
  is_price_tbd: boolean;
  notes: string;
  errors: string[];
};

function mappedValue(
  source: Record<string, string>,
  mappings: ColumnMapping[],
  fieldKey: string
): string {
  const mapping = mappings.find((m) => m.fieldKey === fieldKey);
  if (!mapping) return "";
  return (source[mapping.sourceHeader] ?? "").trim();
}

export function parseBooleanCell(raw: string): boolean | null {
  if (raw.trim() === "") return null;
  const n = normalizeHeader(raw);
  if (BOOLEAN_TRUE_ALIASES.some((a) => normalizeHeader(a) === n)) return true;
  if (BOOLEAN_FALSE_ALIASES.some((a) => normalizeHeader(a) === n)) return false;
  return null;
}

function matchEnum(
  raw: string,
  values: readonly string[],
  labelFor: (value: string) => string
): string | null {
  if (raw.trim() === "") return null;
  const n = normalizeHeader(raw);
  for (const value of values) {
    if (normalizeHeader(value) === n) return value;
    if (normalizeHeader(labelFor(value)) === n) return value;
  }
  return null;
}

function resolveLookup(
  raw: string,
  byName: Map<string, string>
): ResolvedLookup {
  if (raw.trim() === "") return { status: "empty" };
  const n = normalizeHeader(raw);
  const id = byName.get(n);
  if (id) return { status: "matched", id, name: raw.trim() };
  return { status: "create", name: raw.trim() };
}

export function resolveProductRow(options: {
  source: Record<string, string>;
  mappings: ColumnMapping[];
  lookup: NameLookup;
  categoryLabels?: Record<string, string>;
}): ResolvedProductRow {
  const get = (key: string) =>
    mappedValue(options.source, options.mappings, key);
  const errors: string[] = [];
  const name = get("name");
  const quantity = get("quantity");
  const isPriceTbd = parseBooleanCell(get("is_price_tbd")) === true;

  const pricing = resolveProductPricing({
    unitCost: get("unit_cost"),
    markup: get("markup"),
    unitPrice: get("unit_price"),
    isPriceTbd,
  });

  let unit_cost = "";
  let markup = "";
  let unit_price = "";
  let pricingWarning: "markup_recomputed" | undefined;

  if (!pricing.ok) {
    errors.push(pricing.error);
  } else {
    unit_cost = String(pricing.unitCost);
    markup = String(pricing.markup);
    unit_price = pricing.unitPrice.toFixed(2);
    pricingWarning = pricing.warning;
  }

  return {
    target: "product",
    name,
    quantity,
    unit_cost,
    markup,
    unit_price,
    is_price_tbd: isPriceTbd,
    tax_rate: toCanonicalNumberString(get("tax_rate")),
    description: get("description"),
    category: get("category"),
    reference_code: get("reference_code"),
    reference_url: get("reference_url"),
    internal_reference: get("internal_reference"),
    internal_notes: get("internal_notes"),
    space: resolveLookup(get("space"), options.lookup.spacesByName),
    supplier: resolveLookup(get("supplier"), options.lookup.suppliersByName),
    pricingWarning,
    errors,
  };
}

export function resolveBudgetLineRow(options: {
  source: Record<string, string>;
  mappings: ColumnMapping[];
  lookup: NameLookup;
  translateCategory: (key: BudgetCategory) => string;
  translateSubcategory: (category: BudgetCategory, key: string) => string;
  translatePhase: (key: ProjectPhase) => string;
}): ResolvedBudgetLineRow {
  const get = (key: string) =>
    mappedValue(options.source, options.mappings, key);
  const errors: string[] = [];

  const category = matchEnum(get("category"), BUDGET_CATEGORY_KEYS, (k) =>
    options.translateCategory(k as BudgetCategory)
  ) as BudgetCategory | null;

  let subcategory = "other";
  if (category) {
    const subs = Object.keys(BUDGET_SUBCATEGORIES[category]);
    const matched = matchEnum(get("subcategory"), subs, (k) =>
      options.translateSubcategory(category, k)
    );
    subcategory = matched ?? "other";
  } else if (get("subcategory").trim() !== "") {
    // Try match across all categories for diagnostics only
    errors.push("category_unmatched");
  }

  const needsCategory = category == null;
  if (needsCategory) errors.push("needs_category");

  const phaseRaw = get("phase");
  const phase =
    (matchEnum(phaseRaw, PROJECT_PHASES, (k) =>
      options.translatePhase(k as ProjectPhase)
    ) as ProjectPhase | null) ?? "";

  const internal = parseBooleanCell(get("is_internal_cost"));
  const tbd = parseBooleanCell(get("is_price_tbd"));

  return {
    target: "budget_line",
    category,
    subcategory,
    needsCategory,
    description: get("description"),
    estimated_amount: toCanonicalNumberString(get("estimated_amount")) || "0",
    actual_amount: toCanonicalNumberString(get("actual_amount")) || "0",
    tax_rate: toCanonicalNumberString(get("tax_rate")),
    phase,
    supplier: resolveLookup(get("supplier"), options.lookup.suppliersByName),
    is_internal_cost: internal === true,
    is_price_tbd: tbd === true,
    notes: get("notes"),
    errors,
  };
}

export function resolveRows(options: {
  target: ImportTarget;
  sources: Record<string, string>[];
  mappings: ColumnMapping[];
  lookup: NameLookup;
  translateCategory: (key: BudgetCategory) => string;
  translateSubcategory: (category: BudgetCategory, key: string) => string;
  translatePhase: (key: ProjectPhase) => string;
}): Array<ResolvedProductRow | ResolvedBudgetLineRow> {
  if (options.target === "product") {
    return options.sources.map((source) =>
      resolveProductRow({
        source,
        mappings: options.mappings,
        lookup: options.lookup,
      })
    );
  }
  return options.sources.map((source) =>
    resolveBudgetLineRow({
      source,
      mappings: options.mappings,
      lookup: options.lookup,
      translateCategory: options.translateCategory,
      translateSubcategory: options.translateSubcategory,
      translatePhase: options.translatePhase,
    })
  );
}

/** Build a case/accent-insensitive name map. */
export function buildNameMap(
  entries: { id: string; name: string }[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of entries) {
    map.set(normalizeHeader(entry.name), entry.id);
  }
  return map;
}

export function categoryLabelMap(): Record<BudgetCategory, string> {
  return { ...BUDGET_CATEGORIES };
}
