/**
 * Product marketing feature / audience / comparison page registry.
 * Pathnames align with src/i18n/routing.ts and next.config rewrites.
 */

export type FeatureLocale = "en" | "es";

export type FeaturePageId =
  | "funcionalidades"
  | "presupuestos"
  | "plantilla-pdf"
  | "control-costes"
  | "pedidos"
  | "empiezas-por-tu-cuenta"
  | "app-freelance"
  | "estudios-con-equipo"
  | "alternativas-excel"
  | "veta-vs-programa"
  | "veta-vs-monday-notion"
  | "veta-vs-houzz-pro";

export type FeaturePageKind =
  | "hub"
  | "feature"
  | "audience"
  | "comparison-hub"
  | "comparison";

export type PlanCta = "base" | "pro" | "studio";

export type FeatureNavGroup = "funcionalidades" | "audience" | "comparativas";

export type FeaturePageDef = {
  id: FeaturePageId;
  kind: FeaturePageKind;
  group: FeatureNavGroup;
  /** Internal next-intl route key (also filesystem pageId). */
  routeKey: `/feature/${FeaturePageId}`;
  pathnames: { es: string; en: string };
  parentId?: FeaturePageId;
  childIds?: FeaturePageId[];
  planCtas: PlanCta[];
  /** Load long-form MD from src/content/features/{locale}/{id}.md */
  hasMarkdown: boolean;
  /** Placeholder page until full comparison/feature copy ships. */
  comingSoon?: boolean;
};

