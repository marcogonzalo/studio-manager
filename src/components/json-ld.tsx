import { getSiteUrl } from "@/lib/site-url";

export type MarketingLocale = "es" | "en";

/** Escape `<` so JSON-LD cannot break out of the surrounding script tag. */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * JSON-LD for SEO/GEO (Schema.org). Native `<script type="application/ld+json">`
 * so the tag is present in the server HTML for non-JS crawlers.
 * Must only be rendered from Server Components.
 */
export function JsonLd<T extends object>({
  data,
  id,
}: {
  data: T;
  id?: string;
}) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

const BASE_URL = getSiteUrl();

function localeCopy(locale: MarketingLocale) {
  const isEn = locale === "en";
  return {
    orgDescription: isEn
      ? "All-in-one platform to manage interior design projects. Clients, suppliers, catalogs, and budgets in one place."
      : "Plataforma integral para gestionar proyectos de diseño interior. Administra clientes, proveedores, catálogos y presupuestos.",
    appDescription: isEn
      ? "Platform for interior design project management. Manage clients, suppliers, product catalog, and budgets in one place."
      : "Plataforma para gestión de proyectos de diseño interior. Gestiona clientes, proveedores, catálogo de productos y presupuestos en un solo lugar.",
    siteDescription: isEn
      ? "All-in-one platform to manage interior design projects: clients, suppliers, budgets, and catalogs."
      : "Plataforma todo-en-uno para gestionar proyectos de diseño interior: clientes, proveedores, presupuestos y catálogos.",
  };
}

export function organizationJsonLd(locale: MarketingLocale = "es") {
  const copy = localeCopy(locale);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Veta",
    url: BASE_URL,
    logo: `${BASE_URL}/img/veta-light.webp`,
    description: copy.orgDescription,
    contactPoint: {
      "@type": "ContactPoint",
      email: "hey@veta.pro",
      contactType: "customer service",
      availableLanguage: ["es", "en"],
      areaServed: "Worldwide",
    },
  };
}

export function softwareApplicationJsonLd(locale: MarketingLocale = "es") {
  const copy = localeCopy(locale);
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Veta",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: copy.appDescription,
    inLanguage: ["es", "en"],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    url: BASE_URL,
  };
}

export function websiteJsonLd(locale: MarketingLocale = "es") {
  const copy = localeCopy(locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Veta",
    url: BASE_URL,
    description: copy.siteDescription,
    inLanguage: ["es", "en"],
    publisher: {
      "@type": "Organization",
      name: "Veta",
      url: BASE_URL,
    },
  };
}

/**
 * SoftwareApplication with AggregateOffer for the pricing page.
 * Base (free), Pro and Studio monthly + annual.
 * Annual Pro = 10 months (2 months free); annual Studio = 10 months (2 months free).
 */
export function softwareApplicationPricingJsonLd(
  pageUrl: string,
  locale: MarketingLocale = "es"
) {
  const isEn = locale === "en";
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Veta",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: localeCopy(locale).appDescription,
    url: pageUrl,
    isAccessibleForFree: true,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: "0",
      highPrice: "750",
      offerCount: 5,
      priceSpecification: [
        {
          "@type": "UnitPriceSpecification",
          price: "0",
          priceCurrency: "EUR",
          name: "Base",
          description: isEn
            ? "Limited plan with basic features. Free forever."
            : "Plan limitado y con funcionalidades básicas. Gratis para siempre.",
        },
        {
          "@type": "UnitPriceSpecification",
          price: "25",
          priceCurrency: "EUR",
          name: isEn ? "Pro (monthly)" : "Pro (mensual)",
          description: isEn
            ? "Professional plan. Monthly subscription."
            : "Plan profesional. Suscripción mensual.",
          billingDuration: "P1M",
          referenceQuantity: {
            "@type": "QuantitativeValue",
            value: 1,
            unitCode: "MON",
          },
        },
        {
          "@type": "UnitPriceSpecification",
          price: "250",
          priceCurrency: "EUR",
          name: isEn ? "Pro (annual)" : "Pro (anual)",
          description: isEn
            ? "Professional plan. Annual subscription (2 months free)."
            : "Plan profesional. Suscripción anual (2 meses gratis).",
          billingDuration: "P1Y",
          referenceQuantity: {
            "@type": "QuantitativeValue",
            value: 1,
            unitCode: "ANN",
          },
        },
        {
          "@type": "UnitPriceSpecification",
          price: "75",
          priceCurrency: "EUR",
          name: isEn ? "Studio (monthly)" : "Studio (mensual)",
          description: isEn
            ? "Unlimited plan for studios. Monthly subscription."
            : "Plan ilimitado para estudios. Suscripción mensual.",
          billingDuration: "P1M",
          referenceQuantity: {
            "@type": "QuantitativeValue",
            value: 1,
            unitCode: "MON",
          },
        },
        {
          "@type": "UnitPriceSpecification",
          price: "750",
          priceCurrency: "EUR",
          name: isEn ? "Studio (annual)" : "Studio (anual)",
          description: isEn
            ? "Unlimited plan for studios. Annual subscription (2 months free)."
            : "Plan ilimitado para estudios. Suscripción anual (2 meses gratis).",
          billingDuration: "P1Y",
          referenceQuantity: {
            "@type": "QuantitativeValue",
            value: 1,
            unitCode: "ANN",
          },
        },
      ],
    },
  };
}

