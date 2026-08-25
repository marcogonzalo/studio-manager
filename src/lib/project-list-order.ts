import type { BudgetCategory } from "@/types";
import {
  normalizeBudgetSettings,
  type BudgetPhaseFilter,
  type BudgetSettings,
  type BudgetSortField,
} from "@/lib/budget-settings";

export type NormalizedBudgetSettings = ReturnType<
  typeof normalizeBudgetSettings
>;

export const BUDGET_PHASE_DISPLAY_ORDER = [
  "diagnosis",
  "design",
  "executive",
  "budget",
  "construction",
  "delivery",
  "no_phase",
] as const;

export type BudgetPhaseDisplayKey = (typeof BUDGET_PHASE_DISPLAY_ORDER)[number];

export const BUDGET_CATEGORY_DISPLAY_ORDER: BudgetCategory[] = [
  "own_fees",
  "external_services",
  "construction",
  "operations",
];

export const UNASSIGNED_SPACE_KEY = "__unassigned_space__";

export type OrderableBudgetLine = {
  id?: string;
  phase?: string | null;
  category: string;
  created_at?: string | null;
};

export type SortableBudgetLine = OrderableBudgetLine & {
  description?: string | null;
  subcategory?: string;
  supplier?: { name?: string | null } | null;
  supplier_name?: string | null;
};

export type OrderableSpaceItem = {
  id?: string;
  created_at?: string | null;
  space_id?: string | null;
  space?: { name?: string | null; created_at?: string | null } | null;
  space_name?: string | null;
  space_created_at?: string | null;
};

export type SortableProduct = OrderableSpaceItem & {
  name?: string;
  internal_reference?: string | null;
  supplier?: { name?: string | null } | null;
  supplier_name?: string | null;
};

export type OrderableSpace = {
  id?: string;
  created_at?: string | null;
};

function indexOrLast(order: readonly string[], value: string | null): number {
  const index = value ? order.indexOf(value) : -1;
  return index === -1 ? order.length : index;
}

