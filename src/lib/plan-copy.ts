/**
 * Mapeo plan → copy comercial.
 * Fuente única para /pricing y /settings/plan (change). Ver docs/plan-copy-mapping.md.
 * Devuelve claves de traducción (PlanCopyItem) para que el caller las reemplace con t().
 */

import type { PlanConfig, PlanFeatureModality } from "@/types";

/** Ítem que debe traducirse con el namespace PlanCopy: clave sola o clave + params para interpolación */
export type PlanCopyItem =
  | string
  | { key: string; params?: Record<string, string | number> };

/**
 * Traduce un PlanCopyItem usando la función t del namespace PlanCopy.
 * @example translatePlanCopyItem("projectsOne", t) => t("projectsOne")
 * @example translatePlanCopyItem({ key: "projectsCount", params: { count: 5 } }, t) => t("projectsCount", { count: 5 })
 */
export function translatePlanCopyItem(
  item: PlanCopyItem,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  if (typeof item === "string") return t(item);
  return t(item.key, item.params);
}

/**
 * Crea una función t para traducir PlanCopyItem a partir de un objeto de mensajes (p. ej. namespace PlanCopy).
 * Útil en entornos sin next-intl (p. ej. veta-app) usando mensajes por defecto.
 */
export function createPlanCopyT(
  messages: Record<string, string>
): (key: string, params?: Record<string, string | number>) => string {
  return (key: string, params?: Record<string, string | number>) => {
    let msg = messages[key];
    if (msg == null) return key;
    if (params) {
      for (const [k, v] of Object.entries(params))
        msg = msg.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
    return msg;
  };
}

// --- Consumibles: claves de traducción (namespace PlanCopy) ---

function formatProjectsLimit(n: number): PlanCopyItem | null {
  if (n === 0) return null;
  if (n === 1) return "projectsOne";
  if (n === -1) return "projectsUnlimited";
  return { key: "projectsCount", params: { count: n } };
}

function formatClientsLimit(n: number): PlanCopyItem | null {
  if (n === 0) return null;
  if (n === -1) return "clientsUnlimited";
  return { key: "clientsCount", params: { count: n } };
}

function formatSuppliersLimit(n: number): PlanCopyItem | null {
  if (n === 0) return null;
  if (n === -1) return "suppliersUnlimited";
  return { key: "suppliersCount", params: { count: n } };
}

function formatCatalogProductsLimit(n: number): PlanCopyItem | null {
  if (n === 0) return null;
  if (n === -1) return "catalogUnlimited";
  return { key: "catalogCount", params: { count: n } };
}

function formatStorageLimitMb(n: number): PlanCopyItem | null {
  if (n === 0) return null;
  if (n === -1) return "storageUnlimited";
  if (n === 500) return "storage500";
  if (n === 10240) return "storage10Gb";
  if (n === 102400) return "storage100Gb";
  if (n >= 1024)
    return { key: "storageGb", params: { gb: (n / 1024).toFixed(0) } };
  return { key: "storageMb", params: { mb: n } };
}

// --- Modalidades: claves de traducción (namespace PlanCopy) ---

type ModalityCopyKey = Partial<
  Record<Exclude<PlanFeatureModality, "none">, string>
>;

const MODALITY_COPY_KEYS: Record<
  keyof Pick<
    PlanConfig,
    | "pdf_export_mode"
    | "multi_currency_per_project"
    | "purchase_orders"
    | "costs_management"
    | "payments_management"
    | "documents"
    | "notes"
    | "summary"
    | "support_level"
  >,
  ModalityCopyKey
> = {
  pdf_export_mode: {
    basic: "pdfExportBasic",
    plus: "pdfExportPlus",
    full: "pdfExportFull",
  },
  multi_currency_per_project: {
    basic: "multiCurrencyBasic",
    plus: "multiCurrencyPlus",
    full: "multiCurrencyFull",
  },
  purchase_orders: {
    basic: "purchaseOrdersBasic",
    plus: "purchaseOrdersPlus",
    full: "purchaseOrdersFull",
  },
  costs_management: {
    basic: "costsBasic",
    plus: "costsPlus",
    full: "costsFull",
  },
  payments_management: {
    basic: "paymentsBasic",
    plus: "paymentsPlus",
    full: "paymentsFull",
  },
  documents: {
    basic: "documentsBasic",
    plus: "documentsPlus",
    full: "documentsFull",
  },
  notes: {
    basic: "notesBasic",
    plus: "notesPlus",
    full: "notesFull",
  },
  summary: {
    basic: "summaryBasic",
    plus: "summaryPlus",
    full: "summaryFull",
  },
  support_level: {
    basic: "supportBasic",
    plus: "supportPlus",
    full: "supportFull",
  },
};

const MODALITY_ORDER: (keyof typeof MODALITY_COPY_KEYS)[] = [
  "pdf_export_mode",
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
  | keyof typeof MODALITY_COPY_KEYS;

/** Subconjunto típico para vista compacta: proyectos, almacenamiento, presupuesto, soporte */
export const COMPACT_FEATURE_KEYS: PlanFeatureKey[] = [
  "projects_limit",
  // "clients_limit",
  // "suppliers_limit",
  // "catalog_products_limit",
  "storage_limit_mb",
  "pdf_export_mode",
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

function copyKeyForModality(
  key: keyof typeof MODALITY_COPY_KEYS,
  modality: PlanFeatureModality | undefined
): string | null {
  if (!modality || modality === "none") return null;
  const copyKey = MODALITY_COPY_KEYS[key][modality];
  return copyKey ?? null;
}

export interface GetCommercialFeaturesOptions {
  /**
   * Si se define, solo se incluyen las claves indicadas (en el orden estándar).
   * Útil para vistas compactas. Ver COMPACT_FEATURE_KEYS y ALL_FEATURE_KEYS.
   */
  include?: PlanFeatureKey[];
}

/**
 * Genera el array de ítems de traducción (PlanCopyItem) para un plan a partir de su config.
 * Orden: consumibles (proyectos, clientes, proveedores, productos, almacenamiento), luego modalidades.
 * Traducir cada ítem con translatePlanCopyItem(item, t) usando getTranslations("PlanCopy") o useTranslations("PlanCopy").
 *
 * Con `options.include` puedes restringir qué features se muestran para hacer la vista más compacta.
 */
export function getCommercialFeatures(
  config: PlanConfig,
  options?: GetCommercialFeaturesOptions
): PlanCopyItem[] {
  const includeSet =
    options?.include == null ? null : new Set<PlanFeatureKey>(options.include);

  const out: PlanCopyItem[] = [];

  const consumibleResults: {
    key: (typeof CONSUMABLE_KEYS)[number];
    copy: PlanCopyItem | null;
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
    const copyKey = copyKeyForModality(key, config[key]);
    if (copyKey) out.push(copyKey);
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
    pdf_export_mode: "basic",
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
    pdf_export_mode: "plus",
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
    pdf_export_mode: "full",
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
