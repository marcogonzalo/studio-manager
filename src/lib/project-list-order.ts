import type { BudgetCategory } from "@/types";

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

export type OrderableSpaceItem = {
  id?: string;
  created_at?: string | null;
  space_id?: string | null;
  space?: { name?: string | null; created_at?: string | null } | null;
  space_name?: string | null;
  space_created_at?: string | null;
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
