---
name: veta-marketing-i18n-content
description: >-
  Traduce e implementa vistas públicas/comerciales (marketing) siempre en ES y EN:
  mensajes next-intl, pathnames, metadata SEO, sitemap, rewrites/redirects y enlaces.
  Usar al añadir o modificar landings, copy comercial, o páginas bajo (marketing).
---

# Veta: traducción y configuración de vistas públicas (ES + EN)

## Cuándo usar

- Nueva página o sección **marketing** (`src/app/[locale]/(marketing)/...`).
- Cambiar **copy comercial** visible en web pública (hero, FAQs, CTAs, planes).
- Añadir o renombrar **slugs** por idioma (URLs ES sin prefijo, EN con `/en`).
- El usuario pide “traducir la landing”, “página en inglés y español”, “i18n del marketing”.

## Principios del proyecto (obligatorios)

1. **Siempre dos idiomas**: español (`es`, default) e inglés (`en`). No dejar strings solo en un idioma en JSON de marketing.
2. **Fuente de verdad de URLs**: `src/i18n/routing.ts` → `pathnames` + `localePrefix: "as-needed"` (ES sin `/es`, EN con `/en`).
3. **Mensajes**: `src/i18n/messages/es/marketing.json` y `src/i18n/messages/en/marketing.json` con **la misma estructura de claves** (namespaces y keys idénticas).
4. **Navegación**: `Link`, `redirect`, `useRouter` desde `@/i18n/routing` con **route keys** internas (ej. `"/pricing"`), no slugs hardcodeados por locale (`/precios`, `/en/pricing`) salvo metadata/sitemap.
5. **Proxy único**: en Next.js 16 solo `proxy.ts` (no duplicar `middleware.ts` en la raíz). Detalle en skill `veta-multilanguage-views`.
6. **SEO por página**: cada vista indexable con `generateMetadata` (canonical, `alternates.languages`, `openGraph.url` alineados con la URL pública real).
7. **Sitemap**: `src/app/sitemap.ts` debe listar **ambas** variantes (rutas ES y `/en/...` para EN).
8. **Fallback de rutas**: si el slug público no coincide con el nombre del directorio bajo `(marketing)/`, añadir `rewrites` (y si aplica `redirects` 301 para URLs legacy) en `next.config.ts`.

## Flujo de trabajo (checklist)

### 1) Contenido (ES + EN)

- Añade o actualiza un **namespace** por página o feature (ej. `Pricing`, `About`, `PlanPro`) en **ambos** archivos:
  - `src/i18n/messages/es/marketing.json`
  - `src/i18n/messages/en/marketing.json`
- Incluye claves para **metadata** cuando la página sea indexable, por convención del repo:
  - `metaTitle`, `metaDescription`
  - `ogTitle`, `ogDescription`
  - `twitterTitle`, `twitterDescription` (si la página las usa)
- Mantén tono **profesional**, orientado a estudios de diseño interior / arquitectura y producto Veta; evita mezclar idiomas en el mismo valor.
- En el **Server Component** de la página: `setRequestLocale(locale)` y `getTranslations({ locale, namespace: "..." })` o `getTranslations("...")`.
- En client components bajo marketing: `useTranslations("...")` del mismo namespace.

### 2) Ruta y carpeta

- Página nueva: `src/app/[locale]/(marketing)/<segmento-interno>/page.tsx` (el `<segmento-interno>` es el nombre de carpeta en App Router; puede diferir del slug público).
- Registra el slug público en `src/i18n/routing.ts` bajo `pathnames` con una **route key** estable (ej. `"/nueva-landing": { es: "/slug-es", en: "/en-slug" }` — la key suele alinearse con el segmento interno salvo decisión explícita).

### 3) Metadata y JSON-LD

- Implementa `generateMetadata` en la `page.tsx` (o layout si aplica) con:
  - `alternates.canonical`: path **localizado** (ES sin prefijo de locale; EN `/en/...` con slug EN).
  - `alternates.languages`: `es`, `en`, `x-default` (normalmente `x-default` = canonical ES en este proyecto).
  - `openGraph.url`: igual que el canonical de esa locale.
- Si la página usa componentes JSON-LD, pasa URLs absolutas coherentes con el canonical (patrón `baseUrl + path` como en otras landings).

### 4) Sitemap

- Añade en `src/app/sitemap.ts` las dos entradas:
  - ES: `/<slug-es>` (sin `/es`)
  - EN: `/en/<slug-en>`
- No incluir rutas `noindex` o solo desarrollo (p. ej. `test-error`).

### 5) `next.config.ts` (si hace falta)

- **Rewrite** de `/<slug-localizado>` o `/en/<slug-en>` hacia `/es/<segmento>` o `/en/<segmento>` cuando el filesystem no coincide con el slug público (mismo patrón que precios/planes/about-veta).
- **Redirect** 301 si existe URL antigua que deba converger al slug canónico.

### 6) Enlaces y CTAs

- Header/footer/landings: `Link` desde `@/i18n/routing` con route keys.
- Para tracking GTM, si se usa `TrackedCtaLink`, las URLs de destino deben seguir siendo **rutas internas o keys** que next-intl resuelva, no slugs mezclados por mano.

### 7) Verificación manual mínima

- `GET` de la URL ES y de la URL EN → 200, contenido en el idioma correcto.
- Cambio de idioma con `LanguageToggle` → URL canónica del otro idioma, sin `/es/...` redundante en ES.
- Revisar que `sitemap.xml` incluye ambas URLs.

## Relación con otras skills

- **`veta-multilanguage-views`**: detalle de SEO, proxy vs middleware, depuración de navegación y toggles.
- **`veta-app-routing`**: si la ruta no es claramente `(marketing)` o toca `PUBLIC_ROUTES` / layouts privados.

## Referencias rápidas

- `src/i18n/routing.ts` — pathnames y route keys
- `src/i18n/request.ts` — carga de `marketing.json` por locale
- `src/app/[locale]/(marketing)/layout.tsx` — shell marketing
- `src/app/sitemap.ts` — URLs indexables ES/EN
- `next.config.ts` — `rewrites` / `redirects`
- `docs/i18n-seo-plan.md` — checklist ampliado para cambiar un slug en un solo idioma