export const FEATURE_PAGES: Record<FeaturePageId, FeaturePageDef> = {
  funcionalidades: {
    id: "funcionalidades",
    kind: "hub",
    group: "funcionalidades",
    routeKey: "/feature/funcionalidades",
    pathnames: { es: "/funcionalidades", en: "/features" },
    childIds: ["presupuestos", "control-costes", "pedidos"],
    planCtas: [],
    hasMarkdown: false,
  },
  presupuestos: {
    id: "presupuestos",
    kind: "feature",
    group: "funcionalidades",
    routeKey: "/feature/presupuestos",
    pathnames: {
      es: "/presupuestos-pdf-interiorismo",
      en: "/interior-design-budgets-pdf",
    },
    parentId: "funcionalidades",
    childIds: ["plantilla-pdf"],
    planCtas: ["base", "pro", "studio"],
    hasMarkdown: true,
  },
  "plantilla-pdf": {
    id: "plantilla-pdf",
    kind: "feature",
    group: "funcionalidades",
    routeKey: "/feature/plantilla-pdf",
    pathnames: {
      es: "/plantilla-presupuesto-pdf-interiorismo",
      en: "/interior-design-budget-pdf-template",
    },
    parentId: "presupuestos",
    planCtas: ["studio"],
    hasMarkdown: true,
  },
  "control-costes": {
    id: "control-costes",
    kind: "feature",
    group: "funcionalidades",
    routeKey: "/feature/control-costes",
    pathnames: {
      es: "/control-costes-rentabilidad-interiorismo",
      en: "/cost-control-profitability-interior-design",
    },
    parentId: "funcionalidades",
    planCtas: ["pro"],
    hasMarkdown: true,
  },
  pedidos: {
    id: "pedidos",
    kind: "feature",
    group: "funcionalidades",
    routeKey: "/feature/pedidos",
    pathnames: {
      es: "/pedidos-proveedores-interiorismo",
      en: "/purchase-orders-suppliers-interior-design",
    },
    parentId: "funcionalidades",
    planCtas: ["pro"],
    hasMarkdown: true,
  },
  "empiezas-por-tu-cuenta": {
    id: "empiezas-por-tu-cuenta",
    kind: "audience",
    group: "audience",
    routeKey: "/feature/empiezas-por-tu-cuenta",
    pathnames: {
      es: "/empiezas-por-tu-cuenta-primer-proyecto-interiorismo",
      en: "/starting-out-first-interior-design-project",
    },
    planCtas: ["base"],
    hasMarkdown: true,
  },
  "app-freelance": {
    id: "app-freelance",
    kind: "audience",
    group: "audience",
    routeKey: "/feature/app-freelance",
    pathnames: {
      es: "/app-freelance-varios-proyectos-interiorismo",
      en: "/app-freelancer-multiple-projects-interior-design",
    },
    planCtas: ["pro"],
    hasMarkdown: true,
  },
  "estudios-con-equipo": {
    id: "estudios-con-equipo",
    kind: "audience",
    group: "audience",
    routeKey: "/feature/estudios-con-equipo",
    pathnames: {
      es: "/estudios-con-equipo-gestion-proyectos-interiorismo",
      en: "/studios-with-team-interior-design-project-management",
    },
    planCtas: ["studio"],
    hasMarkdown: true,
  },
  "alternativas-excel": {
    id: "alternativas-excel",
    kind: "comparison-hub",
    group: "comparativas",
    routeKey: "/feature/alternativas-excel",
    pathnames: {
      es: "/alternativas-excel-presupuestos-interiorismo",
      en: "/excel-alternatives-interior-design-budgets",
    },
    childIds: [
      "veta-vs-programa",
      "veta-vs-monday-notion",
      "veta-vs-houzz-pro",
    ],
    planCtas: ["base", "pro"],
    hasMarkdown: true,
  },
  "veta-vs-programa": {
    id: "veta-vs-programa",
    kind: "comparison",
    group: "comparativas",
    routeKey: "/feature/veta-vs-programa",
    pathnames: {
      es: "/veta-vs-programa-gestion-interiorismo",
      en: "/veta-vs-programa-interior-design-management",
    },
    parentId: "alternativas-excel",
    planCtas: ["base", "pro"],
    hasMarkdown: false,
    comingSoon: true,
  },
  "veta-vs-monday-notion": {
    id: "veta-vs-monday-notion",
    kind: "comparison",
    group: "comparativas",
    routeKey: "/feature/veta-vs-monday-notion",
    pathnames: {
      es: "/veta-vs-monday-notion-herramientas-genericas",
      en: "/veta-vs-monday-notion-generic-tools",
    },
    parentId: "alternativas-excel",
    planCtas: ["base", "pro"],
    hasMarkdown: false,
    comingSoon: true,
  },
  "veta-vs-houzz-pro": {
    id: "veta-vs-houzz-pro",
    kind: "comparison",
    group: "comparativas",
    routeKey: "/feature/veta-vs-houzz-pro",
    pathnames: {
      es: "/veta-vs-houzz-pro-gestion-proyectos",
      en: "/veta-vs-houzz-pro-project-management",
    },
    parentId: "alternativas-excel",
    planCtas: ["base", "pro"],
    hasMarkdown: false,
    comingSoon: true,
  },
};

export const FEATURE_PAGE_IDS = Object.keys(FEATURE_PAGES) as FeaturePageId[];

export function isFeaturePageId(value: string): value is FeaturePageId {
  return value in FEATURE_PAGES;
}

export function getFeaturePageDef(id: FeaturePageId): FeaturePageDef {
  return FEATURE_PAGES[id];
}

/** Public path with locale prefix strategy (as-needed). */
export function getFeaturePublicPath(
  locale: FeatureLocale,
  id: FeaturePageId
): string {
  const slug = FEATURE_PAGES[id].pathnames[locale];
  if (locale === "es") return slug;
  return `/en${slug}`;
}

export function getFeatureSitemapPaths(): {
  path: string;
  priority: number;
}[] {
  const paths: { path: string; priority: number }[] = [];
  for (const id of FEATURE_PAGE_IDS) {
    const def = FEATURE_PAGES[id];
    const priority = def.comingSoon
      ? 0.5
      : def.kind === "hub" || def.kind === "comparison-hub"
        ? 0.85
        : 0.75;
    paths.push({ path: def.pathnames.es, priority });
    paths.push({ path: `/en${def.pathnames.en}`, priority });
  }
  return paths;
}

/** Comparison pages under the Excel hub (stubs until full copy). */
export const COMPARISON_PAGE_IDS = [
  "veta-vs-programa",
  "veta-vs-monday-notion",
  "veta-vs-houzz-pro",
] as const satisfies readonly FeaturePageId[];
