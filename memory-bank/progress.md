# Progress

**Estado actual y WIP:** ver `activeContext.md`. Este archivo es un resumen de lo completado y pendiente.

## Completado (resumen por áreas)

- **Infra y auth:** Next.js 16 (App Router), Docker, Supabase (schema, RLS, Auth). Login/signup, magic links, sesión, caducidad con redirección. Migración desde Vite.
- **CRUD:** Clientes, proveedores, catálogo (productos), proyectos. Layout app (sidebar, responsive).
- **Detalle de proyecto:** Info general, espacios, renders por espacio, presupuesto (ítems, partidas por fase/categoría, edición, exclusión), órdenes de compra (gestionables, cobertura), **pagos** (registro por proyecto, tipos, vinculación a PO/costes), costes adicionales, documentos (URL + subida), notas (archivado).
- **Almacenamiento:** Tabla `assets`, Backblaze B2, rutas por usuario/proyecto. Subida de imágenes (producto, espacios, documentos). Sharp, límites, `user_storage_usage`.
- **Planes:** Base / Pro / Studio. Consumibles y modalidades, `plan-copy.ts`, `plan-capability.ts`, restricciones por plan, cambio de plan en `/settings/plan`.
- **Marca y marketing:** Veta, logos light/dark, tipografía Montserrat. Páginas marketing (home, about, pricing, contact, planes), SEO, sitemap, robots, OG, MailerSend contacto, dominio veta.pro.
- **UI/UX y a11y:** Tema natural/pastel, dark mode OKLCH, animaciones (Framer Motion), skeletons, skip link, una h1 por página, focus-visible, `prefers-reduced-motion`, loading por ruta.
- **PDF:** Presupuestos con `@react-pdf/renderer` (espacios, costes adicionales, opciones de filtrado).
- **Cuenta:** Perfil, personalización (/customization), Mi cuenta (email, zona peligro, eliminar cuenta, cambiar email). Legal (términos, privacidad). Plantillas email Supabase.
- **Seguridad:** Headers (CSP, X-Frame-Options, etc.), validación ownership en uploads, OWASP documentado.
- **Analytics:** GTM, GA4, Cookiebot, CSP ajustada para terceros.
- **Otros:** Moneda por proyecto/producto, validación teléfono (libphonenumber), mensajes auth amigables, Supabase keys por entorno.
- **Memory bank:** Optimización aplicada: activeContext, productContext, constraints, progress; eliminados techContext, systemPatterns y archivos duplicados (.optimized). Ver OPTIMIZATION_PROPOSAL.md.

## Pendiente

- [ ] **Dashboard — Total de Ingresos este mes:** Calcular el KPI desde la tabla `payments` (filtro por `payment_date` en el mes actual). El registro de pagos por proyecto ya existe; solo falta conectar el dashboard. Ver issue #61.
- [ ] **Notificaciones por email:** Avisos a clientes/proveedores (p. ej. vía Edge Functions).

---

*El historial detallado de cada feature (bugs del primer review, mejoras UI, etc.) está en el historial de git y en PRs cerrados.*
