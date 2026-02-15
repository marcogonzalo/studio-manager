/**
 * Renders JSON-LD structured data for SEO/GEO (Schema.org).
 */
export function JsonLd<T extends object>({ data }: { data: T }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://veta.pro";

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
    email: "hola@veta.pro",
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

/**
 * SoftwareApplication con AggregateOffer para la página de precios.
 * Incluye: Prueba (gratis), Pro y Studio en suscripción mensual y anual.
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
          name: "Prueba",
          description:
            "Plan de prueba con límites básicos. Gratis para siempre.",
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
