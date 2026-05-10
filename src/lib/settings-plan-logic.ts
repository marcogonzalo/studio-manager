import type { PlanConfig } from "@/types";

export interface PlanAssignmentHistoryRow {
  expires_at: string;
}

export function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getCurrentAssignment<T extends PlanAssignmentHistoryRow>(
  history: T[],
  todayStart: Date
): T | undefined {
  return history.find((r) => new Date(r.expires_at) >= todayStart);
}

export function getPastHistory<T extends PlanAssignmentHistoryRow>(
  history: T[],
  todayStart: Date
): T[] {
  return history.filter((r) => new Date(r.expires_at) < todayStart);
}

export type SettingsPlanExpiryMessageKey = "renewsOn" | "endsOn";

export function getSettingsPlanExpiryMessageKey(
  nextPeriodDuration: string | null | undefined
): SettingsPlanExpiryMessageKey {
  return nextPeriodDuration ? "renewsOn" : "endsOn";
}

export function shouldShowPlanExpiryText(params: {
  planCode: string;
  assignment: PlanAssignmentHistoryRow | null | undefined;
}): boolean {
  if (params.planCode === "BASE") return false;
  return Boolean(params.assignment?.expires_at);
}

export const SETTINGS_PLAN_NUMERIC_CONSUMABLE_KEYS = [
  "projects",
  "clients",
  "suppliers",
  "products",
] as const;

export type SettingsPlanNumericConsumableKey =
  (typeof SETTINGS_PLAN_NUMERIC_CONSUMABLE_KEYS)[number];

export const SETTINGS_PLAN_CONFIG_LIMIT_KEYS: Record<
  SettingsPlanNumericConsumableKey,
  keyof Pick<
    PlanConfig,
    | "projects_limit"
    | "clients_limit"
    | "suppliers_limit"
    | "catalog_products_limit"
  >
> = {
  projects: "projects_limit",
  clients: "clients_limit",
  suppliers: "suppliers_limit",
  products: "catalog_products_limit",
};

export function getFallbackNumericConsumableLimit(
  key: SettingsPlanNumericConsumableKey
): number {
  if (key === "projects") return 1;
  if (key === "products") return 50;
  return 10;
}

export function resolveNumericConsumableLimit(
  key: SettingsPlanNumericConsumableKey,
  config: PlanConfig | null | undefined
): number {
  const raw = config?.[SETTINGS_PLAN_CONFIG_LIMIT_KEYS[key]];
  return raw ?? getFallbackNumericConsumableLimit(key);
}

export const DEFAULT_SETTINGS_PLAN_STORAGE_LIMIT_MB = 500;

export function resolveStorageLimitMb(
  config: PlanConfig | null | undefined
): number {
  return config?.storage_limit_mb ?? DEFAULT_SETTINGS_PLAN_STORAGE_LIMIT_MB;
}

export function consumableUsageBarPercent(used: number, limit: number): number {
  if (limit === -1) return 5;
  if (limit === 0) return 0;
  return Math.min(100, (used / limit) * 100);
}

export function storageUsageBarPercent(
  usedBytes: number,
  limitMB: number
): number {
  if (limitMB === -1) return 5;
  if (limitMB === 0) return 0;
  const limitBytes = limitMB * 1024 * 1024;
  return Math.min(100, (usedBytes / limitBytes) * 100);
}