function timestampOrLast(value?: string | null): number {
  if (!value) return Number.POSITIVE_INFINITY;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function compareNullableText(a?: string | null, b?: string | null): number {
  return (a ?? "").localeCompare(b ?? "");
}

export function budgetPhaseKey(phase?: string | null): string {
  if (!phase) return "no_phase";
  return phase;
}

export function orderedBudgetPhaseKeys(
  grouped: Record<string, unknown>
): string[] {
  const extras = Object.keys(grouped).filter(
    (phase) =>
      !(BUDGET_PHASE_DISPLAY_ORDER as readonly string[]).includes(phase)
  );
  return [...BUDGET_PHASE_DISPLAY_ORDER, ...extras].filter(
    (phase) => grouped[phase] != null
  );
}

export function orderedBudgetCategoryKeys(
  grouped: Record<string, unknown>
): string[] {
  const extras = Object.keys(grouped).filter(
    (category) =>
      !(BUDGET_CATEGORY_DISPLAY_ORDER as readonly string[]).includes(category)
  );
  return [...BUDGET_CATEGORY_DISPLAY_ORDER, ...extras].filter(
    (category) => grouped[category] != null
  );
}

function applySortDirection(cmp: number, direction: "asc" | "desc"): number {
  return direction === "desc" ? -cmp : cmp;
}

function supplierName(
  line: Pick<SortableBudgetLine, "supplier" | "supplier_name">
): string {
  return line.supplier?.name ?? line.supplier_name ?? "";
}

function productSupplierName(
  item: Pick<SortableProduct, "supplier" | "supplier_name">
): string {
  return item.supplier?.name ?? item.supplier_name ?? "";
}

function compareBudgetLineByField(
  a: SortableBudgetLine,
  b: SortableBudgetLine,
  field: BudgetSortField
): number {
  switch (field) {
    case "internal_code":
      return compareNullableText(a.subcategory, b.subcategory);
    case "alphabetical":
      return compareNullableText(
        a.description ?? a.subcategory,
        b.description ?? b.subcategory
      );
    case "supplier":
      return compareNullableText(supplierName(a), supplierName(b));
    case "created_at":
    default:
      return timestampOrLast(a.created_at) - timestampOrLast(b.created_at);
  }
}

function compareProductByField(
  a: SortableProduct,
  b: SortableProduct,
  field: BudgetSortField
): number {
  switch (field) {
    case "internal_code":
      return compareNullableText(a.internal_reference, b.internal_reference);
    case "alphabetical":
      return compareNullableText(a.name, b.name);
    case "supplier":
      return compareNullableText(
        productSupplierName(a),
        productSupplierName(b)
      );
    case "created_at":
    default:
      return timestampOrLast(a.created_at) - timestampOrLast(b.created_at);
  }
}

export function compareBudgetLinesWithinCategory(
  a: SortableBudgetLine,
  b: SortableBudgetLine,
  settings: NormalizedBudgetSettings
): number {
  const fieldCmp = compareBudgetLineByField(a, b, settings.sort_field);
  if (fieldCmp !== 0) {
    return applySortDirection(fieldCmp, settings.sort_direction);
  }
  return compareNullableText(a.id, b.id);
}

export function compareProductsWithinSpace(
  a: SortableProduct,
  b: SortableProduct,
  settings: NormalizedBudgetSettings
): number {
  const fieldCmp = compareProductByField(a, b, settings.sort_field);
  if (fieldCmp !== 0) {
    return applySortDirection(fieldCmp, settings.sort_direction);
  }
  return compareNullableText(a.id, b.id);
}

export function filterBudgetLinesByPhase<T extends OrderableBudgetLine>(
  lines: T[],
  phaseFilter: BudgetPhaseFilter
): T[] {
  if (phaseFilter === "all") return lines;
  return lines.filter((line) => budgetPhaseKey(line.phase) === phaseFilter);
}

export function filterProductsBySpaces<T extends OrderableSpaceItem>(
  items: T[],
  visibleSpaceIds: string[] | null | undefined
): T[] {
  if (visibleSpaceIds == null) return items;
  const allowed = new Set(visibleSpaceIds);
  return items.filter((item) => {
    const key = spaceGroupKey(item);
    if (key === UNASSIGNED_SPACE_KEY) {
      return allowed.has(UNASSIGNED_SPACE_KEY);
    }
    if (item.space_id) return allowed.has(item.space_id);
    return allowed.has(key);
  });
}

export function groupBudgetLinesByPhaseThenCategoryWithSettings<
  T extends SortableBudgetLine,
>(
  lines: T[],
  settings: BudgetSettings | null | undefined
): Record<string, Record<string, T[]>> {
  const normalized = normalizeBudgetSettings(settings);
  const filtered = filterBudgetLinesByPhase(lines, normalized.phase_filter);
  const grouped: Record<string, Record<string, T[]>> = {};

  for (const line of sortBudgetLines(filtered)) {
    const phase = budgetPhaseKey(line.phase);
    const category = line.category;
    if (!grouped[phase]) grouped[phase] = {};
    if (!grouped[phase][category]) grouped[phase][category] = [];
    grouped[phase][category].push(line);
  }

  for (const phase of Object.keys(grouped)) {
    for (const category of Object.keys(grouped[phase])) {
      grouped[phase][category].sort((a, b) =>
        compareBudgetLinesWithinCategory(a, b, normalized)
      );
    }
  }

  return grouped;
}

export function groupItemsBySpaceWithSettings<T extends SortableProduct>(
  items: T[],
  unassignedLabel: string,
  settings: BudgetSettings | null | undefined
): { spaceKey: string; spaceName: string; items: T[] }[] {
  const normalized = normalizeBudgetSettings(settings);
  const filtered = filterProductsBySpaces(items, normalized.visible_space_ids);
  const groups = new Map<string, { spaceName: string; items: T[] }>();

  for (const item of sortProjectItemsBySpaceThenCreatedAt(filtered)) {
    const key = spaceGroupKey(item);
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(key, {
        spaceName: spaceDisplayName(item, unassignedLabel),
        items: [item],
      });
    }
  }

  return Array.from(groups.entries()).map(([spaceKey, group]) => ({
    spaceKey,
    spaceName: group.spaceName,
    items: [...group.items].sort((a, b) =>
      compareProductsWithinSpace(a, b, normalized)
    ),
  }));
}

export function applyBudgetPresentation<
  TLine extends SortableBudgetLine,
  TProduct extends SortableProduct,
>({
  budgetLines,
  products,
  settings,
  unassignedLabel,
}: {
  budgetLines: TLine[];
  products: TProduct[];
  settings: BudgetSettings | null | undefined;
  unassignedLabel: string;
}) {
  const normalized = normalizeBudgetSettings(settings);
  const visibleBudgetLines = filterBudgetLinesByPhase(
    budgetLines,
    normalized.phase_filter
  );
  const visibleProducts = filterProductsBySpaces(
    products,
    normalized.visible_space_ids
  );

  return {
    settings: normalized,
    visibleBudgetLines,
    visibleProducts,
    budgetLinesByPhaseAndCategory:
      groupBudgetLinesByPhaseThenCategoryWithSettings(budgetLines, settings),
    productsBySpace: groupItemsBySpaceWithSettings(
      products,
      unassignedLabel,
      settings
    ),
  };
}

export function compareBudgetLines(
  a: OrderableBudgetLine,
  b: OrderableBudgetLine
): number {
  const phaseCmp =
    indexOrLast(BUDGET_PHASE_DISPLAY_ORDER, budgetPhaseKey(a.phase)) -
    indexOrLast(BUDGET_PHASE_DISPLAY_ORDER, budgetPhaseKey(b.phase));
  if (phaseCmp !== 0) return phaseCmp;

  const categoryCmp =
    indexOrLast(BUDGET_CATEGORY_DISPLAY_ORDER, a.category) -
    indexOrLast(BUDGET_CATEGORY_DISPLAY_ORDER, b.category);
  if (categoryCmp !== 0) return categoryCmp;

  const createdCmp =
    timestampOrLast(a.created_at) - timestampOrLast(b.created_at);
  if (createdCmp !== 0) return createdCmp;

  return compareNullableText(a.id, b.id);
}

