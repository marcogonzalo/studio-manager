---
name: veta-app-routing
description: >-
  Applies Veta App Router routing conventions: (marketing) public SEO routes,
  (auth) auth routes, and /veta-app private routes protected by Supabase session
  middleware and layout-level redirects. Use when adding new routes, layouts, route
  groups, middleware logic, or robots/index behavior for marketing-only pages.
---

# Veta – App Routing (App Router)

## When to use

- User asks to add or modify routes/layouts in `src/app/`.
- User asks whether a new route must be public or private.
- User reports 404 or unexpected redirects after adding a new segment.
- User asks to integrate a new marketing route with i18n/SEO, or to protect a private route.

## Routing model in this repo

- `src/app/[locale]/(marketing)/...` is public (SEO) marketing.
- `src/app/[locale]/(auth)/...` is auth/public entry for sign-in/sign-up/callback flows.
- `src/app/veta-app/...` is the authenticated app (private).
- Protected app routes are enforced by:
  - `src/app/veta-app/**/layout.tsx` (server-side redirect if no user)
  - `src/lib/supabase/middleware.ts` for session updates and public-path classification.

## Decision: Public vs Private

1. If the new route belongs to:
   - `(marketing)` => public
   - `(auth)` => public (auth entry points)
   - `veta-app` => private
2. If a new top-level route group/segment is introduced outside these known groups, ask the user:
   - “¿Esta ruta debe ser pública (accesible sin sesión) o privada?”

## If route is public (marketing)

1. Put it under `src/app/[locale]/(marketing)/...`
2. Prefer adding route metadata in `generateMetadata` per page:
   - canonical/hreflang/OG should be handled by the marketing/i18n SEO skill.
3. If the route is dev-only (should not be indexed):
   - create `layout.tsx` under that route segment (server)
   - export `robots: { index: false, follow: false }`
   - exclude it from `src/app/sitemap.ts`

## If route is private (`/veta-app`)

1. Put it under `src/app/veta-app/...`
2. Add `layout.tsx` checks (or extend existing layouts) if the route is new:
   - ensure the server component verifies `supabase.auth.getUser()`
   - redirect to `/sign-in?redirect=...` when unauthenticated
3. Keep marketing routes and private routes separated to avoid SEO/public collisions.

## If route is auth (`(auth)`)

1. Put it under `src/app/[locale]/(auth)/...`
2. Ensure the route is reachable without forcing a redirect to `veta-app`.
3. If you add new auth entry routes:
   - update `PUBLIC_ROUTES` in `src/lib/supabase/middleware.ts` so unauthenticated users are not blocked unexpectedly.

## Supabase middleware integration

When adding any new public path that should remain accessible without session:

- Update `PUBLIC_ROUTES` inside `src/lib/supabase/middleware.ts`
- Also verify `isPublicPath()` handles locale prefixes correctly

## Common pitfalls (check before shipping)

- Creating a new route outside the `(marketing)` / `(auth)` / `veta-app` conventions and forgetting to classify it in middleware.
- Adding a new public marketing route but not excluding dev-only routes from `sitemap.ts`.
- Using relative paths under authenticated app without `appPath()` (from `@/lib/app-paths`) which can break redirects.

## Validation (manual)

- Public pages:
  - unauthenticated user can access
  - verify no redirect to sign-in occurs
- Private pages:
  - unauthenticated user is redirected to sign-in
- Dev-only pages:
  - `robots` meta/exports are `noindex` and route is missing from sitemap
- No 404 on the expected locale variants (ES default and EN `/en`).

## References (files to inspect)

- `src/lib/app-paths.ts`
- `src/lib/supabase/middleware.ts`
- `src/app/veta-app/**/layout.tsx`
- `src/app/[locale]/(marketing)/**`
- `src/app/[locale]/(auth)/**`
