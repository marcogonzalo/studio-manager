# Contenido para docs/i18n-seo-plan.md

## Plan completo: i18n + SEO (Next App Router + next-intl)

### Objetivo

Implementar internacionalización y SEO fuerte para marketing con:

- **Locales**: `es` (default) y `en`
- **Estrategia de prefijos**: **default sin prefijo**
  - ES: `/` y `/<slug-es>`
  - EN: `/en` y `/en/<slug-en>`
- **Slugs traducidos** por idioma (pathnames)
- **SEO fuerte desde lanzamiento**:
  - `canonical` correcto por locale
  - `hreflang` (`es`, `en`, `x-default`) correcto por página
  - `sitemap` con variantes ES/EN
  - evitar contenido variable en una misma URL por headers/cookies
- **Ruta dev-only** `test-error`: `noindex` y fuera de sitemap

---

## Contexto actual del repo (observado)

- Config de `next-intl` en:
  - `src/i18n/request.ts` carga `messages: (await import(\`./messages/${locale}.json\`)).default`
  - `src/i18n/routing.ts` usa `defineRouting` + `createNavigation`
- Marketing actual en:
  - `src/app/[locale]/(marketing)/...`
- `src/app/page.tsx` hoy redirige a `/${routing.defaultLocale}` (o sea `/es`), lo cual **hay que cambiar** para cumplir “ES default sin prefijo”.

### Páginas marketing existentes (actuales)

- Home: `src/app/[locale]/(marketing)/page.tsx`
- Pricing: `.../(marketing)/pricing/page.tsx`
- About: `.../(marketing)/about/page.tsx`
- Contact: `.../(marketing)/contact/page.tsx`
- Legal: `.../(marketing)/legal/page.tsx`
- Demo: `.../(marketing)/demo/page.tsx`
- Landings de planes:
  - `.../(marketing)/plan-base-primer-proyecto-interiorismo/page.tsx`
  - `.../(marketing)/plan-pro-independientes-diseno-interior/page.tsx`
  - `.../(marketing)/plan-studio-empresas-arquitectura-diseno-interior/page.tsx`
- Dev-only: `.../(marketing)/test-error/page.tsx` (client)

---

## 1) Routing i18n: `pathnames` (source of truth)

### Reglas

- **Route keys internas**: estables, independientes del idioma (se usan en `Link`, `redirect`, etc.).
- **Slugs públicos**: traducidos por locale.

### Tabla `pathnames` (marketing actual)

> Nota: `test-error` no se incluye aquí.

- `/` -> `/`
- `/pricing` -> `{ es: "/precios", en: "/pricing" }`
- `/about` -> `{ es: "/sobre-veta", en: "/about-veta" }`
- `/contact` -> `{ es: "/contacto", en: "/contact" }`
- `/demo` -> `{ es: "/demo", en: "/demo" }`
- `/legal` -> `{ es: "/legal", en: "/legal" }`

Plan landings (route key corta / slug público descriptivo):

- `/plan-base` ->
  - es: `/plan-base-primer-proyecto-interiorismo`
  - en: `/base-plan-first-interior-design-project`
- `/plan-pro` ->
  - es: `/plan-pro-independientes-diseno-interior`
  - en: `/pro-plan-for-independent-interior-designers`
- `/plan-studio` ->
  - es: `/plan-studio-empresas-arquitectura-diseno-interior`
  - en: `/studio-plan-for-architecture-and-interior-design-firms`

### Config `next-intl` esperada

En `src/i18n/routing.ts`:

- `defaultLocale: "es"`
- `locales: ["en","es"]`
- **Locale prefix “as-needed”**:
  - ES **sin** prefijo
  - EN **con** `/en`
- `pathnames` configurado con el mapping anterior

**Criterio de aceptación**

- Enlaces internos con `Link` generan:
  - ES: `/<slug-es>`
  - EN: `/en/<slug-en>`

---

## 1.1) Cambiar un slug en un solo idioma (pasos)

Cuando quieras cambiar **solo** el slug de una ruta para un idioma (por ejemplo, pasar `EN /en/about` a `EN /en/about-veta`), sigue este checklist para evitar:

- 404 por cambio de idioma
- duplicación de prefijo (`/en/en/...`)
- metadata inconsistente (canonical / hreflang / OG)

1. Actualiza la fuente de verdad
   - `src/i18n/routing.ts` en `pathnames`:
     - Mantén la route key interna (ej. `"/about"`)
     - Cambia únicamente el slug del idioma correspondiente (`es` o `en`)

