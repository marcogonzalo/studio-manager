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

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://veta.app";

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
    email: "hola@veta.app",
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
