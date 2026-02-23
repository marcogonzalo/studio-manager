/**
 * Mapeo plan → copy comercial.
 * Fuente única para /pricing y /settings/plan (change). Ver docs/plan-copy-mapping.md.
 */

import type { PlanConfig, PlanFeatureModality } from "@/types";

// --- Consumibles: copy por valor ---

function formatProjectsLimit(n: number): string | null {
  if (n === 0) return null;
  if (n === 1) return "1 proyecto activo";
  if (n === -1) return "Proyectos ilimitados";
  return `${n} proyectos activos`;
}

function formatClientsLimit(n: number): string | null {
  if (n === 0) return null;
  if (n === -1) return "Clientes ilimitados";
  return `${n} clientes`;
}

function formatSuppliersLimit(n: number): string | null {
  if (n === 0) return null;
  if (n === -1) return "Proveedores ilimitados";
  return `${n} proveedores`;
}

function formatCatalogProductsLimit(n: number): string | null {
  if (n === 0) return null;
  if (n === -1) return "Productos ilimitados";
  return `${n} productos en catálogo`;
}

function formatStorageLimitMb(n: number): string | null {
  if (n === 0) return null;
  if (n === -1) return "Almacenamiento ilimitado";
  if (n === 500) return "500 MB de almacenamiento";
  if (n === 10240) return "10 GB de almacenamiento";
  if (n === 102400) return "100 GB de almacenamiento";
  if (n >= 1024) return `${(n / 1024).toFixed(0)} GB de almacenamiento`;
  return `${n} MB de almacenamiento`;
}

// --- Modalidades: copy por columna y nivel (none → no se emite) ---

type ModalityCopy = Partial<
  Record<Exclude<PlanFeatureModality, "none">, string>
>;

const MODALITY_COPY: Record<
  keyof Pick<
    PlanConfig,
    | "budget_mode"
    | "multi_currency_per_project"
    | "purchase_orders"
    | "costs_management"
    | "payments_management"
    | "documents"
    | "notes"
    | "summary"
    | "support_level"
  >,
  ModalityCopy
> = {
  budget_mode: {
    basic: "Exportación de presupuesto en PDF",
    plus: "Presupuesto personalizado",
    full: "Presupuesto personalizable con marca propia (white label)",
  },
  multi_currency_per_project: {
    basic: "Única moneda para toda la cuenta",
    plus: "Única moneda e impuesto en toda la cuenta",
    full: "Moneda e impuesto por proyecto",
  },
  purchase_orders: {
    basic: "Pedidos de compra",
    plus: "Pedidos de compra",
    full: "Pedidos de compra",
  },
  costs_management: {
    basic: "Control de costes",
    plus: "Control de costes y márgenes",
    full: "Control de costes y márgenes",
  },
  payments_management: {
    basic: "Control de pagos",
    plus: "Control de pagos",
    full: "Control de pagos",
  },
  documents: {
    basic: "Subida de renders y documentos",
    plus: "Subida de renders y documentos",
    full: "Subida de renders y documentos",
  },
  notes: {
    basic: "Notas de proyecto",
    plus: "Notas de proyecto",
    full: "Notas de proyecto",
  },
  summary: {
    basic: "Resumen de estado de proyecto",
    plus: "Resumen de estado de proyecto",
    full: "Resumen de estado de proyecto",
  },
  support_level: {
    basic: "Soporte por email",
    plus: "Soporte por email",
    full: "Soporte prioritario",
  },
};

const MODALITY_ORDER: (keyof typeof MODALITY_COPY)[] = [
  "budget_mode",
  "costs_management",
  "payments_management",
  "purchase_orders",
  "summary",
  "documents",
  "notes",
  "multi_currency_per_project",
  "support_level",
];

/** Claves de consumibles (límites numéricos) */
const CONSUMABLE_KEYS = [
  "projects_limit",
  "clients_limit",
  "suppliers_limit",
  "catalog_products_limit",
  "storage_limit_mb",
] as const;

/**
 * Claves que se pueden incluir o excluir al generar el listado.
 * Usar en getCommercialFeatures(config, { include: [...] }) para vistas compactas.
 */
export type PlanFeatureKey =
  | (typeof CONSUMABLE_KEYS)[number]
  | keyof typeof MODALITY_COPY;

/** Subconjunto típico para vista compacta: proyectos, almacenamiento, presupuesto, soporte */
export const COMPACT_FEATURE_KEYS: PlanFeatureKey[] = [
  "projects_limit",
  // "clients_limit",
  // "suppliers_limit",
  // "catalog_products_limit",
  "storage_limit_mb",
  "budget_mode",
  "costs_management",
  "payments_management",
  "purchase_orders",
  "multi_currency_per_project",
  "documents",
  "notes",
  "summary",
  "support_level",
];

