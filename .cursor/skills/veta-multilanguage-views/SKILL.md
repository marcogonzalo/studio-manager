---
name: veta-multilanguage-views
description: >-
  Implements Veta multi-language marketing views (next-intl + SEO) with correct
  translated slugs, canonical/hreflang/openGraph metadata, sitemap, robots
  exclusions for dev-only routes, and a language switch that navigates to
  canonical URLs (e.g. default-locale "as-needed" without redundant "/es/" prefix).
---

# Veta Multi-language Views (next-intl + SEO)

## When to use

- User asks to implement or debug i18n + SEO for marketing pages.
- User asks to change translated slugs (pricing/about/contact/plan landings).
- User reports navigation breaks when switching EN/ES (especially default-locale URLs).

## Quick start

1. Configure locale routing (source of truth)
   - Update `src/i18n/routing.ts` with:
     - `defaultLocale: "es"`
     - `localePrefix: "as-needed"` (ES served without prefix, EN with `/en`)
     - `pathnames` mapping for route keys to translated slugs:
       - `/pricing` -> `{ es: "/precios", en: "/pricing" }`
       - `/about` -> `{ es: "/sobre-veta", en: "/about-veta" }`
       - `/contact` -> `{ es: "/contacto", en: "/contact" }`
       - `/demo` -> `{ es: "/demo", en: "/demo" }`
       - `/legal` -> `{ es: "/legal", en: "/legal" }`
       - plan landings `/plan-base|/plan-pro|/plan-studio` -> translated slugs per locale

2. Ensure `/` uses the same marketing layout as the rest
   - Update `src/app/page.tsx` to render the home inside `src/app/[locale]/(marketing)/layout.tsx`
   - This avoids missing navbar/footer on root when using separate `[locale]/(marketing)` layouts.

3. Add SEO metadata per page
   - For each marketing page under `src/app/[locale]/(marketing)/...` implement `generateMetadata`:
     - `alternates.canonical`: localized canonical path (default locale without prefix)
     - `alternates.languages`: `{ es, en, "x-default" }` pointing to correct localized URLs
     - `openGraph.url`: consistent with canonical

4. Sitemap and robots
   - Update `src/app/sitemap.ts` to include only indexable routes for both locales:
     - ES: `/`, `/precios`, `/nosotros`, `/contacto`, `/demo`, `/legal`, `/plan-...`
     - EN: `/en`, `/en/pricing`, `/en/about`, `/en/contact`, `/en/demo`, `/en/legal`, `/en/plan-...`
   - Dev-only route: `src/app/[locale]/(marketing)/test-error/layout.tsx` should export:
     - `robots: { index: false, follow: false }`
   - Ensure `test-error` is excluded from `sitemap.ts`.

5. Fix language switch navigation (default locale "as-needed")
   - Update `src/components/language-toggle.tsx`.
   - The toggle must navigate to canonical URLs:
     - From `/en/pricing` -> `/precios` (NOT `/es/precios`)
   - If next-intl generates redundant URLs in edge cases, compute destination using `routing.pathnames`
     and apply the `as-needed` prefix strategy explicitly.

6. Defensive redirects/rewrites (only if needed)
   - In `next.config.ts`, add small `redirects()` or `rewrites()` for legacy or redundant slugs that
     otherwise yield 404 (e.g. `/es/precios` -> `/precios`, or EN plan slugs -> internal plan keys).

## Validation checklist (use curl/manual)

- `GET /` (ES home) -> 200
- `GET /precios`, `/nosotros`, `/contacto`, `/demo`, `/legal` -> 200
- `GET /en`, `/en/pricing`, `/en/about`, `/en/contact`, `/en/demo`, `/en/legal` -> 200
- Plan pages:
  - `GET /plan-base-primer-proyecto-interiorismo` -> 200
  - `GET /plan-pro-independientes-diseno-interior` -> 200
  - `GET /plan-studio-empresas-arquitectura-diseno-interior` -> 200
  - `GET /en/base-plan-first-interior-design-project` -> 200
  - `GET /en/pro-plan-for-independent-interior-designers` -> 200
  - `GET /en/studio-plan-for-architecture-and-interior-design-firms` -> 200
- Language toggle:
  - From `/en/pricing`, toggle -> lands on `/precios`
- Dev-only:
  - `GET /test-error` (or locale variant) -> not indexed (check robots meta) and excluded from sitemap

## References (files to inspect)

- `src/i18n/routing.ts`
- `src/components/language-toggle.tsx`
- `src/app/page.tsx`
- `src/app/sitemap.ts`
- `src/app/[locale]/(marketing)/*/page.tsx` (for `generateMetadata`)
- `src/app/[locale]/(marketing)/test-error/layout.tsx`
- `next.config.ts` (redirects/rewrites only if needed)
