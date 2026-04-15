import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ProjectPhase, BudgetCategory } from "@/types";
import { defaultLocale } from "@/i18n/config";
import {
  formatCurrencyWithLang,
  formatDateByPattern,
  formatNumberWithLang,
  getCurrencySymbolWithLang,
  intlLocaleForAppLang,
} from "@/lib/formatting";

export { CURRENCIES } from "@/lib/currencies";

/**
 * Clase estándar para inputs en vistas de configuración (Cuenta, Personalización, etc.).
 * Ancho estándar (max-w-md); no usar en inputs inline o cuando se defina un tamaño más pequeño.
 */
export const INPUT_CONFIG_STANDARD_CLASS = "h-9 max-w-md text-sm";

export interface FormatCurrencyOptions {
  /** Máximo de decimales. 0 para ocultar decimales en precios enteros. */
  maxFractionDigits?: number;
}

/** Formatea un importe con la moneda (locale por defecto: idioma de la app, hoy `es`). Preferir `useAppFormatting().formatCurrency` en /veta-app. */
export function formatCurrency(
  amount: number,
  currencyCode?: string,
  options?: FormatCurrencyOptions
): string {
  return formatCurrencyWithLang(amount, currencyCode, defaultLocale, options);
}

/**
 * Formatea una fecha. Sin opciones usa patrón `DD/MM/YYYY` (consistente SSR/cliente).
 * Con opciones granulares usa `Intl` con locale por defecto `es`. En /veta-app usar `useAppFormatting().formatDate`.
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions & { locale?: string }
): string {
  const { locale: optLocale, ...rest } = options ?? {};
  const opts = rest as Record<string, unknown>;
  const hasGranular = (
    ["day", "month", "year", "weekday", "hour", "minute", "second"] as const
  ).some((k) => opts[k] !== undefined);
  if (!hasGranular && Object.keys(opts).length === 0 && !optLocale) {
    return formatDateByPattern(date, "DD/MM/YYYY");
  }
  const d =
    typeof date === "object" && "getTime" in date ? date : new Date(date);
  const intlLocale = optLocale ?? intlLocaleForAppLang(defaultLocale);
  const formatOpts = hasGranular
    ? (rest as Intl.DateTimeFormatOptions)
    : { dateStyle: "short" as const, ...(rest as Intl.DateTimeFormatOptions) };
  return new Intl.DateTimeFormat(intlLocale, formatOpts).format(d);
}

/** Número con separadores según locale por defecto `es`. Preferir `useAppFormatting().formatNumber` en /veta-app. */
export function formatNumber(
  amount: number,
  options?: Intl.NumberFormatOptions
): string {
  return formatNumberWithLang(amount, defaultLocale, options);
}

/** Devuelve el símbolo de moneda según locale por defecto `es`. */
export function getCurrencySymbol(currencyCode?: string): string {
  return getCurrencySymbolWithLang(currencyCode, defaultLocale);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  const obj = error as { message?: string; details?: string } | null;
  if (obj && typeof obj.message === "string" && obj.message.trim())
    return obj.message.trim();
  if (obj && typeof obj.details === "string" && obj.details.trim())
    return obj.details.trim();
  return "Error desconocido";
}

/** Códigos que el backend puede incluir en el mensaje de error para identificar tipo de restricción por plan. */
export const PLAN_ERROR_CODES = {
  /** Se superó un cupo o límite (proyectos activos, almacenamiento, etc.). */
  LIMIT_EXCEEDED: "PLAN_LIMIT_EXCEEDED",
  /** La acción o funcionalidad no está disponible en el plan actual. */
  FEATURE_UNAVAILABLE: "PLAN_FEATURE_UNAVAILABLE",
} as const;

/** Mensajes de error por plan para mostrar al usuario. Mejora la comunicación al diferenciar límite excedido vs acción no disponible. */
export const PLAN_ERROR_MESSAGES = {
  limitExceeded: {
    title: "Límite excedido",
    description:
      "Has alcanzado el límite de tu plan. Mejora tu plan para ampliar cupos y continuar.",
  },
  featureUnavailable: {
    title: "Acción no disponible en tu plan",
    description:
      "Esta funcionalidad no está incluida en tu plan actual. Mejora tu plan para acceder.",
  },
} as const;

function getErrorMessageString(error: unknown): string {
  return error instanceof Error
    ? error.message
    : typeof (error as { message?: string })?.message === "string"
      ? (error as { message: string }).message
      : "";
}

/** True when the error is from plan limit (backend rejected with PLAN_LIMIT_EXCEEDED). */
export function isPlanLimitExceeded(error: unknown): boolean {
  return getErrorMessageString(error).includes(PLAN_ERROR_CODES.LIMIT_EXCEEDED);
}

/** True when the error is from plan feature not available (backend rejected with PLAN_FEATURE_UNAVAILABLE). */
export function isPlanFeatureUnavailable(error: unknown): boolean {
  return getErrorMessageString(error).includes(
    PLAN_ERROR_CODES.FEATURE_UNAVAILABLE
  );
}

/** Tipo de error por plan, si aplica. */
export type PlanErrorType = "limit_exceeded" | "feature_unavailable";

/** Detecta si el error es por restricción de plan y devuelve el tipo. */
export function getPlanErrorType(error: unknown): PlanErrorType | null {
  const msg = getErrorMessageString(error);
  if (msg.includes(PLAN_ERROR_CODES.LIMIT_EXCEEDED)) return "limit_exceeded";
  if (msg.includes(PLAN_ERROR_CODES.FEATURE_UNAVAILABLE))
    return "feature_unavailable";
  return null;
}

/** Devuelve el mensaje de error por plan para mostrar al usuario (title + description), o null si no es error de plan. */
export function getPlanErrorMessage(error: unknown): {
  title: string;
  description: string;
} | null {
  const type = getPlanErrorType(error);
  if (type === "limit_exceeded") return PLAN_ERROR_MESSAGES.limitExceeded;
  if (type === "feature_unavailable")
    return PLAN_ERROR_MESSAGES.featureUnavailable;
  return null;
}

/** Código de error cuando la cuenta es demo y las escrituras están bloqueadas. */
export const DEMO_ACCOUNT_READ_ONLY = "DEMO_ACCOUNT_READ_ONLY" as const;

/** Mensaje amable para cuenta demo (solo lectura en escrituras). */
export const DEMO_ACCOUNT_MESSAGE = {
  title: "Cuenta de demostración",
  description:
    "Las acciones de creación, edición y eliminación están desactivadas en esta cuenta.",
} as const;

/** True when the error is from demo account write restriction. */
export function isDemoAccountError(error: unknown): boolean {
  const msg = getErrorMessageString(error);
  if (msg.includes(DEMO_ACCOUNT_READ_ONLY)) return true;
  const code = (error as { code?: string })?.code;
  return code === DEMO_ACCOUNT_READ_ONLY;
}

/** Devuelve el mensaje para mostrar cuando el error es por cuenta demo (solo lectura), o null. */
export function getDemoAccountMessage(error: unknown): {
  title: string;
  description: string;
} | null {
  if (!isDemoAccountError(error)) return null;
  return DEMO_ACCOUNT_MESSAGE;
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

/** Etiqueta en español del estado del proyecto (active, completed, cancelled). */
export function getProjectStatusLabel(status?: string | null): string {
  if (!status || !status.trim()) return "—";
  const labels: Record<string, string> = {
    active: "Activo",
    completed: "Completado",
    cancelled: "Cancelado",
    draft: "Borrador",
  };
  return labels[status.toLowerCase()] ?? status;
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
