# Progress

## Completed Features

- [x] Project Initialization (Next.js 16, React, TS).
- [x] Migration from Vite/React to Next.js App Router.
- [x] Docker Environment.
- [x] Supabase Setup (Schema, RLS, Auth).
- [x] Authentication UI.
- [x] App Layout (Sidebar, Responsive).
- [x] Clients Module (List, Create, Edit, Delete).
- [x] Suppliers Module.
- [x] Catalog Module.
- [x] Projects Module (List, Create).
- [x] Project Details:
  - [x] General Info.
  - [x] Spaces & Renders.
  - [x] Budgeting & Items.
  - [x] Purchase Orders.
  - [x] Notes.
  - [x] Documents.
- [x] UI Theming (Natural/Pastel).
- [x] **Unified Dark Mode Theme:** Dark mode mejorado con paleta beige suave (Soft Dark Beige) que armoniza con el modo claro. Uso de OKLCH para colores perceptualmente uniformes. Todos los colores hardcodeados (grises, verdes, rojos) reemplazados con variables CSS del tema para consistencia total. Contraste mejorado en textos secundarios. Theme toggle integrado en sidebar.
- [x] Dashboard Implementation.
- [x] Session Expiration Handling: Redirige al login guardando la ruta de destino cuando la sesión caduca, y redirige automáticamente después del login exitoso.
- [x] Custom 404 Page: Página de error 404 personalizada con temática de arquitectura, diseño moderno y navegación contextual.

- [x] **Product Image Upload (Backblaze B2):** Subida de imágenes de producto a Backblaze B2. Opción URL (por defecto) o subir archivo (JPG, PNG, WebP). Compresión con Sharp: redimensionado a 1200px máximo, conversión a WebP calidad 100. Estructura de almacenamiento: `assets/{userId}/catalog/` (catálogo) y `assets/{userId}/projects/{projectId}/img/` (proyecto). Disponible en catálogo y en formulario de nuevo producto desde presupuesto (add-item-dialog).

- [x] **Documents Module (Modal + Upload):** Vista de documentos con botón "Añadir documento" que abre modal. Campos: Nombre, URL/Imagen (tabs URL y Subir archivo). Subida de archivos: PDFs, docs, hojas de cálculo, presentaciones, texto (máx. 10MB). Auto-relleno del nombre desde nombre del fichero si está vacío. Limpieza automática: si el registro no se completa (cierre modal o fallo insert), se elimina el archivo huérfano de B2. Estructura: `assets/{userId}/projects/{projectId}/doc/`.

- [x] **Space Renders Upload:** Modal de renders de espacios permite subir imágenes además de URL. Tabs URL / Subir archivo. Imágenes JPG, PNG, WebP (máx. 5MB), procesadas con Sharp. Estructura: `assets/{userId}/projects/{projectId}/img/{imageId}.ext`.

- [x] **Storage Structure (assets):** Todos los archivos del proyecto organizados bajo `assets/{userId}/` con subcarpetas `catalog/` (imágenes producto catálogo), `projects/{projectId}/img/` (imágenes de proyecto y renders de espacios), `projects/{projectId}/doc/` (documentos).

- [x] **Account deletion (danger zone):** En Mi cuenta, sección desplegable "Zona de peligro" con botón Eliminar cuenta. Confirmación mediante reintroducción del correo electrónico. API POST /api/account/delete elimina en cascada datos del usuario (payments, projects, clients, suppliers, products, plan_assignments, profile), archivos en B2 (deleteAllFilesForUser) y usuario en Auth. No se eliminan los planes (tabla plans). Requiere SUPABASE_SERVICE_ROLE_KEY en servidor. Collapsible con animación 300ms (keyframes usando --radix-collapsible-content-height). Botón destructivo con texto blanco.

