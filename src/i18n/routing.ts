import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "es",
  // Strategy: ES is the default locale and is served without prefix ("/").
  // EN is prefixed with "/en".
  localePrefix: "as-needed",
  // Avoid serving variable content for the same URL based on cookies/headers.
  // We want "/"" to always be ES, and "/en" to always be EN.
  // Avoid variable routing behavior based on headers/cookies.
  localeDetection: false,
  // Slugs (pathnames) localized per locale. Route keys are the internal, stable
  // paths used by Link/redirect helpers in the app router.
  pathnames: {
    "/": { es: "/", en: "/" },
    "/pricing": { es: "/precios", en: "/pricing" },
    "/about": { es: "/sobre-veta", en: "/about-veta" },
    "/contact": { es: "/contacto", en: "/contact" },
    "/demo": { es: "/demo", en: "/demo" },
    "/blog": { es: "/blog", en: "/blog" },
    "/blog/[slug]": { es: "/blog/[slug]", en: "/blog/[slug]" },
    "/legal": { es: "/legal", en: "/legal" },
    // Auth routes (no slug translation; keep stable path segments)
    "/sign-in": { es: "/sign-in", en: "/sign-in" },
    "/sign-up": { es: "/sign-up", en: "/sign-up" },
    "/auth/complete": { es: "/auth/complete", en: "/auth/complete" },
    "/plan-base": {
      es: "/plan-base-primer-proyecto-interiorismo",
      en: "/base-plan-first-interior-design-project",
    },
    "/plan-pro": {
      es: "/plan-pro-independientes-diseno-interior",
      en: "/pro-plan-for-independent-interior-designers",
    },
    "/plan-studio": {
      es: "/plan-studio-empresas-arquitectura-diseno-interior",
      en: "/studio-plan-for-architecture-and-interior-design-firms",
    },
  },
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