2. Asegura que no haya hardcodes de slugs
   - En vez de `next/link` o `href="/about-veta"`, usa `Link` y helpers desde `@/i18n/routing` para que next-intl resuelva el slug por locale.

3. Ajusta SEO en la página afectada
   - En `src/app/[locale]/(marketing)/<ruta>/page.tsx`, revisa `generateMetadata`:
     - `alternates.canonical`
     - `alternates.languages`
     - `openGraph.url`

4. Ajusta sitemap
   - En `src/app/sitemap.ts`, actualiza las entradas para:
     - ES (`/<slug-es>`)
     - EN (`/en/<slug-en>`)

5. Añade fallback/legacy si aplica
   - En `next.config.ts` revisa:
     - `rewrites`: para mapear slugs del idioma hacia el path interno (cuando el nombre del folder difiere)
     - `redirects`: si quieres conservar el comportamiento para la URL antigua (idealmente 301)

6. Verificación manual mínima
   - `GET /` y `GET /en`
   - `GET /<slug-es>` y `GET /en/<slug-en>`
   - cambiar de idioma con el `LanguageToggle`:
     - no debe duplicar prefijo
     - no debe renderizar `not-found`

## 2) Home `/` en ES (sin redirección)

### Problema actual

`src/app/page.tsx` redirige siempre a `/${routing.defaultLocale}` (actualmente `/es`).

### Objetivo

- `/` debe servir **Home ES** (200), sin redirect.

### Implementación (a decidir por agente)

Opciones típicas:

- Renderizar Home ES en `src/app/page.tsx` reutilizando el árbol de marketing home.
- O reestructurar rutas para que ES default se sirva en root de forma natural con `next-intl` “as-needed”.

**Criterio de aceptación**

- `/` -> Home ES (200), canonical `/`
- `/en` -> Home EN (200), canonical `/en`

---

## 3) Links internos: evitar hardcodes

### Regla

Para rutas internas localizadas:

- usar `Link` desde `@/i18n/routing` (no `next/link`)
- usar `href` con route key (ej. `"/pricing"`) y dejar que `next-intl` resuelva el slug por idioma.

### Tareas

- Buscar `next/link` en marketing (ej. About usa `next/link`).
- Sustituir por `Link` de `@/i18n/routing` donde aplique.
- Buscar `href="/pricing"` etc. y asegurarse de que apuntan a route keys y no a slugs hardcoded.

---

## 4) SEO Metadata: canonical + hreflang + OG url

### Regla general

En cada página marketing con `generateMetadata`:

- `alternates.canonical`: URL localizada real
- `alternates.languages`:
  - `es`: URL ES
  - `en`: URL EN
  - `x-default`: URL ES
- `openGraph.url`: URL localizada real
- (Ya existe `metadataBase` en `src/app/layout.tsx`, usar URLs relativas y dejar que Next componga absolutas.)

### Canonicals esperados por página (marketing actual)

Home:

- ES canonical: `/`
- EN canonical: `/en`
  Alternates:
- es: `/`
- en: `/en`
- x-default: `/`

Pricing:

- ES: `/precios`
- EN: `/en/pricing`
  Alternates:
- es: `/precios`
- en: `/en/pricing`
- x-default: `/precios`

About:

- ES: `/sobre-veta`
- EN: `/en/about-veta`
  Alternates:
- es: `/sobre-veta`
- en: `/en/about-veta`
- x-default: `/sobre-veta`

Contact:

- ES: `/contacto`
- EN: `/en/contact`
  Alternates:
- es: `/contacto`
- en: `/en/contact`
- x-default: `/contacto`

Demo:

- ES: `/demo`
- EN: `/en/demo`
  Alternates:
- es: `/demo`
- en: `/en/demo`
- x-default: `/demo`

Legal:

- ES: `/legal`
- EN: `/en/legal`
  Alternates:
- es: `/legal`
- en: `/en/legal`
- x-default: `/legal`

Plan Base:

- ES: `/plan-base-primer-proyecto-interiorismo`
- EN: `/en/base-plan-first-interior-design-project`
  Alternates:
- es: `/plan-base-primer-proyecto-interiorismo`
- en: `/en/base-plan-first-interior-design-project`
- x-default: `/plan-base-primer-proyecto-interiorismo`

Plan Pro:

- ES: `/plan-pro-independientes-diseno-interior`
- EN: `/en/pro-plan-for-independent-interior-designers`
  Alternates:
- es: `/plan-pro-independientes-diseno-interior`
- en: `/en/pro-plan-for-independent-interior-designers`
- x-default: `/plan-pro-independientes-diseno-interior`

Plan Studio:

