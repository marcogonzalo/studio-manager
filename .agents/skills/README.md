# Skills propuestas para el proyecto Veta

Este documento describe las skills del proyecto (estándar Agent Skills, cargadas por Cursor) para el desarrollo de Veta (Next.js 16, React 19, Supabase, Tailwind v4, Vitest).

Las skills viven en **`.agents/skills/<nombre>/SKILL.md`**. Las **reglas** (`.cursor/rules/`) cubren estándares generales; las **skills** añaden procedimientos y contexto que el agente aplica cuando detecta tareas concretas (por descripción y triggers).

---

## 1. veta-supabase-rls (implementada)

**Objetivo:** Uso correcto del cliente Supabase (cliente vs servidor), RLS y tipos.

**Cuándo usar:** Al escribir o revisar código que usa Supabase, `createClient`, `getSupabaseClient`, RLS o políticas de seguridad.

**Contenido:** Cliente browser vs server, imports desde `@/lib/supabase`, tipos desde `@/types`, comprobación de `error` en respuestas, nunca exponer service role en cliente.

---

## 2. veta-forms-validation (implementada)

**Objetivo:** Formularios con react-hook-form + Zod y reglas de Shadcn (Select sin `value=""`).

**Cuándo usar:** Al crear o modificar formularios, campos Select, validación con Zod o `useForm`.

**Contenido:** Esquema Zod + `zodResolver`, `defaultValues` con `undefined` en opcionales, SelectItem sin valor vacío, manejo de errores en UI.

---

## 3. veta-testing (implementada)

**Objetivo:** Tests con Vitest y React Testing Library, TDD y mocks del proyecto.

**Cuándo usar:** Al escribir tests, revisar cobertura o configurar mocks (Supabase, etc.).

**Contenido:** Vitest + RTL, cobertura >80%, mocks en `src/test/mocks/supabase.ts`, qué mockear (Supabase, no librerías), casos borde.

---

## 4. veta-multilanguage-views (implementada)

**Objetivo:** i18n + SEO fuerte para marketing con `next-intl` (App Router) y slugs traducidos por idioma. Incluye canónicos/hreflang/OG, sitemap/robots (excluir dev-only) y navegación correcta al cambiar idioma (estrategia `as-needed`).

**Cuándo usar:** Al implementar o depurar la gestión de vistas multiidioma, cambiar slugs traducidos (pricing/about/contact/planes) o cuando el idioma toggle rompa navegación (URLs inválidas como `/es/precios`).

**Contenido:** `src/i18n/routing.ts` (source of truth), `src/app/sitemap.ts`, `src/app/[locale]/(marketing)/*/page.tsx` con `generateMetadata`, `src/app/[locale]/(marketing)/test-error/layout.tsx` con `robots noindex`, y `src/components/language-toggle.tsx` para navegar a URLs canónicas.

---

## 4.1. veta-marketing-i18n-content (implementada)

**Objetivo:** Al crear o cambiar vistas **públicas/comerciales**, generar siempre **contenido y configuración en ES y EN**: namespaces en `marketing.json`, `pathnames`, `generateMetadata`, sitemap, rewrites/redirects y enlaces con `@/i18n/routing`.

**Cuándo usar:** Nueva landing marketing, copy comercial bilingüe, renombrar slugs por idioma, o cualquier tarea “traduce / añade la página en inglés y español” bajo `(marketing)`.

**Contenido:** Checklist ES+EN en `src/i18n/messages/{es,en}/marketing.json`, `src/i18n/routing.ts`, página en `src/app/[locale]/(marketing)/...`, SEO, `src/app/sitemap.ts`, `next.config.ts`; remite a `veta-multilanguage-views` para proxy/SEO avanzado.

---

## 5. veta-db-migrations (pendiente)

**Objetivo:** Flujo seguro de migraciones: solo local, nunca producción desde dev.

**Cuándo usar:** Al crear migraciones, ejecutar `db push`, `db reset` o tocar esquema de Supabase.

**Contenido:** `npm run db:push` = solo `--local`, no usar `supabase link` a producción, `db reset` solo con autorización explícita, reparar estado con `migration repair`.

---

## 6. veta-app-routing (implementada)

**Objetivo:** Estructura de rutas del App Router y rutas protegidas.

**Cuándo usar:** Al añadir rutas, layouts, middleware o redirecciones en la app.

**Contenido:** `(marketing)` público, `(app)` bajo `/veta-app` (APP_BASE), `appPath()` desde `@/lib/app-paths`, futuro `(share)`, middleware de auth.

---

## 7. veta-frontend-components (pendiente)

**Objetivo:** Componentes UI, tema (light/dark), animaciones y convenciones Tailwind/Shadcn del proyecto.

**Cuándo usar:** Al crear o modificar componentes, estilos, animaciones o integración con Shadcn.

**Contenido:** Variables CSS en `globals.css`, `AnimatedSection`/`StaggerContainer`, duraciones y easing, Select sin `value=""`, dark mode por defecto.

---

## Resumen

| Skill                       | Estado       | Prioridad |
| --------------------------- | ------------ | --------- |
| veta-supabase-rls           | Implementada | Alta      |
| veta-forms-validation       | Implementada | Alta      |
| veta-testing                | Implementada | Alta      |
| veta-multilanguage-views    | Implementada | Alta      |
| veta-marketing-i18n-content | Implementada | Alta      |
| veta-db-migrations          | Pendiente    | Media     |
| veta-app-routing            | Implementada | Media     |
| veta-frontend-components    | Pendiente    | Media     |

**Skills con `SKILL.md` en `.agents/skills/` (implementadas aquí):** `veta-supabase-rls`, `veta-forms-validation`, `veta-testing`, `veta-multilanguage-views`, `veta-marketing-i18n-content`, `veta-app-routing`.

**Aún sin carpeta / skill en el repo:** `veta-db-migrations`, `veta-frontend-components` (pendientes hasta añadir su `SKILL.md`).