- [x] **Change email:** En Mi cuenta, botón "Cambiar correo electrónico" en la card Email. Modal para nuevo email; Supabase Auth updateUser con emailRedirectTo a `/auth?email_updated=1`. Migración `20260219100000_sync_profiles_email_on_auth_update.sql`: trigger que actualiza `profiles.email` cuando cambia `auth.users.email`. En `/auth?email_updated=1` toast de confirmación y signOut para forzar login con el nuevo correo. Sidebar, Mi perfil y modal de eliminar cuenta muestran el correo de Auth (`user?.email`).

- [x] **Personalización (ruta /customization):** Vista de configuración renombrada a Personalización; ruta cambiada de `/settings` a `/customization`. Cards: Presupuesto (nombre público y correo para PDF, deshabilitados en plan BASE) y Valores por defecto (moneda, impuesto). El correo de `profiles` se edita aquí y se muestra en los PDF de presupuestos cuando el plan lo permite. Icono Mail en la card Email de Mi cuenta.

- [x] **Usage Plans (Planes de uso):** Sistema de planes Base (BASE), Pro (PRO) y Studio (STUDIO). Plan "Prueba" renombrado a "Base" en toda la app; migración para actualizar nombre en BD. Registro: plan y billing se envían en user_metadata (sin mostrar selector al usuario). Vista Pricing con PricingCardsClient (selector mensual/anual, precios equivalentes, animaciones). Migraciones: tablas `plans` (consumibles y modalidades: budget_mode, costs_management, documents, etc.) y `plan_assignments`, función `get_effective_plan`. AuthProvider expone `effectivePlan`. Vista Pricing actualizada; registro con plan en URL; pill de plan en Mi cuenta y menú. Restricciones por plan: moneda/impuesto por proyecto, pestañas Compras/Pagos/Documentos, opciones PDF y "Excluir del proyecto" (budget_mode), Importe real y coste interno (costs_management), renders (documents). Control de costes accesible para todos con overlay deshabilitado en plan base.

- [x] **App UI improvements (usabilidad, accesibilidad, consistencia):** Logos solo en `public/img/`; favicon con iconos light/dark en metadata. Títulos por ruta "Veta > Sección" y "Veta > Proyectos > [nombre]" (layouts por sección + generateMetadata en projects/[id]). Skip link: logo del sidebar → `/dashboard#main-content`; main focusable. Tab del detalle de proyecto en URL (`?tab=overview|spaces|quotation|expenses|...`). Sustitución de `confirm()` por AlertDialog (`ConfirmDeleteDialog`) en Catálogo, Clientes y Proveedores. Debounce 500 ms en búsquedas (Catálogo, Clientes, Proveedores). Placeholders y textos de loading con ellipsis Unicode ("…"). Helper `formatDate()` con Intl en dashboard, proyectos y detalle. Descripción bajo título y cabeceras unificadas (flex flex-col gap-1) en Proyectos, Catálogo, Proveedores, Clientes. Empty states en cards (icono + título + CTA). Tablas sustituidas por grids de cards en Catálogo, Clientes y Proveedores. `prefers-reduced-motion` en AnimatedSection, StaggerContainer, StaggerItem y AnimatedCounter. `aria-hidden` en iconos decorativos del dashboard. `color-scheme: dark/light` en globals.css. Metadata title/description en layout (app). Buscador en vista de proyectos (nombre, descripción, cliente). Documento de análisis y checklist en `docs/ui-improvements-app-analysis.md`.

## Pending Features

- [ ] **Email Notifications:** Notify clients/suppliers (via Edge Functions).
- [ ] **Payment Control System:** Sistema de control de pagos recibidos de clientes. Debe permitir registrar pagos asociados a proyectos, con fechas, montos y métodos de pago. El total de ingresos del mes en el Dashboard se calculará a partir de estos pagos registrados. Actualmente el Dashboard muestra un placeholder para esta funcionalidad.
- [x] **Testing:** Unit and E2E tests.
- [x] **Production Deployment.**

## Issues & Improvements from First Review

### Critical Bugs

- [x] **Purchase Orders RLS Error:** La creación de órdenes de compra da error: `{"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \"purchase_orders\""}`. Revisar y corregir políticas RLS para `purchase_orders`. **RESUELTO:** Se añadió el campo `user_id` al insert de purchase orders en `project-purchases.tsx`.