- ES: `/plan-studio-empresas-arquitectura-diseno-interior`
- EN: `/en/studio-plan-for-architecture-and-interior-design-firms`
  Alternates:
- es: `/plan-studio-empresas-arquitectura-diseno-interior`
- en: `/en/studio-plan-for-architecture-and-interior-design-firms`
- x-default: `/plan-studio-empresas-arquitectura-diseno-interior`

### Observación importante

Actualmente varias páginas tienen `canonical` hardcodeado a rutas no-localizadas (ej. `"/pricing"`, `"/about"`). Eso debe ajustarse sí o sí.

---

## 5) Redirects de compatibilidad (recomendado)

### Objetivo

Evitar que URLs antiguas o no-localizadas se indexen como duplicados y preservar señales.

Propuestas:

- `/es` -> 301 -> `/` (si llega a existir por rutas/links legacy)
- Opcional:
  - `/pricing` -> 301 -> `/precios`
  - `/about` -> 301 -> `/sobre-veta`
  - `/contact` -> 301 -> `/contacto`

> Ajustar a histórico real de URLs ya publicadas.

Implementación sugerida: `next.config.ts` `redirects()`.

---

## 6) Sitemap (SEO fuerte)

### Objetivo

Incluir todas las páginas indexables en ES y EN.

Debe contener:

- ES: `/`, `/precios`, `/sobre-veta`, `/contacto`, `/demo`, `/legal`,
  `/plan-base-primer-proyecto-interiorismo`,
  `/plan-pro-independientes-diseno-interior`,
  `/plan-studio-empresas-arquitectura-diseno-interior`
- EN: `/en`, `/en/pricing`, `/en/about-veta`, `/en/contact`, `/en/demo`, `/en/legal`,
  `/en/base-plan-first-interior-design-project`,
  `/en/pro-plan-for-independent-interior-designers`,
  `/en/studio-plan-for-architecture-and-interior-design-firms`

Excluir:

- `/test-error` y cualquier otra ruta dev-only

Ideal:

- Generar sitemap desde la misma fuente `pathnames` para no olvidar landings.

---

## 7) `test-error`: `noindex`

### Requisito

Implementar `noindex` para `test-error`.

### Nota técnica

`src/app/[locale]/(marketing)/test-error/page.tsx` es client-only (`"use client"`), por lo que:

- `metadata` no debe ir ahí.
- Crear `layout.tsx` en el directorio de esa ruta (server) y exportar:

- `robots: { index: false, follow: false }`

También:

- excluirlo del sitemap.

---

## 8) Validación final (manual)

### Rutas

- ES:
  - `/` (home ES)
  - `/precios`
  - `/sobre-veta`
  - `/contacto`
  - `/demo`
  - `/legal`
  - `/plan-base-primer-proyecto-interiorismo`
  - `/plan-pro-independientes-diseno-interior`
  - `/plan-studio-empresas-arquitectura-diseno-interior`
- EN:
  - `/en` (home EN)
  - `/en/pricing`
  - `/en/about-veta`
  - `/en/contact`
  - `/en/demo`
  - `/en/legal`
  - `/en/base-plan-first-interior-design-project`
  - `/en/pro-plan-for-independent-interior-designers`
  - `/en/studio-plan-for-architecture-and-interior-design-firms`

### Head (por página)

- `<link rel="canonical" ...>` coincide con la tabla de arriba
- `<link rel="alternate" hreflang="es" ...>` y `hreflang="en"` apuntan a variantes correctas
- existe `x-default` apuntando a ES
- `openGraph.url` consistente con canonical

### `test-error`

- Responde con `noindex` (robots meta) y no aparece en sitemap.

---

## 9) Archivos principales que el agente probablemente tocará

- `src/i18n/routing.ts` (prefix strategy + `pathnames`)
- `src/app/page.tsx` (quitar redirect; servir ES home)
- Marketing `generateMetadata`:
  - `src/app/[locale]/(marketing)/page.tsx`
  - `src/app/[locale]/(marketing)/pricing/page.tsx`
  - `src/app/[locale]/(marketing)/about/page.tsx`
  - `src/app/[locale]/(marketing)/contact/page.tsx`
  - `src/app/[locale]/(marketing)/demo/page.tsx`
  - `src/app/[locale]/(marketing)/legal/page.tsx`
  - `src/app/[locale]/(marketing)/plan-*/page.tsx`
- `src/app/[locale]/(marketing)/test-error/layout.tsx` (nuevo)
- `next.config.ts` (redirects opcionales)
- `src/app/sitemap.ts` o `src/app/sitemap.xml` si existe (o crearlo) para SEO fuerte
