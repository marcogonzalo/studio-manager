# Active Context

## Estado actual

- **Fase:** Phase 1 (MVP Complete). Funcionalidad core implementada y operativa.
- **Producción:** Desplegada en https://veta.pro (dominio propio).

## Work in progress / Próximos pasos

- **Funnel data foundations (PR #212):** First-party `leads` / `user_events`, attribution cookie, GDPR consent at capture, `funnel_users` / `leads_users` (service_role), session tracking in app layout, trusted demo-accessed Bearer stamp. Ops: query views with service role. Next: wire `invite_sent` / `plan_selected` when those flows exist.
- **Control de pagos:** Registro de pagos por proyecto (fechas, importes, tipos: honorarios, provisión compras, coste adicional, otro; vinculación opcional a órdenes de compra o costes adicionales) ya implementado. Falta: que el Dashboard de cuenta calcule "Total de Ingresos este mes" desde la tabla `payments` (actualmente hardcodeado a 0).

## Decisiones activas

- **Framework:** Next.js 16 por SEO en páginas públicas y experiencia tipo SPA en la app autenticada.
- **Base de datos:** Supabase local en desarrollo; producción en Supabase Cloud.
- **Docker:** `localhost:host-gateway` para conectividad con Supabase en el host.
- **Tipos:** Interfaces compartidas en `src/types/index.ts`.
- **Rutas:** `(marketing)` para páginas públicas SEO; `(app)` bajo `/veta-app` para la app autenticada. Futuro: `(share)` para compartir proyectos con clientes sin SEO.

---

*Historial detallado de features completadas en `progress.md`.*