/** Todas las claves en el orden en que se emiten (consumibles + modalidades) */
export const ALL_FEATURE_KEYS: PlanFeatureKey[] = [
  ...CONSUMABLE_KEYS,
  ...MODALITY_ORDER,
];

function copyForModality(
  key: keyof typeof MODALITY_COPY,
  modality: PlanFeatureModality | undefined
): string | null {
  if (!modality || modality === "none") return null;
  const copy = MODALITY_COPY[key][modality];
  return copy ?? null;
}

export interface GetCommercialFeaturesOptions {
  /**
   * Si se define, solo se incluyen las claves indicadas (en el orden estándar).
   * Útil para vistas compactas. Ver COMPACT_FEATURE_KEYS y ALL_FEATURE_KEYS.
   */
  include?: PlanFeatureKey[];
}

/**
 * Genera el array de textos comerciales para un plan a partir de su config.
 * Orden: consumibles (proyectos, clientes, proveedores, productos, almacenamiento), luego modalidades.
 *
 * Con `options.include` puedes restringir qué features se muestran para hacer la vista más compacta.
 * @example
 * getCommercialFeatures(config) // todas
 * getCommercialFeatures(config, { include: COMPACT_FEATURE_KEYS }) // solo proyectos, almacenamiento, presupuesto, soporte
 */
export function getCommercialFeatures(
  config: PlanConfig,
  options?: GetCommercialFeaturesOptions
): string[] {
  const includeSet =
    options?.include == null ? null : new Set<PlanFeatureKey>(options.include);

  const out: string[] = [];

  const consumibleResults: {
    key: (typeof CONSUMABLE_KEYS)[number];
    copy: string | null;
  }[] = [
    {
      key: "projects_limit",
      copy: formatProjectsLimit(
        config.effective_active_projects_limit ?? config.projects_limit
      ),
    },
    { key: "clients_limit", copy: formatClientsLimit(config.clients_limit) },
    {
      key: "suppliers_limit",
      copy: formatSuppliersLimit(config.suppliers_limit),
    },
    {
      key: "catalog_products_limit",
      copy: formatCatalogProductsLimit(config.catalog_products_limit),
    },
    {
      key: "storage_limit_mb",
      copy: formatStorageLimitMb(
        config.effective_storage_limit_mb ?? config.storage_limit_mb
      ),
    },
  ];

  for (const { key, copy } of consumibleResults) {
    if (includeSet !== null && !includeSet.has(key)) continue;
    if (copy) out.push(copy);
  }

  for (const key of MODALITY_ORDER) {
    if (includeSet !== null && !includeSet.has(key)) continue;
    const copy = copyForModality(key, config[key]);
    if (copy) out.push(copy);
  }

  return out;
}

/**
 * Configuración estática por plan (alineada con la BD según docs/plan-copy-mapping.md).
 * Usar para /pricing y /settings/plan/change cuando no se dispone del config desde la API.
 */
export const STATIC_PLAN_CONFIGS: Record<
  "BASE" | "PRO" | "STUDIO",
  PlanConfig
> = {
  BASE: {
    projects_limit: 1,
    clients_limit: 10,
    suppliers_limit: 50,
    catalog_products_limit: 50,
    storage_limit_mb: 500,
    summary: "basic",
    documents: "basic",
    notes: "basic",
    budget_mode: "basic",
    costs_management: "basic",
    purchase_orders: "none",
    payments_management: "none",
    multi_currency_per_project: "basic",
    support_level: "none",
  },
  PRO: {
    projects_limit: 5,
    clients_limit: -1,
    suppliers_limit: -1,
    catalog_products_limit: -1,
    storage_limit_mb: 10240,
    summary: "basic",
    documents: "basic",
    notes: "basic",
    budget_mode: "plus",
    costs_management: "plus",
    purchase_orders: "basic",
    payments_management: "basic",
    multi_currency_per_project: "plus",
    support_level: "basic",
  },
  STUDIO: {
    projects_limit: 50,
    clients_limit: -1,
    suppliers_limit: -1,
    catalog_products_limit: -1,
    storage_limit_mb: 102400,
    summary: "basic",
    documents: "basic",
    notes: "basic",
    budget_mode: "full",
    costs_management: "plus",
    purchase_orders: "plus",
    payments_management: "plus",
    multi_currency_per_project: "full",
    support_level: "full",
  },
};

export function getPlanConfigForDisplay(
  planCode: "BASE" | "PRO" | "STUDIO"
): PlanConfig {
  return STATIC_PLAN_CONFIGS[planCode];
}
