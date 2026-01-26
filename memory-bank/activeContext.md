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

## Work in Progress / Next Steps

- **Image Uploads:** Currently, the app accepts image URLs. Integrating real file uploads to Supabase Storage bucket is the next logical step.
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