### Functionality Improvements

- [x] **Edit Budget Items:** Una vez incorporado un item al presupuesto, no se puede editar, solo borrar. Debe permitirse editar items del presupuesto. **RESUELTO:** Se añadió funcionalidad de edición en `AddItemDialog` y botón de editar en la tabla de `project-budget.tsx`.

- [x] **Add Products to Spaces:** Debe poderse agregar productos directamente en cada espacio y que luego aparezcan automáticamente en el presupuesto. Los productos deben poder agregarse desde ambos lugares: espacio y presupuesto. **RESUELTO:** Se creó `SpaceProductsDialog` que permite añadir productos directamente desde un espacio. Los productos se vinculan automáticamente al espacio y aparecen en el presupuesto.

- [x] **Space Products View:** Los espacios deben poder abrirse y ver todos los productos que tienen asociados en una grilla muy visual. **RESUELTO:** Se implementó una grilla visual de productos con imágenes en `SpaceProductsDialog`, accesible desde el botón "Productos" en cada tarjeta de espacio.

- [x] **Additional Project Costs:** Un proyecto puede tener costes adicionales dentro del proyecto (por ejemplo, envío, embalaje, instalación, entre otros costes). **RESUELTO:** Se creó la tabla `additional_project_costs` con migración, se implementó `AdditionalCostDialog` para añadir/editar costes, se creó `ProjectAdditionalCosts` component que agrupa costes por tipo, y se añadió la pestaña en el detalle del proyecto.

- [x] **Visual Product Selection:** Para agregar productos a un espacio o presupuesto, debe proveerse un listado más visual (una lista por tarjetas con imagen, nombre del producto y proveedor). **RESUELTO:** Se implementó un sistema de pestañas con búsqueda en tiempo real y grid visual de productos en tarjetas. Incluye búsqueda por nombre, descripción o referencia, y separación clara entre seleccionar del catálogo y crear nuevo producto.

- [x] **Product Image Modal:** En los elementos que muestren un producto en los listados, con imagen pequeña, la imagen debe poder abrirse en una modal para verla ampliada. Puede ser una modal que directamente muestre todo el detalle del producto, como una ficha. **RESUELTO:** Se creó `ProductDetailModal` que muestra imagen ampliada y todos los detalles del producto (nombre, descripción, referencia, categoría, proveedor, costos, precios). Integrado en SpaceProductsDialog, project-budget, catalog page y add-item-dialog. Las imágenes son clickeables en todos los lugares donde se muestran productos.

- [x] **Delete Notes:** Las notas deben poder eliminarse. **RESUELTO:** Se añadió botón de eliminar en cada nota con confirmación y política RLS para delete.

- [x] **Archive Notes:** Las notas tendrán todas un check para marcar si ya se pueden archivar. Mostrando siempre primero las no archivadas. Las archivadas estarán en un tono más claro, para que no destaquen tanto. **RESUELTO:** Se añadió campo `archived` a la tabla, checkbox para archivar/desarchivar, ordenamiento (no archivadas primero), estilo con opacidad reducida para archivadas, y atajo de teclado Ctrl/Cmd + Enter para guardar notas.

- [x] **Product Reference URL:** Un producto debe tener una URL de referencia de donde se ha cogido la información. **RESUELTO:** Se añadió campo `reference_url` a la tabla `products` mediante migración. El campo está disponible en `product-dialog` y `add-item-dialog` (pestaña nuevo producto). Se muestra como enlace clickeable en `ProductDetailModal` cuando existe.

- [x] **Add Supplier from Product Form:** Se debe poder añadir un nuevo proveedor desde el formulario de nuevo producto, para facilitar la usabilidad. Que sea una opción de seleccionar o agregar nuevo y que al agregarlo quede seleccionado como el proveedor de ese producto. **RESUELTO:** Se añadió botón con icono de Plus junto al selector de proveedor en `product-dialog.tsx` y `add-item-dialog.tsx` (pestaña nuevo producto). Al crear un nuevo proveedor, se actualiza la lista y se selecciona automáticamente. Se modificó `SupplierDialog` para retornar el ID del proveedor creado en el callback `onSuccess`.