export type PlanOfferCode = "BASE" | "PRO" | "STUDIO";

const PLAN_OFFERS: Record<
  PlanOfferCode,
  {
    price: string;
    isAccessibleForFree: boolean;
    nameEs: string;
    nameEn: string;
    descriptionEs: string;
    descriptionEn: string;
  }
> = {
  BASE: {
    price: "0",
    isAccessibleForFree: true,
    nameEs: "Plan Base",
    nameEn: "Base Plan",
    descriptionEs:
      "Plan gratuito de Veta para 1 proyecto de diseño interior. Funcionalidades básicas, gratis para siempre.",
    descriptionEn:
      "Veta free plan for 1 interior design project. Basic features, free forever.",
  },
  PRO: {
    price: "25",
    isAccessibleForFree: false,
    nameEs: "Plan Pro",
    nameEn: "Pro Plan",
    descriptionEs:
      "Plan Pro de Veta para independientes: varios proyectos, presupuestos y control de costes. Desde 25 EUR/mes.",
    descriptionEn:
      "Veta Pro plan for independents: multiple projects, budgets, and cost control. From 25 EUR/month.",
  },
  STUDIO: {
    price: "75",
    isAccessibleForFree: false,
    nameEs: "Plan Studio",
    nameEn: "Studio Plan",
    descriptionEs:
      "Plan Studio de Veta para estudios de arquitectura e interiorismo. Desde 75 EUR/mes.",
    descriptionEn:
      "Veta Studio plan for architecture and interior design firms. From 75 EUR/month.",
  },
};

export function planOfferJsonLd(options: {
  plan: PlanOfferCode;
  pageUrl: string;
  locale: MarketingLocale;
}) {
  const meta = PLAN_OFFERS[options.plan];
  const isEn = options.locale === "en";
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: isEn ? meta.nameEn : meta.nameEs,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: isEn ? meta.descriptionEn : meta.descriptionEs,
    url: options.pageUrl,
    isAccessibleForFree: meta.isAccessibleForFree,
    offers: {
      "@type": "Offer",
      price: meta.price,
      priceCurrency: "EUR",
      url: options.pageUrl,
      availability: "https://schema.org/InStock",
    },
  };
}

export function aboutPageJsonLd(options: {
  pageUrl: string;
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: options.name,
    description: options.description,
    url: options.pageUrl,
    mainEntity: {
      "@type": "Organization",
      name: "Veta",
      url: BASE_URL,
      logo: `${BASE_URL}/img/veta-light.webp`,
    },
  };
}

export function faqPageJsonLd(
  faqs: Array<{ question: string; answer: string }>,
  pageUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
    url: pageUrl,
  };
}

export type BreadcrumbListItem = {
  name: string;
  /** Public path without origin, e.g. `/precios` or `/en/pricing`. */
  path: string;
};

export function breadcrumbListJsonLd(items: BreadcrumbListItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.path}`,
    })),
  };
}

export type BlogPostingAuthor = {
  name: string;
  url?: string;
};

export function blogPostingJsonLd(options: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  author: BlogPostingAuthor;
}) {
  const pageUrl = `${BASE_URL}${options.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: options.title,
    description: options.description,
    url: pageUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    datePublished: options.datePublished,
    dateModified: options.dateModified ?? options.datePublished,
    image: options.image ? [options.image] : undefined,
    author: {
      "@type": "Person",
      name: options.author.name,
      ...(options.author.url ? { url: options.author.url } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: "Veta",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/img/veta-light.webp`,
      },
    },
  };
}
