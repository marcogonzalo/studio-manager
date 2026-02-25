/**
 * Verificación de capacidades por plan/modalidad.
 * Usar para mostrar, ocultar o deshabilitar elementos según el config del plan.
 * No incluye copy comercial (ver plan-copy.ts).
 */

import type { PlanConfig, PlanFeatureModality } from "@/types";

const CONSUMABLE_KEYS = [
  "projects_limit",
  "clients_limit",
  "suppliers_limit",
  "catalog_products_limit",
  "storage_limit_mb",
] as const;

const MODALITY_KEYS = [
  "pdf_export_mode",
  "multi_currency_per_project",
  "purchase_orders",
  "costs_management",
  "payments_management",
  "documents",
  "notes",
  "summary",
  "support_level",
] as const;

export type PlanFeatureKey =
  | (typeof CONSUMABLE_KEYS)[number]
  | (typeof MODALITY_KEYS)[number];

const CONSUMABLE_SET = new Set<string>(CONSUMABLE_KEYS);

function isConsumableKey(
  key: PlanFeatureKey
): key is (typeof CONSUMABLE_KEYS)[number] {
  return CONSUMABLE_SET.has(key);
}

const MODALITY_ORDER: PlanFeatureModality[] = ["none", "basic", "plus", "full"];

function modalityLevel(m: PlanFeatureModality | undefined): number {
  if (!m) return -1;
  const i = MODALITY_ORDER.indexOf(m);
  return i === -1 ? -1 : i;
}

/**
 * True si la capacidad está disponible (no es "none" y, para consumibles, límite > 0 o -1).
 * Usa effective_* cuando exista para projects_limit y storage_limit_mb.
 */
export function isCapabilityAvailable(
  config: PlanConfig | null | undefined,
  featureKey: PlanFeatureKey
): boolean {
  if (!config) return false;

  if (isConsumableKey(featureKey)) {
    let value: number;
    if (featureKey === "projects_limit") {
      value = config.effective_active_projects_limit ?? config.projects_limit;
    } else if (featureKey === "storage_limit_mb") {
      value = config.effective_storage_limit_mb ?? config.storage_limit_mb;
    } else {
      value = config[featureKey] as number;
    }
    return value > 0 || value === -1;
  }

  const modality = config[featureKey] as PlanFeatureModality | undefined;
  return modality != null && modality !== "none";
}

export type MinModality = "basic" | "plus" | "full";

/**
 * True si la modalidad del plan para esa clave es al menos minLevel (basic < plus < full).
 * Solo aplica a claves de modalidad; para consumibles devuelve isCapabilityAvailable.
 */
export function hasModalityAtLeast(
  config: PlanConfig | null | undefined,
  featureKey: PlanFeatureKey,
  minLevel: MinModality
): boolean {
  if (!config) return false;
  if (isConsumableKey(featureKey)) {
    return isCapabilityAvailable(config, featureKey);
  }
  const modality = config[featureKey] as PlanFeatureModality | undefined;
  return modalityLevel(modality) >= modalityLevel(minLevel);
}

export interface CheckCapabilityOptions {
  /** Exige que la modalidad sea al menos este nivel (solo para claves de modalidad). */
  minModality?: MinModality;
}

/**
 * Comprueba si la capacidad está disponible, opcionalmente con nivel mínimo de modalidad.
 * - Sin minModality: mismo que isCapabilityAvailable (disponible si no es none).
 * - Con minModality: para claves de modalidad exige ese nivel mínimo (ej. "plus" para filtros).
 */
export function checkCapability(
  config: PlanConfig | null | undefined,
  featureKey: PlanFeatureKey,
  options?: CheckCapabilityOptions
): boolean {
  if (!config) return false;
  if (options?.minModality != null) {
    return hasModalityAtLeast(config, featureKey, options.minModality);
  }
  return isCapabilityAvailable(config, featureKey);
}
