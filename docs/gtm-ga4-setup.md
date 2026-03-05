# Google Tag Manager (GTM) y Google Analytics 4 en vistas públicas

Implementación de GTM en las rutas de marketing (`/`, `/pricing`, `/about`, `/contact`, `/legal`, páginas de planes) con dataLayer preparado para GA4 y seguimiento del funnel de conversión.

## 1. Variable de entorno

En tu entorno (`.env.local`, Vercel, etc.) define:

```bash
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

Sustituye `GTM-XXXXXXX` por el ID de tu contenedor de Google Tag Manager (Admin → Contenedor → ID del contenedor). Si no se define, el snippet de GTM no se inyecta y las llamadas a `pushToDataLayer` no tienen efecto.

## 2. Dónde está implementado

- **Snippet GTM:** `src/components/gtm/gtm-script.tsx` — inyecta el script y el iframe noscript. Solo se renderiza si existe `NEXT_PUBLIC_GTM_ID`.
- **Layouts:** El snippet y `page_view` se usan en:
  - `src/app/(marketing)/layout.tsx` — vistas públicas (/, /pricing, /about, etc.).
  - `src/app/(auth)/layout.tsx` — vistas de auth (/sign-in, /sign-up).
- **Helpers y tipos:** `src/lib/gtm.ts` — `pushToDataLayer`, `pushPageView`, `pushSelectPlan`, `pushCtaClick`, `pushViewPricing`, `pushContact`, `pushSignUp`, `pushLogin` y tipos del dataLayer.
- **Page view:** `src/components/gtm/gtm-page-view.tsx` — envía un `page_view` en cada cambio de ruta dentro del mismo layout.

## 3. Eventos del dataLayer (funnel y engagement)

| Evento           | Cuándo se envía                                                                                                                                                   | Uso en GA4 / GTM                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `page_view`      | Cada vista de página (cambio de ruta en marketing).                                                                                                               | Configurar etiqueta GA4 “Configuración” y evento de tipo “Vista de página” o usar el evento en GTM para disparar GA4. |
| `view_pricing`   | Al cargar la página de precios (`/pricing`).                                                                                                                      | Interés en precios; funnel.                                                                                           |
| `select_plan`    | Al hacer clic en el CTA de un plan (Base/Pro/Studio) en `/pricing`. Incluye `plan_code`, `billing_period`, `plan_name`, `cta_text`.                               | Inicio de checkout; conversión por plan.                                                                              |
| `begin_checkout` | Se envía junto con `select_plan` (mismo clic). Incluye `plan_code`, `billing_period`, `currency`.                                                                 | Evento estándar GA4 para inicio de checkout.                                                                          |
| `cta_click`      | Clic en CTAs principales: header (Iniciar sesión, Comenzar gratis), hero, beneficios, bloques CTA finales. Incluye `cta_location`, `cta_text`, `destination_url`. | User journey; ver qué CTAs generan más tráfico hacia auth/pricing.                                                    |
| `contact`        | Envío correcto del formulario de contacto (`/contact`).                                                                                                           | Lead; conversión.                                                                                                     |
| `sign_up`        | Usuario envía el formulario de registro y recibe magic link (`/sign-up`). Parámetros: `method`, `plan_code` (opcional).                                           | Conversión registro.                                                                                                  |
| `login`          | Usuario solicita enlace de inicio de sesión (`/sign-in`). Parámetro: `method`.                                                                                    | Engagement; inicio de sesión.                                                                                         |
| `demo_access`    | Usuario completa el acceso a la demo (entra tras hacer clic en el magic link de demo). Se envía en `/auth/complete` cuando la URL incluye `?demo=1`.              | Conversión; usuario que realmente entró a la demo.                                                                    |

Nombres de evento y parámetros están pensados para usarse tanto en GA4 (eventos estándar y personalizados) como en disparadores y variables de GTM.

## 4. Configuración recomendada en GTM

1. **Etiqueta GA4: Configuración**
   - Tipo: Google Analytics: GA4 Configuration.
   - ID de medición: tu ID de GA4 (p. ej. `G-XXXXXXXXXX`).
   - Disparador: “All Pages” o un disparador que se active en las rutas de marketing (por URL o por evento `page_view`).

2. **Etiquetas GA4: Eventos**
   - Crear una etiqueta GA4 de tipo “Evento” por cada evento que quieras enviar a GA4:
     - Evento: `page_view` (o el nombre que use tu configuración para vistas de página).
     - Eventos personalizados: `view_pricing`, `select_plan`, `begin_checkout`, `cta_click`, `contact`.
   - Disparador: “Evento personalizado” con nombre de evento igual al del dataLayer (p. ej. `select_plan`, `cta_click`).

3. **Variables en GTM**
   - Crear variables de capa de datos (Data Layer Variable) para los parámetros que quieras usar en informes o disparadores: `plan_code`, `billing_period`, `cta_location`, `cta_text`, `page_path`, `page_title`, etc.

4. **Conversiones en GA4**
   - En GA4: Administración → Eventos → marcar como conversión: `sign_up`, `begin_checkout`, `contact` (y otros que definas).

## 5. Rutas de auth (`/sign-in`, `/sign-up`)

El layout `(auth)` incluye GTM (mismo snippet y `GtmPageView`). Se envían:

- **page_view** en cada vista de `/sign-in` y `/sign-up`.
- **sign_up** cuando el usuario envía el formulario de registro y se envía correctamente el magic link (parámetros: `method: 'magic_link'`, `plan_code` si viene por URL).
- **login** cuando el usuario envía el formulario de inicio de sesión y se envía correctamente el magic link (`method: 'magic_link'`).

## 6. Funnel demo (`/demo`)

La **vista de la página demo** ya queda cubierta por el `page_view` estándar (el layout de marketing envía `page_view` en cada ruta). En GTM/GA4 puedes identificar visitas a la demo con un disparador de tipo “Vista de página” donde `page_path` (o la URL) contenga `/demo`.

Eventos específicos del funnel demo:

1. **generate_lead** — cuando el usuario envía el correo en el formulario de demo y la API responde OK (solicitud de enlace). Se envía con `lead_source: "demo_request"` para identificar el origen en GA4.
2. **demo_access** — cuando el usuario llega a `/auth/complete?demo=1` y la sesión se establece correctamente (acceso efectivo a la demo tras el magic link).

**Qué registrar en GTM:**

- **Vista a /demo:** usar el `page_view` existente; en GA4 o en un disparador, filtrar por `page_path` = `/demo` (o variable de página que contenga “/demo”).
- **Disparadores** de tipo “Evento personalizado” con estos nombres de evento:
  - `generate_lead` (para solicitud de demo: condición en variable de capa de datos `lead_source` = `demo_request` si quieres una etiqueta solo para demo).
  - `demo_access`
- **Etiquetas GA4 de evento** que se activen con esos disparadores.
- **Variables de capa de datos** si necesitas: `page_path`, `page_location`, `lead_source`.
- En **GA4**, marcar como conversión (opcional): `generate_lead` (filtrar por `lead_source` = `demo_request`) y/o `demo_access` para el funnel demo (vista /demo por page_view → solicitud → acceso).

## 7. Referencias

- [Guía para desarrolladores - API de Google Tag Manager (Tag Platform)](https://developers.google.com/tag-platform/tag-manager/api/v2/devguide?hl=es-419)
- [Eventos recomendados de GA4](https://support.google.com/analytics/answer/9267738)
- [GTM: uso de la capa de datos](https://developers.google.com/tag-platform/tag-manager/web/datalayer)