- [x] **Add Product from Space/Budget:** Se debe poder añadir un nuevo producto directamente desde el espacio o el presupuesto. Que no sea necesario ir a Catálogo para agregar el producto para luego volver al espacio o al presupuesto a agregarlo. **RESUELTO:** El `AddItemDialog` permite crear productos personalizados que se añaden automáticamente al catálogo. Funciona tanto desde `SpaceProductsDialog` como desde `project-budget.tsx`.

- [x] **Manageable Purchase Orders:** La orden de compra debe ser gestionable. Al crearla, se debe poder especificar los productos asociados a esa orden de compra, no se debe asumir que son todos los productos registrados hasta el momento. Por lo general estarán, al menos, generadas por proveedor. **RESUELTO:** Se creó `PurchaseOrderDialog` que permite crear y editar órdenes de compra con selección manual de ítems. Los ítems se filtran por proveedor y se pueden seleccionar mediante checkboxes. Se añadió funcionalidad de edición y eliminación de órdenes. La visualización muestra los ítems en una tabla con totales calculados. Se creó componente `Checkbox` para la UI.

- [x] **Advanced PDF Generation:** Generación avanzada de PDFs estéticos y organizados para presupuestos. **RESUELTO:** Se implementó generación de PDFs usando `@react-pdf/renderer` con diseño profesional que incluye: elementos agrupados por ubicación (espacios) con subtotales, costes adicionales agrupados por tipo, formato de moneda español (1.234,56 €), información completa del proyecto y cliente, nombre del arquitecto, y diseño visual usando los colores de la aplicación. El PDF se genera dinámicamente desde la página de presupuesto con importación dinámica para evitar problemas con Vite.

- [x] **Dashboard Statistics:** Dashboard conectado con estadísticas reales de la cuenta. **RESUELTO:** Se implementaron métricas en tiempo real: proyectos activos con cambio porcentual mes a mes, clientes totales con nuevos clientes del mes, total de gastos este mes (suma de gastos adicionales y órdenes de compra confirmadas), y total de ingresos este mes (placeholder para futuro sistema de control de pagos). Se eliminó la métrica de productos en catálogo. El Dashboard muestra proyectos recientes con información relevante y enlaces directos.

- [x] **Budget Organization by Phase:** Reorganización del presupuesto para agrupar primero por fase del proyecto y luego por categoría. **RESUELTO:** Se modificó `project-budget.tsx` y `project-pdf.tsx` para agrupar partidas presupuestarias primero por fase (Diagnóstico → Diseño → Proyecto Ejecutivo → Presupuestos → Obra → Entrega → Sin Fase) y luego por categoría dentro de cada fase. Estructura jerárquica con secciones colapsables.

- [x] **Dashboard KPI Improvements:** Mejoras en el dashboard de proyecto con reorganización de KPIs y mejor UX. **RESUELTO:** Se reorganizaron las tarjetas KPI en orden: Avance, Cobertura de Pagos, Desviación Costes, Presupuestado, Coste total, Margen Bruto. Se agregaron "Presupuestado" y "Coste total" como tarjetas KPI separadas. Se implementó indicador visual con flechas y colores para desviación de costes (verde/flecha abajo cuando es favorable, rojo/flecha arriba cuando es desfavorable). Grid responsive: 1 columna móvil, 2 tablet, 3 PC. Se eliminó la tarjeta "Resumen Financiero" redundante.

- [x] **UI/UX Improvements:** Mejoras en la interfaz de usuario. **RESUELTO:** Se corrigió visualización de nombre de producto en `space-products-dialog.tsx`. Se mejoró UX en `purchase-order-dialog.tsx` haciendo los cards seleccionables al hacer clic en cualquier parte. Se cambió "Control Costes" a "Control de costes" en los tabs. Se eliminaron las tarjetas de resumen del componente de control de costes. Se mejoró el layout de tabs para que ocupen el ancho completo y distribuyan los elementos uniformemente.

