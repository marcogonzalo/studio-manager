# Limitaciones y convenciones (no inferibles solo del código)

## Entorno y variables

- **Supabase:** Local con `pnpm run supabase:start:slim` (stack reducido; menos RAM). Opcional: `pnpm run supabase:studio` (dashboard), `pnpm run supabase:mail` (Inbucket). Stack completo: `pnpm run supabase:start`. Producción: Supabase Cloud. Claves: `NEXT_PUBLIC_SUPABASE_*` (cliente), `SUPABASE_SECRET_KEY` o `SUPABASE_SERVICE_ROLE_KEY` en servidor (ver `src/lib/supabase/keys.ts`).
- **Backblaze B2:** Imágenes y documentos. Variables: `B2_APPLICATION_KEY_ID`, `B2_APPLICATION_KEY`, `B2_BUCKET_ID`, `B2_BUCKET_NAME`. Rutas: `assets/{userId}/catalog/`, `assets/{userId}/projects/{projectId}/img/`, `.../doc/`.
- **Docker:** `extra_hosts: localhost:host-gateway` para que el contenedor alcance Supabase en el host.
- **CI/CD:** Pipeline en `.github/workflows/ci.yml`; documentación en `docs/ci-cd.md`.

## Patrones de datos

- **Assets y almacenamiento:** Cada subida crea fila en tabla `assets` y opcionalmente `asset_id` en tablas de dominio (`products`, `project_documents`, `space_images`). Bytes en B2. `user_storage_usage` mantenido por triggers.
- **RLS:** Todas las tablas con RLS habilitado; políticas por `user_id` / `auth.uid()`. No confiar solo en comprobaciones en cliente.

## Funnel analytics (first-party)

- **`user_events`:** Product engagement. Client components call `trackUserEvent` (server action); RSC/route handlers call `trackEvent`. Never import the server Supabase client in client components for tracking.
- **Tracking never throws:** Failures go through `reportError` and must not block UX.
- **Event props:** Pass `project_id` (or `supplier_id`) when the event is scoped; empty props weaken activation analysis.
- **`leads`:** Service role only. Browser must not write leads; capture via `demo-request` / auth APIs. Demo access stamp via Bearer on `demo-accessed` plus `leads.demo_access_token` (shared `demo@veta.pro` session cannot match by visitor email).
- **Sample project on signup (#233):** `ensure_profile_and_account_settings_from_auth` calls `seed_sample_project` once for brand-new non-demo users with zero projects (ES/EN literals, no images). Seed creates `status = completed`, `is_sample = true` — does **not** consume Base active-project slot until reopened. Emits no `user_events`. Onboarding “Create a project” ignores `is_sample`. Reopen goes through active-project limit. No re-seed after delete.
- **Funnel primary activation:** Event-based — `project_created` (or `sample_reopened`) within 7d of signup plus `budget_created` or `supplier_created` in the same window. `funnel_users` excludes `demo@veta.pro`. `budget_created` props may include `source: catalog|manual`.
- **Attribution:** Cookie `veta_attribution` (90d) only when analytics consent is present; demo-request and sign-up attach UTMs to leads.
- **Signup timestamp:** Use `auth.users.created_at` in SQL views — never invent `profiles.created_at`.
- **Views:** `funnel_users` / `leads_users` are service_role analytics surfaces (no end-user dashboard yet). Query them with the service role for activation/conversion.
- **Consent:** Store `marketing_consent` + `consent_at` at capture time.
- **Sessions:** `trackSessionStart` in `veta-app` layout (deduped via own-row SELECT on `user_events`).

## Limitaciones técnicas

- **Dependencias circulares:** Evitar importar interfaces desde archivos de componentes; usar `src/types/index.ts`.
- **PostCSS:** Tailwind v4 requiere el plugin `@tailwindcss/postcss`.
