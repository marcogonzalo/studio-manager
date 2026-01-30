import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ProjectPhase, BudgetCategory } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Error desconocido";
}

/**
 * Centraliza el reporte de errores (log; opcionalmente Sentry en el futuro).
 * Usar en lugar de console.error en rutas críticas.
 */
export function reportError(error: unknown, context?: string): void {
  if (context) {
    console.error(context, error);
  } else {
    console.error(error);
  }
}

/**
 * Centraliza avisos (log; opcionalmente monitoreo en el futuro).
 */
export function reportWarn(message: string): void {
  console.warn(message);
}

export function getPhaseLabel(phase?: ProjectPhase): string {
  if (!phase) return "No asignada";

  const labels: Record<ProjectPhase, string> = {
    diagnosis: "Diagnóstico",
    design: "Diseño",
    executive: "Proyecto Ejecutivo",
    budget: "Presupuestos",
    construction: "Obra",
    delivery: "Entrega",
  };

  return labels[phase];
}

// Budget Categories (value in DB → label in UI)
export const BUDGET_CATEGORIES: Record<BudgetCategory, string> = {
  construction: "Obra",
  own_fees: "Honorarios Propios",
  external_services: "Servicios Externos",
  operations: "Gastos Operativos",
} as const;

// Categorías que representan costes reales (no ingresos)
// Los honorarios propios (own_fees) son ingresos, no costes
export const COST_CATEGORIES: BudgetCategory[] = [
  "construction",
  "external_services",
  "operations",
];

// Helper para determinar si una categoría es un coste real
export const isCostCategory = (category: BudgetCategory): boolean =>
  COST_CATEGORIES.includes(category);

// Subcategories by Category (value in DB → label in UI)
export const BUDGET_SUBCATEGORIES: Record<
  BudgetCategory,
  Record<string, string>
> = {
  construction: {
    demolition: "Demolición",
    masonry: "Albañilería",
    electricity: "Electricidad",
    plumbing: "Fontanería",
    interior_painting: "Pintura Interior",
    exterior_painting: "Pintura Exterior",
    domotics: "Domótica",
    carpentry: "Carpintería",
    locksmithing: "Cerrajería",
    hvac: "Climatización",
    flooring: "Suelos y Pavimentos",
    tiling: "Alicatados",
    other: "Otros",
  },
  own_fees: {
    design: "Diseño",
    executive_project: "Proyecto Ejecutivo",
    site_supervision: "Supervisión de Obra",
    management: "Gestión y Coordinación",
    other: "Otros",
  },
  external_services: {
    technical_architect: "Arquitecto Técnico",
    engineering: "Ingenierías",
    logistics: "Logística",
    permits: "Gestión de Permisos",
    consulting: "Consultoría",
    other: "Otros",
  },
  operations: {
    shipping: "Envío",
    packaging: "Embalaje",
    transport: "Transporte",
    storage: "Almacenamiento",
    insurance: "Seguros",
    customs: "Aduanas",
    handling: "Manipulación",
    other: "Otros",
  },
} as const;

// Helper to get category label
export function getBudgetCategoryLabel(category: BudgetCategory): string {
  return BUDGET_CATEGORIES[category] || category;
}

// Helper to get subcategory label
export function getBudgetSubcategoryLabel(
  category: BudgetCategory,
  subcategory: string
): string {
  return BUDGET_SUBCATEGORIES[category]?.[subcategory] || subcategory;
}

// Get all subcategories for a category as options array
export function getSubcategoryOptions(
  category: BudgetCategory
): { value: string; label: string }[] {
  const subcategories = BUDGET_SUBCATEGORIES[category];
  if (!subcategories) return [];

  return Object.entries(subcategories).map(([value, label]) => ({
    value,
    label,
  }));
}

// Get all categories as options array
export function getCategoryOptions(): {
  value: BudgetCategory;
  label: string;
}[] {
  return Object.entries(BUDGET_CATEGORIES).map(([value, label]) => ({
    value: value as BudgetCategory,
    label,
  }));
}