- [x] **Profit Calculation Fix:** Corrección del cálculo de beneficio/pérdida del proyecto. **RESUELTO:** Los honorarios propios (`own_fees`) ahora se reconocen como ingresos, no como costes. Se añadió `COST_CATEGORIES` y `isCostCategory` en `utils.ts`. El cálculo del beneficio es: Presupuestado (precio productos + partidas visibles) - Costes reales (coste productos + partidas de obra/servicios/operaciones). Los honorarios se excluyen del control de costes y solo aparecen en presupuesto.

- [x] **Cost Control Totalization:** Añadida tarjeta de resumen en control de costes. **RESUELTO:** Se muestra Total Estimado y Total Real con barra de progreso de desviación. Colores: verde (< 100%), amarillo (100-101%), rojo (> 101%). Incluye productos y partidas presupuestarias.

- [x] **Budget Line Dialog for Fees:** El campo "Importe Real" se oculta para honorarios propios. **RESUELTO:** Cuando se selecciona categoría `own_fees`, el campo `actual_amount` se oculta y se muestra mensaje explicativo: "Los honorarios son ingresos y no requieren importe real de coste."

- [x] **Purchase Order Coverage Display:** Simplificada visualización de cobertura de órdenes de compra. **RESUELTO:** Se eliminó el importe cubierto del display y el porcentaje se limita a un máximo de 100%.

- [x] **Mark Products as Excluded from Project (Phase 6):** Los ítems del proyecto pueden marcarse como excluidos del presupuesto. **RESUELTO:** Se añadió `is_excluded` (boolean, default false) en `project_items`. Checkbox "Excluir del proyecto" en el formulario de ítem (no se puede excluir si tiene PO activa). En la pestaña Presupuesto los productos excluidos no se muestran ni entran en totales ni en el PDF. En el diálogo de productos por espacio se muestran con estilo atenuado (opacity/grayscale) y etiqueta "Excluido del proyecto". Los excluidos se filtran en el diálogo de órdenes de compra al elegir ítems.

- [x] **Budget Print Filtering Options (Phase 7):** Opciones de filtrado al exportar presupuesto a PDF. **RESUELTO:** Al pulsar "Exportar PDF" se abre un diálogo con tres opciones: Presupuesto completo (productos + partidas), Solo productos (mobiliario por ubicación), Solo partidas (servicios y partidas). El PDF generado incluye solo las secciones elegidas y la totalización correspondiente.

- [x] **Account View & Profile (Mi cuenta):** Vista de cuenta accesible desde el menú del usuario. Permite editar perfil: nombre completo (`full_name`), empresa y nombre público (visible en presupuestos PDF). Pre-llenado de nombre público al enfocar si está vacío desde `full_name`. Migración añade `company` y `public_name` a `profiles`; el nombre del usuario se gestiona con `full_name` (único campo, también usado en registro).

- [x] **Currency per Project:** Cada proyecto tiene moneda configurable (EUR, USD, GBP, CHF, MXN, BRL, ARS, COP, CLP). Selector en formulario de proyecto. Todos los importes del proyecto (presupuesto, dashboard, costes, pagos, PDF) usan la moneda del proyecto. Símbolo "??" cuando moneda es undefined.

- [x] **Currency per Product:** Productos del catálogo tienen coste base + moneda. Campo compuesto (input group) en formulario de producto. Catálogo muestra coste con la moneda del producto.

- [x] **Settings / Configuration View:** Vista de configuración accesible desde menú del usuario. Valores por defecto de cuenta: impuesto y moneda. Se sugieren al crear nuevo proyecto o producto. Productos del catálogo sin moneda usan moneda por defecto. Migración añade `default_tax_rate` y `default_currency` a `profiles`.

