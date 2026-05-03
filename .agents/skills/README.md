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

## 5. veta-db-migrations (implementada)

**Objetivo:** Flujo seguro de migraciones: solo local por defecto, esquema versionado en `supabase/migrations`, RLS y tipos alineados con la app.

**Cuándo usar:** Al crear migraciones, ejecutar `db push`, `db reset` o tocar esquema de Supabase.

**Contenido:** `npm run db:push` / `db:reset` con `--local`; convención de nombres de migración; RLS en tablas nuevas; actualizar tipos TS; sin operaciones implícitas contra producción; `migration repair` solo con criterio. Ver `SKILL.md` en `.agents/skills/veta-db-migrations/`.

---

## 6. veta-app-routing (implementada)

**Objetivo:** Estructura de rutas del App Router y rutas protegidas.

**Cuándo usar:** Al añadir rutas, layouts, middleware o redirecciones en la app.

**Contenido:** `(marketing)` público, `(app)` bajo `/veta-app` (APP_BASE), `appPath()` desde `@/lib/app-paths`, futuro `(share)`, middleware de auth.

---

## 7. veta-frontend-components (implementada)

**Objetivo:** Componentes UI, tema con `next-themes`, animaciones y convenciones Tailwind v4 / Shadcn del proyecto.

**Cuándo usar:** Al crear o modificar componentes, estilos, animaciones o integración con Shadcn.

**Contenido:** `src/styles/globals.css` y tokens semánticos; `ThemeProvider` en `src/app/layout.tsx`; `AnimatedSection` / `StaggerContainer` / `StaggerItem`; alineación con `.cursor/rules/02-frontend.mdc`; Select sin `value=""` (detalle en `veta-forms-validation`). Ver `SKILL.md` en `.agents/skills/veta-frontend-components/`.

---

## 8. veta-security-owasp (implementada)

**Objetivo:** Revisar e implementar controles alineados con OWASP Top 10: validación e inyección en formularios y API, rutas privadas y `PUBLIC_ROUTES`, sesión en Route Handlers, RLS/IDOR y SSRF.

**Cuándo usar:** Cambios en formularios, Server Actions, `src/app/api/**`, nuevas rutas, auditorías de seguridad o peticiones explícitas de hardening / OWASP.

**Contenido:** Checklist formularios + Zod en servidor; API con `getUser()` y 401 (middleware no bloquea `/api/*` sin sesión); vistas bajo `veta-app` y middleware; tabla OWASP ↔ prácticas Veta; enlaces a `veta-forms-validation`, `veta-supabase-rls`, `veta-app-routing` y `.cursor/rules/01-security.mdc`.

---

## 9. veta-marketing-strategy-seo-geo (implementada)

**Objetivo:** Contenido de marketing con nivel estratégico para **SEO** y **GEO** (visibilidad en búsqueda clásica y en respuestas citadas / motores generativos), alineado a **buyer personas** en `memory-bank/buyerPersona.md` y a marca/keywords en `memory-bank/productContext.md`.

**Cuándo usar:** Blog, ampliación de copy público, piezas de ayuda o producto “privadas” (app, emails), guías o revisiones de posicionamiento y mensaje por persona (Elena, Javi, Beatriz).

**Contenido:** Intención de búsqueda, E-E-A-T, enlazado interno, estructura extractiva para IA; matriz de mensaje por persona; separación blog / marketing público / UI privada; checklist; remite a `veta-marketing-i18n-content` y `veta-multilanguage-views` para implementación ES+EN y SEO técnico. Ver `SKILL.md` en `.agents/skills/veta-marketing-strategy-seo-geo/`.

---

## 10. veta-supabase-production (implementada)

**Objetivo:** Reglas de seguridad para operaciones sobre el proyecto Supabase de producción (studio-manager / veta.pro): no ejecutar `config push`, SQL ni migraciones contra el remoto sin autorización explícita del usuario.

**Cuándo usar:** Cuando cualquier operación pueda afectar el proyecto hosted — `config push`, `db push` sin `--local`, `execute_sql` del MCP, `apply_migration`, branches o cualquier herramienta que apunte al remoto.

**Contenido:** Regla estricta contra `config push` y SQL en producción sin petición explícita; explicación de por qué `config push` sobrescribe todo `[auth]`; workflow con `--dry-run` para revisar el diff antes de aplicar; tabla de alternativas seguras (Dashboard, Management API, CI/CD).

---

## Resumen

| Skill                           | Estado       | Prioridad |
| ------------------------------- | ------------ | --------- |
| veta-supabase-rls               | Implementada | Alta      |
| veta-forms-validation           | Implementada | Alta      |
| veta-testing                    | Implementada | Alta      |
| veta-multilanguage-views        | Implementada | Alta      |
| veta-marketing-i18n-content     | Implementada | Alta      |
| veta-db-migrations              | Implementada | Media     |
| veta-app-routing                | Implementada | Media     |
| veta-frontend-components        | Implementada | Media     |
| veta-security-owasp             | Implementada | Alta      |
| veta-marketing-strategy-seo-geo   | Implementada | Media     |
| veta-supabase-production          | Implementada | Alta      |

**Skills con `SKILL.md` en `.agents/skills/`:** `veta-supabase-rls`, `veta-forms-validation`, `veta-testing`, `veta-multilanguage-views`, `veta-marketing-i18n-content`, `veta-db-migrations`, `veta-app-routing`, `veta-frontend-components`, `veta-security-owasp`, `veta-marketing-strategy-seo-geo`, `veta-supabase-production`.
