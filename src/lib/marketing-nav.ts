/**
 * Marketing header / footer navigation structure (route keys for next-intl Link).
 */

import type { FeaturePageId } from "@/lib/feature-registry";

export type MarketingHref =
  | "/"
  | "/pricing"
  | "/about"
  | "/contact"
  | "/demo"
  | "/blog"
  | "/legal"
  | "/sign-in"
  | "/sign-up"
  | "/plan-base"
  | "/plan-pro"
  | "/plan-studio"
  | "/software-interior-design"
  | "/software-architecture"
  | `/feature/${FeaturePageId}`
  | { pathname: "/blog/[slug]"; params: { slug: string } };

export type MarketingNavLeaf = {
  id: string;
  labelKey: string;
  href: MarketingHref;
  comingSoon?: boolean;
};

export type MarketingNavBranch = {
  id: string;
  labelKey: string;
  href?: MarketingHref;
  children: MarketingNavLeaf[];
};

export type MarketingNavItem =
  | { type: "link"; id: string; labelKey: string; href: MarketingHref }
  | {
      type: "menu";
      id: string;
      labelKey: string;
      items: Array<MarketingNavLeaf | MarketingNavBranch>;
    };

/** Desktop / mobile primary nav (Producto, Para quién, Precios, Recursos). */
export const MARKETING_PRIMARY_NAV: MarketingNavItem[] = [
  {
    type: "menu",
    id: "product",
    labelKey: "navProduct",
    items: [
      {
        id: "presupuestos",
        labelKey: "navBudgets",
        href: "/feature/presupuestos",
        children: [
          {
            id: "plantilla-pdf",
            labelKey: "navBudgetPdfTemplate",
            href: "/feature/plantilla-pdf",
          },
        ],
      },
      {
        id: "control-costes",
        labelKey: "navCostControl",
        href: "/feature/control-costes",
      },
      {
        id: "pedidos",
        labelKey: "navPurchaseOrders",
        href: "/feature/pedidos",
      },
      {
        id: "client-view",
        labelKey: "navClientView",
        href: {
          pathname: "/blog/[slug]",
          params: { slug: "vista-publica-cliente-interiorismo" },
        },
      },
      {
        id: "all-features",
        labelKey: "navAllFeatures",
        href: "/feature/funcionalidades",
      },
    ],
  },
  {
    type: "menu",
    id: "audience",
    labelKey: "navAudience",
    items: [
      {
        id: "starting-out",
        labelKey: "navStartingOut",
        href: "/feature/empiezas-por-tu-cuenta",
      },
      {
        id: "freelance",
        labelKey: "navFreelanceIndependents",
        href: "/feature/app-freelance",
      },
      {
        id: "studios",
        labelKey: "navStudiosWithTeam",
        href: "/feature/estudios-con-equipo",
      },
    ],
  },
  {
    type: "link",
    id: "pricing",
    labelKey: "navPricing",
    href: "/pricing",
  },
  {
    type: "menu",
    id: "resources",
    labelKey: "navResources",
    items: [
      {
        id: "blog",
        labelKey: "navBlog",
        href: "/blog",
      },
      {
        id: "excel-hub",
        labelKey: "navExcelAlternatives",
        href: "/feature/alternativas-excel",
      },
    ],
  },
];

/** Locale-specific blog slug for client-view nav (EN differs). */
export function clientViewBlogHref(locale: string): MarketingHref {
  return {
    pathname: "/blog/[slug]",
    params: {
      slug:
        locale === "en"
          ? "client-public-view-interior-design"
          : "vista-publica-cliente-interiorismo",
    },
  };
}
