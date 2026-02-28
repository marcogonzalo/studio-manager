# Progress

**Estado actual y WIP:** ver `activeContext.md`. Este archivo es un resumen de lo completado y pendiente.

## Completado (resumen por áreas)

- **Infra y auth:** Next.js 16 (App Router), Docker, Supabase (schema, RLS, Auth). Login/signup, magic links, sesión, caducidad con redirección. Migración desde Vite.
- **CRUD:** Clientes, proveedores, catálogo (productos), proyectos. Layout app (sidebar, responsive). Eliminación de proyectos desde la lista (menú ⋮ en cada card, confirmación con `ConfirmDeleteDialog`; RLS solo permite borrar los propios).
- **Detalle de proyecto:** Info general, espacios, renders por espacio, presupuesto (ítems, partidas por fase/categoría, edición, exclusión), órdenes de compra (gestionables, cobertura), **pagos** (registro por proyecto, tipos, vinculación a PO/costes), costes adicionales, documentos (URL + subida), notas (archivado).
- **Almacenamiento:** Tabla `assets`, Backblaze B2, rutas por usuario/proyecto. Subida de imágenes (producto, espacios, documentos). Sharp, límites, `user_storage_usage`.
- **Planes:** Base / Pro / Studio. Consumibles y modalidades, `plan-copy.ts`, `plan-capability.ts`, restricciones por plan, cambio de plan en `/settings/plan`.
- **Marca y marketing:** Veta, logos light/dark, tipografía Montserrat. Páginas marketing (home, about, pricing, contact, planes), SEO, sitemap, robots, OG, MailerSend contacto, dominio veta.pro.
- **UI/UX y a11y:** Tema natural/pastel, dark mode OKLCH, animaciones (Framer Motion), skeletons, skip link, una h1 por página, focus-visible, `prefers-reduced-motion`, loading por ruta.
- **PDF:** Presupuestos con `@react-pdf/renderer` (espacios, costes adicionales, opciones de filtrado).
- **Cuenta:** Perfil, personalización (/customization), Mi cuenta (email, zona peligro, eliminar cuenta, cambiar email). Legal (términos, privacidad). Plantillas email Supabase.
- **Seguridad:** Headers (CSP, X-Frame-Options, etc.), validación ownership en uploads, OWASP documentado.
- **Analytics:** GTM, GA4, Cookiebot, CSP ajustada para terceros.
- **PageSpeed / marketing:** Auditoría PageSpeed sobre rutas (marketing); preconnect a GTM/Cookiebot en layout; secciones below-the-fold de la home lazy-load con `next/dynamic` (`_sections/`); contraste WCAG AA (globals.css); logo con `alt=""` cuando va con wordmark; CSP con `consent.cookiebot.eu`; docs `pagespeed-audit-marketing.md`, `pagespeed-improvements-from-report.md`.
- **Contraste modo claro y oscuro (rama fix/dark-mode-contrast-and-cards):** Modo oscuro con paleta marrón (bg 0.17, card 0.18, secondary/accent 0.17), textos 0.98, brand-foregrounds oscuros; modo claro con contraste ≥4.5:1 (textos 0.16–0.17, brand-foregrounds oscuros), profundidad por capas. Botón primary con texto blanco (0.98) por decisión de diseño (ratio ~1.5:1). **Tema por defecto:** `system` (modo claro salvo que el navegador indique oscuro). **Dark:** sombras invertidas (luz desde arriba), glow-dark en CTAs, pestaña activa en proyectos resaltada (bg-card, ring, shadow). Docs `contrast-audit.md` actualizado.
- **Otros:** Moneda por proyecto/producto, validación teléfono (libphonenumber), mensajes auth amigables, Supabase keys por entorno.
- **Reporte de fallos:** Enlace "Reportar fallo" en el menú de usuario que abre GitHub Issues con plantilla YAML (ES/EN), pre-rellenando título y URL de la vista. Ver `src/lib/report-bug.ts` y `.github/ISSUE_TEMPLATE/`.
- **Onboarding (issue #51):** Wizard por pasos: bienvenida (sessionStorage, sin campo en BD), config → cliente → proyecto → public-profile (PRO/STUDIO). Sin pasos espacio ni catálogo. Modal un paso por sesión; "Más tarde" en sessionStorage; CTA cierra modal y navega con `?onboarding=stepId`; resaltado en destino (hook `ready` tras loading). Checklist en dashboard. Correo público = `profile.email`. Personalización en `/settings/customization`; diálogo nuevo proyecto usa valores por defecto de cuenta. Ver `src/lib/onboarding.ts`, `src/components/onboarding/`, `src/lib/use-onboarding-status.ts`, `src/lib/use-onboarding-highlight.ts`.
- **Vistas de configuración:** Sidebar unificado (Cuenta, Personalización, Tu plan, Tema); breadcrumbs en vistas de configuración; Perfil integrado en Cuenta (nombre/empresa); menú cuenta unificado (avatar colapsado/expandido); oferta plan cambio (0 €, precio tachado, "Oferta por tiempo limitado"); selector mensual/anual oculto; input estándar `INPUT_CONFIG_STANDARD_CLASS` en configuración; iconos en labels (personalización, cuenta).
- **Memory bank:** Optimización aplicada: activeContext, productContext, constraints, progress; eliminados techContext, systemPatterns y archivos duplicados (.optimized). Ver OPTIMIZATION_PROPOSAL.md.
- **Rendimiento (rama fix/web-performance):** Tema por defecto `system`; preconnect con crossorigin a Cookiebot CDN; sombras/glow invertidos en dark y pestaña activa resaltada; `optimizePackageImports` para lucide-react; `.below-the-fold` (content-visibility) en home; middleware excluye `_vercel` (scripts Vercel sin redirect a sign-in, caché correcta); Cache-Control immutable para `/_next/static/*`; scroll tab proyecto con requestAnimationFrame (evitar forced reflow); tests de headers usan helper para config `/:path*`.

## Pendiente

- [ ] **Dashboard — Total de Ingresos este mes:** Calcular el KPI desde la tabla `payments` (filtro por `payment_date` en el mes actual). El registro de pagos por proyecto ya existe; solo falta conectar el dashboard. Ver issue #61.
- [ ] **Notificaciones por email:** Avisos a clientes/proveedores (p. ej. vía Edge Functions).

---

*El historial detallado de cada feature (bugs del primer review, mejoras UI, etc.) está en el historial de git y en PRs cerrados.*
