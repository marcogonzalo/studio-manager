/** Locale-aware public paths (no origin), aligned with routing pathnames + rewrites. */

export function marketingHomePath(locale: string): string {
  return locale === "es" ? "/" : "/en";
}

export function marketingPricingPath(locale: string): string {
  return locale === "es" ? "/precios" : "/en/pricing";
}

export function marketingBlogPath(locale: string): string {
  return locale === "es" ? "/blog" : "/en/blog";
}

export function marketingPlanBasePath(locale: string): string {
  return locale === "es"
    ? "/plan-base-primer-proyecto-interiorismo"
    : "/en/base-plan-first-interior-design-project";
}

export function marketingPlanProPath(locale: string): string {
  return locale === "es"
    ? "/plan-pro-independientes-diseno-interior"
    : "/en/pro-plan-for-independent-interior-designers";
}

export function marketingPlanStudioPath(locale: string): string {
  return locale === "es"
    ? "/plan-studio-empresas-arquitectura-diseno-interior"
    : "/en/studio-plan-for-architecture-and-interior-design-firms";
}

export function marketingInteriorSoftwarePath(locale: string): string {
  return locale === "es"
    ? "/software-gestion-proyectos-interiorismo"
    : "/en/interior-design-project-management-software";
}

export function marketingArchitectureSoftwarePath(locale: string): string {
  return locale === "es"
    ? "/software-gestion-proyectos-arquitectura"
    : "/en/architecture-project-management-software";
}
