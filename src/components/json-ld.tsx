import Script from "next/script";
import type { ComponentProps } from "react";
import { getSiteUrl } from "@/lib/site-url";

/**
 * JSON-LD for SEO/GEO (Schema.org). Uses next/script so React never tries to
 * reconcile a raw <script> during client render.
 */
export function JsonLd<T extends object>({
  data,
  id,
  strategy = "afterInteractive",
}: {
  data: T;
  id: string;
  strategy?: ComponentProps<typeof Script>["strategy"];
}) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      strategy={strategy}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const BASE_URL = getSiteUrl();

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Veta",
  url: BASE_URL,
  logo: `${BASE_URL}/img/veta-light.webp`,
  description:
    "Plataforma integral para gestionar proyectos de diseño interior. Administra clientes, proveedores, catálogos y presupuestos.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "hey@veta.pro",
    contactType: "customer service",
    availableLanguage: "Spanish",
    areaServed: "ES",
  },
};

export const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Veta",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Plataforma para gestión de proyectos de diseño interior. Gestiona clientes, proveedores, catálogo de productos y presupuestos en un solo lugar.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  url: BASE_URL,
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Veta",
  url: BASE_URL,
  description:
    "Plataforma todo-en-uno para gestionar proyectos de diseño interior: clientes, proveedores, presupuestos y catálogos.",
  inLanguage: ["es", "en"],
  publisher: {
    "@type": "Organization",
    name: "Veta",
    url: BASE_URL,
  },
};

/**
 * SoftwareApplication con AggregateOffer para la página de precios.
 * Incluye: Base (gratis), Pro y Studio en suscripción mensual y anual.
 * Suscripción anual = precio de 11 meses (1 mes gratis).
 * @see https://aubreyyung.com/software-application-schema/
 */
export function softwareApplicationPricingJsonLd(pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Veta",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Plataforma para gestión de proyectos de diseño interior. Gestiona clientes, proveedores, catálogo de productos y presupuestos en un solo lugar.",
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
          description:
            "Plan limitado y con funcionalidades básicas. Gratis para siempre.",
        },
        {
          "@type": "UnitPriceSpecification",
          price: "25",
          priceCurrency: "EUR",
          name: "Pro (mensual)",
          description: "Plan profesional. Suscripción mensual.",
          billingDuration: "P1M",
          referenceQuantity: {
            "@type": "QuantitativeValue",
            value: 1,
            unitCode: "MON",
          },
        },
        {
          "@type": "UnitPriceSpecification",
          price: "275",
          priceCurrency: "EUR",
          name: "Pro (anual)",
          description: "Plan profesional. Suscripción anual (1 mes gratis).",
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
          name: "Studio (mensual)",
          description: "Plan ilimitado para estudios. Suscripción mensual.",
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
          name: "Studio (anual)",
          description:
            "Plan ilimitado para estudios. Suscripción anual (2 meses gratis).",
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