- [x] **Legal Page (Términos y Privacidad):** Vista `/legal` con términos de uso, política de privacidad y derechos RGPD. Checkbox obligatorio en formulario de registro: "He leído y estoy conforme con los términos de uso y privacidad" con enlace a `/legal`. Enlace en footer actualizado.

- [x] **Brand Rename to Veta:** Marca unificada bajo el nombre **Veta**. Logos en `public/img/veta-light.webp` y `public/img/veta-dark.webp`; componente `VetaLogo` con alternancia por tema. Actualizados: metadata (layout, next.config `NEXT_PUBLIC_APP_NAME`), sidebar, auth, marketing header/footer, README, y páginas legal, about, contact y home. Email de contacto de ejemplo: `hey@veta.pro`.

- [x] **Brand Typography & Visual Refinement:** Refinamiento de tipografía y efectos visuales de marca. **Tipografía del logo:** Montserrat, 16px, peso 300 (light), line-height 20px, alineación vertical middle, alineación texto left. **Efectos visuales:** Brillo blanco sutil en modo oscuro (`drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`) para mejorar visibilidad del logo sobre fondos oscuros. **Copy de marketing actualizado:** Hero headline "Gestiona tus proyectos de diseño sin complicaciones", descripción hero con "y toma el control", período de prueba actualizado a 30 días, footer tagline "La plataforma para gestión de proyectos de diseño interior."

- [x] **Marketing Fase 1 (SEO y conversión):** Menú móvil con Sheet en marketing layout; formulario de contacto funcional (Resend); email coherente con Veta (`hey@veta.pro`); `sitemap.ts` y `robots.ts`; metadata y Open Graph por página; imagen OG dinámica; Twitter Cards; `metadataBase` en root layout. Ver `docs/marketing-seo-analysis.md`.

- [x] **Dominio y pricing:** Dominio veta.pro en URLs, metadata, sitemap, robots y documentación. JSON-LD SoftwareApplication con AggregateOffer y UnitPriceSpecification (Pro 25/275 €, Studio 75/750 € mensual/anual). Vista de precios con opción anual y formatCurrency sin decimales.

