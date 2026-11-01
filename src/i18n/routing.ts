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
    "/software-interior-design": {
      es: "/software-gestion-proyectos-interiorismo",
      en: "/interior-design-project-management-software",
    },
    "/software-architecture": {
      es: "/software-gestion-proyectos-arquitectura",
      en: "/architecture-project-management-software",
    },
    // Feature / audience / comparison marketing pages
    "/feature/funcionalidades": {
      es: "/funcionalidades",
      en: "/features",
    },
    "/feature/presupuestos": {
      es: "/presupuestos-pdf-interiorismo",
      en: "/interior-design-budgets-pdf",
    },
    "/feature/plantilla-pdf": {
      es: "/plantilla-presupuesto-pdf-interiorismo",
      en: "/interior-design-budget-pdf-template",
    },
    "/feature/control-costes": {
      es: "/control-costes-rentabilidad-interiorismo",
      en: "/cost-control-profitability-interior-design",
    },
    "/feature/pedidos": {
      es: "/pedidos-proveedores-interiorismo",
      en: "/purchase-orders-suppliers-interior-design",
    },
    "/feature/empiezas-por-tu-cuenta": {
      es: "/empiezas-por-tu-cuenta-primer-proyecto-interiorismo",
      en: "/starting-out-first-interior-design-project",
    },
    "/feature/app-freelance": {
      es: "/app-freelance-varios-proyectos-interiorismo",
      en: "/app-freelancer-multiple-projects-interior-design",
    },
    "/feature/estudios-con-equipo": {
      es: "/estudios-con-equipo-gestion-proyectos-interiorismo",
      en: "/studios-with-team-interior-design-project-management",
    },
    "/feature/alternativas-excel": {
      es: "/alternativas-excel-presupuestos-interiorismo",
      en: "/excel-alternatives-interior-design-budgets",
    },
    "/feature/veta-vs-programa": {
      es: "/veta-vs-programa-gestion-interiorismo",
      en: "/veta-vs-programa-interior-design-management",
    },
    "/feature/veta-vs-monday-notion": {
      es: "/veta-vs-monday-notion-herramientas-genericas",
      en: "/veta-vs-monday-notion-generic-tools",
    },
    "/feature/veta-vs-houzz-pro": {
      es: "/veta-vs-houzz-pro-gestion-proyectos",
      en: "/veta-vs-houzz-pro-project-management",
    },
  },
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
