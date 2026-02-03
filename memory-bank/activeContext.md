# Active Context

## Current Status

The project is in **Phase 1 (MVP Complete)**. The core functionality requested has been implemented and is operational locally.

## Recently Completed

1. **Environment Setup:** Next.js 16 + React + TS, Docker, Supabase Local.
2. **Authentication:** Login/Signup with Supabase Auth.
3. **Data Modules:**
    - Clients CRUD.
    - Suppliers CRUD.
    - Catalog (Products) CRUD with reference URLs.
    - Projects CRUD with address field.
4. **Project Detail Features:**
    - Space management with visual product grid.
    - Render/Image gallery per space.
    - **Budgeting:** Adding items, calculating markups/totals, editing items.
    - **Additional Costs:** Cost tracking by type (shipping, installation, etc.).
    - **Purchasing:** Manageable purchase orders with item selection.
    - **Documents:** Uploading/linking files.
    - **Notes:** Project diary with archive functionality.
5. **UI/UX:**
    - Implemented "Natural/Pastel" theme (Sage/Beige).
    - **Dashboard:** Real-time statistics including active projects, clients, expenses, and income (with placeholder for payment control).
    - Visual product selection with product detail modal.
    - Product image modals for detailed views.
    - Fixed circular dependency build errors.
6. **PDF Generation:**
    - Advanced PDF generation using `@react-pdf/renderer`.
    - Professional budget PDFs with grouped items by space, additional costs, and proper formatting.

## Recently Completed (Latest Session)

1. **Next.js Migration Complete:** 
   - Migrada toda la aplicación de Vite/React a Next.js 16.1.4 con App Router.
   - Implementación de route groups: `(marketing)` para páginas públicas SEO-optimizadas y `(app)` para aplicación autenticada.
   - Supabase SSR con `@supabase/ssr` para autenticación PKCE y magic links funcionando correctamente.
   - Middleware para protección de rutas y gestión de sesiones.
   - Docker configurado con `extra_hosts: localhost:host-gateway` para conectividad.
   - Turbopack como bundler con aliases para `@react-pdf/renderer`.
   - Build de producción exitoso.
   - Todas las funcionalidades probadas y operativas.

## Recently Completed (This Session)

1. **Product Image Upload (Backblaze B2):**
   - Integración con Backblaze B2 para almacenar imágenes de productos.
   - Formulario con pestañas: URL (por defecto) o Subir archivo (drag & drop).
   - Compresión Sharp: redimensionado 1200px máximo, WebP calidad 100.
   - Validación JPG, PNG, WebP. Ruta: `<userId>/<productId>.ext`.
   - Al eliminar producto del catálogo se borra la imagen en B2.
   - Al cambiar URL al guardar se elimina la imagen previa en B2.
   - Disponible en catálogo y en add-item-dialog (nuevo producto desde presupuesto).
   - API keys en servidor (no expuestas en frontend).
2. **Legal Page & Terms Acceptance:**
   - Nueva vista `/legal` con términos de uso, política de privacidad y derechos RGPD.
   - Checkbox obligatorio en registro con enlace a términos.
   - Footer actualizado con enlace único "Términos y Privacidad".
2. **Profile Schema Simplification:**
   - Eliminados `first_name` y `last_name` de `profiles`; se usa solo `full_name`.
   - Migración que copia datos existentes y elimina columnas redundantes.
   - Vista de cuenta (Mi perfil) actualizada a un único campo "Nombre completo".

## Work in Progress / Next Steps

- **Payment Control System:** System to track client payments with dates, amounts, and payment methods. Will feed into Dashboard income metrics.
- **Deployment:** The app is running locally. Deployment to Vercel/Netlify + Supabase Cloud is pending.

## Active Decisions

- **Framework:** Migrated to Next.js 16 for SEO capabilities on public pages while maintaining SPA functionality for authenticated app.
- **Database:** Using Supabase local instance for development. Production will use Supabase Cloud.
- **Docker Networking:** Using `localhost:host-gateway` in Docker to enable container-to-host Supabase connectivity.
- **Types:** All shared interfaces in `src/types/index.ts`.
- **Route Structure:** 
  - `(marketing)` route group for public, SEO-optimized pages (home, about, pricing, contact).
  - `(app)` route group for authenticated application.
  - Future: `(share)` for non-SEO client project sharing.
