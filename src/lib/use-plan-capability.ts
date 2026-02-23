"use client";

import { useAuth } from "@/components/auth-provider";
import { getPlanConfigForDisplay } from "@/lib/plan-copy";
import {
  checkCapability,
  type CheckCapabilityOptions,
  type PlanFeatureKey,
} from "@/lib/plan-capability";

/**
 * Indica si la capacidad está disponible para la cuenta actual según su plan.
 * Usa el config efectivo de la sesión; si no hay o aún carga, usa BASE (restrictivo).
 *
 * @param featureKey - Clave de capacidad (consumible o modalidad).
 * @param options - minModality: exige al menos este nivel (ej. "plus" para filtros, "full" para white label).
 *
 * @example
 * const canShowTab = usePlanCapability("purchase_orders");
 * const canUseBudgetFilter = usePlanCapability("budget_mode", { minModality: "plus" });
 * const canExportWhiteLabel = usePlanCapability("budget_mode", { minModality: "full" });
 */
export function usePlanCapability(
  featureKey: PlanFeatureKey,
  options?: CheckCapabilityOptions
): boolean {
  const { effectivePlan, planLoading } = useAuth();
  const config = effectivePlan?.config ?? getPlanConfigForDisplay("BASE");
  return checkCapability(config, featureKey, options);
}
