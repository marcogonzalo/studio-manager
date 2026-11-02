import { getSiteUrl } from "@/lib/site-url";

export function GET() {
  const base = getSiteUrl();
  const body = `# Veta

> Veta is project management software for interior designers, architects, and design studios. It centralizes room-by-room budgets, purchase orders, site tracking, and clients. It includes a free plan for 1 project and paid plans from €25/month. Veta does not issue official tax invoices; it works alongside third-party invoicing or accounting tools.

Veta es un software de gestión de proyectos para interioristas, arquitectos y estudios de diseño. Centraliza presupuestos por espacios, pedidos a proveedores, seguimiento de obra y clientes. Incluye un plan gratuito para 1 proyecto y planes de pago desde 25 €/mes. No emite facturas oficiales; facilita exportar datos a herramientas de facturación de terceros.

## Plans and pricing (EUR)

- Base: free forever (1 project, basic features)
- Pro: €25/month or €250/year (2 months free)
- Studio: €75/month or €750/year (2 months free)
- 30-day free trial on paid plans; no credit card required to start

## Key URLs (Spanish)

- Home: ${base}/
- Pricing: ${base}/precios
- About: ${base}/sobre-veta
- Blog: ${base}/blog
- Interior design software: ${base}/software-gestion-proyectos-interiorismo
- Architecture software: ${base}/software-gestion-proyectos-arquitectura
- Base plan: ${base}/plan-base-primer-proyecto-interiorismo
- Pro plan: ${base}/plan-pro-independientes-diseno-interior
- Studio plan: ${base}/plan-studio-empresas-arquitectura-diseno-interior
- Demo: ${base}/demo
- Contact: ${base}/contacto
- Sign up: ${base}/sign-up

## Key URLs (English)

- Home: ${base}/en
- Pricing: ${base}/en/pricing
- About: ${base}/en/about-veta
- Blog: ${base}/en/blog
- Interior design software: ${base}/en/interior-design-project-management-software
- Architecture software: ${base}/en/architecture-project-management-software
- Base plan: ${base}/en/base-plan-first-interior-design-project
- Pro plan: ${base}/en/pro-plan-for-independent-interior-designers
- Studio plan: ${base}/en/studio-plan-for-architecture-and-interior-design-firms
- Demo: ${base}/en/demo
- Contact: ${base}/en/contact
- Sign up: ${base}/en/sign-up

## Optional

- Sitemap: ${base}/sitemap.xml
- Robots: ${base}/robots.txt
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