- [x] **Plantillas de email Supabase (Veta):** Plantillas de correo de Auth personalizadas en español con marca Veta (verde #759b6d, cream, Montserrat). Incluyen: confirmación, invitación, recuperación de contraseña, magic link, cambio de email, reautenticación (OTP), y notificaciones de contraseña/email cambiados. Config en `supabase/config.toml`; archivos en `supabase/templates/`. Documentación en `docs/supabase-email-templates.md` (variables, uso local con Inbucket, pasos para copiar en Dashboard en producción).

- [x] **Dynamic UI Upgrade (Animations & Modern Design):** Mejora completa de la interfaz con animaciones dinámicas y diseño moderno. **Componentes de animación:** `AnimatedSection`, `StaggerContainer`, `StaggerItem` para scroll-reveal animations; `AnimatedCounter` para números animados; `Skeleton` para loading states. **Marketing pages mejoradas:** Homepage con hero split layout (copy + product mockup), stats section con contadores animados, features con staggered animations, testimonials con avatares y animaciones, CTAs con gradientes radiales y efectos glow, header con scroll-aware opacity. **Páginas pricing y about:** Mismas mejoras aplicadas (animaciones scroll-reveal, gradientes, efectos glow). **Dashboard app:** Skeleton loading states, contadores animados en stats, staggered entry animations. **Modales/Dialogs:** Animaciones mejoradas en Dialog y Sheet components (fade + zoom + slide, 300ms, easing consistente). **CSS animations:** Keyframes para float, glow, shimmer añadidos a globals.css. **Dependencia:** framer-motion v12.34.0 instalada. Todas las animaciones usan easing `cubic-bezier(0.25, 0.4, 0.25, 1)` para consistencia.

- [x] **Dashboard & home first-load fix (fixes #27):** Contenido visible al cargar sin depender del scroll. `AnimatedSection`, `StaggerContainer`, `AnimatedCounter` con opción `triggerOnMount` (por defecto true) para animar al montar; desde sección #features en home se usa `triggerOnMount={false}` para animar al hacer scroll. `useInView(initial: !triggerOnMount)` para evitar contenido invisible por retraso del observer.

- [x] **Accesibilidad lista beneficios (fixes #28):** Lista de beneficios de la home con estructura semántica correcta: componente `BenefitsList` con `ul`/`li` y animación con `motion.ul`/`motion.li`.

- [x] **Loading por rutas de app con variantes:** Componente `PageLoading` con variantes (default, dashboard, table, cards, form, detail) y `loading.tsx` en (app), dashboard, clients, projects, catalog, suppliers, account, settings y projects/[id], cada uno con la variante que mejor refleja la vista.

- [x] **Sistema de conexiones Supabase mejorado:** Implementado sistema de keys diferenciado por entorno. **Producción:** Usa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (cliente, seguro con RLS) y `SUPABASE_SECRET_KEY` (servidor, acceso privilegiado). **Local:** Usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` para ambos. Helper `src/lib/supabase/keys.ts` detecta automáticamente el entorno. Actualizados todos los clientes Supabase (client.ts, server.ts, middleware.ts, callback route, API upload routes) para usar las funciones helper. `.env.example` actualizado con documentación de las nuevas variables. README actualizado con tabla de variables y explicación del sistema.

- [x] **Seguridad OWASP (rama fix/security-critical-issues):** Revisión OWASP Top 10 documentada en `OWASP_SECURITY_REVIEW.md` y `SECURITY_EXPLANATION.md`. Implementados: headers de seguridad HTTP (CSP con `blob:` para vistas previas, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy); validación de ownership en DELETE y POST de `/api/upload/document`, `/api/upload/product-image` y `/api/upload/space-image`; flujo de creación de producto que condiciona la subida de imagen a la existencia del producto (evita imágenes huérfanas). Tests para headers y ownership en uploads. Lista de aspectos pendientes en `SECURITY_PENDING.md`. CI/CD con `npm ci` y verificación de integridad de dependencias: ver **`docs/ci-cd.md`**.

- [x] **Rama feat/ui-improvement-with-skills:** Mejoras de UI/UX y a11y: vistas de error (`error.tsx`, `global-error.tsx`) con línea visual alineada a 404; loading por skeletons en lugar de texto "Cargando" en app, dialogs y módulos de proyecto; focus-visible en controles (globals.css); Sheet con `closeLabel` para menú móvil ("Cerrar menú"); una h1 por página en app; 404 con `not-found-pattern` y aria-hidden. Ruta de prueba `/test-error` (solo dev) y cookie `test-global-error` para forzar global-error. Documento de mejoras `docs/MEJORAS-UI-NEXT-WEB-GUIDELINES.md` eliminado (backlog ya aplicado o no deseado).

- [x] **MailerSend para correos transaccionales (fixes #32):** Integración de MailerSend para el formulario de contacto y futuros correos transaccionales. Cliente reutilizable en `src/lib/email/mailersend.ts` (`sendTransactionalEmail`, `getContactFormToEmail`, `getDefaultFrom`). Formulario de contacto envía a veta.pro.pm@gmail.com vía MailerSend; Remitente configurable con `CONTACT_EMAIL_FROM` (dominio verificado en MailerSend). Variables de entorno: `MAILERSEND_API_KEY`, `CONTACT_EMAIL_TO`, `CONTACT_EMAIL_FROM`. Dependencia Resend eliminada. Tests en `contact/actions.test.ts` (validación, envío, errores, escape HTML).

- [x] **Vista Contacto – alineación visual con marketing:** Patrón hero (`hero-pattern-overlay`), gradiente, orbe blur y `noise-overlay` en el hero. Franja decorativa entre hero y métodos de contacto. Animaciones: `AnimatedSection` en hero, título del formulario y card; `StaggerContainer`/`StaggerItem` en las tarjetas de métodos. Cards con hover (`-translate-y-1`, `shadow-lg`, icono `group-hover:scale-110`). Tipografía y espaciado alineados con About/Pricing.