export function sortBudgetLines<T extends OrderableBudgetLine>(
  lines: T[]
): T[] {
  return [...lines].sort(compareBudgetLines);
}

export function groupBudgetLinesByPhaseThenCategory<
  T extends OrderableBudgetLine,
>(lines: T[]): Record<string, Record<string, T[]>> {
  const grouped: Record<string, Record<string, T[]>> = {};
  for (const line of sortBudgetLines(lines)) {
    const phase = budgetPhaseKey(line.phase);
    const category = line.category;
    if (!grouped[phase]) grouped[phase] = {};
    if (!grouped[phase][category]) grouped[phase][category] = [];
    grouped[phase][category].push(line);
  }
  return grouped;
}

export function sortSpacesByCreatedAt<T extends OrderableSpace>(
  spaces: T[]
): T[] {
  return [...spaces].sort((a, b) => {
    const createdCmp =
      timestampOrLast(a.created_at) - timestampOrLast(b.created_at);
    if (createdCmp !== 0) return createdCmp;
    return compareNullableText(a.id, b.id);
  });
}

function isUnassignedSpace(item: OrderableSpaceItem): boolean {
  if (item.space_id) return false;
  const name = (item.space?.name ?? item.space_name ?? "").trim();
  return !name;
}

function spaceCreatedAt(item: OrderableSpaceItem): string | null {
  return item.space?.created_at ?? item.space_created_at ?? null;
}

function spaceGroupKey(item: OrderableSpaceItem): string {
  if (item.space_id) return `id:${item.space_id}`;
  const name = (item.space?.name ?? item.space_name ?? "").trim();
  if (!name) return UNASSIGNED_SPACE_KEY;
  return `name:${name}`;
}

function spaceDisplayName(
  item: OrderableSpaceItem,
  unassignedLabel: string
): string {
  const name = (item.space?.name ?? item.space_name ?? "").trim();
  return name || unassignedLabel;
}

export function compareProjectItemsBySpaceThenCreatedAt(
  a: OrderableSpaceItem,
  b: OrderableSpaceItem
): number {
  const aUnassigned = isUnassignedSpace(a);
  const bUnassigned = isUnassignedSpace(b);
  if (aUnassigned !== bUnassigned) return aUnassigned ? 1 : -1;

  const spaceCreatedCmp =
    timestampOrLast(spaceCreatedAt(a)) - timestampOrLast(spaceCreatedAt(b));
  if (spaceCreatedCmp !== 0) return spaceCreatedCmp;

  const spaceKeyCmp = compareNullableText(spaceGroupKey(a), spaceGroupKey(b));
  if (spaceKeyCmp !== 0) return spaceKeyCmp;

  const itemCreatedCmp =
    timestampOrLast(a.created_at) - timestampOrLast(b.created_at);
  if (itemCreatedCmp !== 0) return itemCreatedCmp;

  return compareNullableText(a.id, b.id);
}

export function sortProjectItemsBySpaceThenCreatedAt<
  T extends OrderableSpaceItem,
>(items: T[]): T[] {
  return [...items].sort(compareProjectItemsBySpaceThenCreatedAt);
}

export function groupItemsBySpaceThenCreatedAt<T extends OrderableSpaceItem>(
  items: T[],
  unassignedLabel: string
): { spaceKey: string; spaceName: string; items: T[] }[] {
  const groups = new Map<string, { spaceName: string; items: T[] }>();
  for (const item of sortProjectItemsBySpaceThenCreatedAt(items)) {
    const key = spaceGroupKey(item);
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(key, {
        spaceName: spaceDisplayName(item, unassignedLabel),
        items: [item],
      });
    }
  }
  return Array.from(groups.entries()).map(([spaceKey, group]) => ({
    spaceKey,
    spaceName: group.spaceName,
    items: group.items,
  }));
}

export function uniqueSpaceKeysByCreatedAt(
  entries: { key: string; createdAt?: string | null }[]
): string[] {
  const firstByKey = new Map<string, string | null | undefined>();
  for (const entry of entries) {
    if (!firstByKey.has(entry.key)) {
      firstByKey.set(entry.key, entry.createdAt);
    }
  }
  return [...firstByKey.entries()]
    .sort(([keyA, createdA], [keyB, createdB]) => {
      const aUnassigned = keyA === UNASSIGNED_SPACE_KEY;
      const bUnassigned = keyB === UNASSIGNED_SPACE_KEY;
      if (aUnassigned !== bUnassigned) return aUnassigned ? 1 : -1;
      const createdCmp = timestampOrLast(createdA) - timestampOrLast(createdB);
      if (createdCmp !== 0) return createdCmp;
      return keyA.localeCompare(keyB);
    })
    .map(([key]) => key);
}
