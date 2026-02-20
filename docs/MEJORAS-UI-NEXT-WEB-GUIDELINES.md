# Mejoras propuestas: Veta (Frontend, Web Guidelines, Next.js)

Documento de mejoras basado en:

- **Frontend Design** (skill): estética distintiva, tipografía, color, motion, composición.
- **Web Interface Guidelines** (Vercel Labs): accesibilidad, UX, patrones.
- **Next.js Best Practices**: convenciones, RSC, imágenes, fuentes, errores.

---

## 1. Frontend Design (estética y diferenciación)

### 1.1 Tipografía

**Estado actual:** Una sola fuente (Montserrat) en `layout.tsx`. Funciona pero es muy común en productos SaaS.

**Mejoras:**

- **Pareja de fuentes:** Mantener Montserrat para cuerpo y añadir una **display** para títulos (hero, secciones marketing). Opciones que encajan con “diseño interior / profesional”: **DM Serif Display**, **Fraunces** o **Playfair Display** para headlines; Montserrat para body.
- **Variable en Tailwind:** Definir `--font-display` en el root y usarla en `globals.css` o en el theme de Tailwind para `font-display` (títulos) y `font-sans` (Montserrat).
- Evitar añadir fuentes genéricas (Inter, Roboto, Arial); la combinación display + sans actual ya da personalidad si se refina.

**Ejemplo (layout.tsx):**

```tsx
import { Montserrat, Playfair_Display } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// <html className={`${montserrat.variable} ${playfair.variable}`}>
```

Y en CSS/Tailwind: usar `var(--font-display)` para h1/h2 en marketing.

---

### 1.2 Color y tema

**Estado actual:** Paleta sage/crema coherente con variables OKLCH; light/dark bien definidos. Buena base.

**Mejoras:**

- **Un acento más fuerte:** Un segundo color de acento (p.ej. terracota/chart-2) para CTAs secundarios o estados “destacado” en cards, para no depender solo del verde.
- **Profundidad en fondos:** En hero y CTAs, añadir textura sutil (noise/grain) o gradientes mesh más marcados para dar sensación “diseño interior” y evitar fondos planos.
- **Dark por defecto:** Ya está (`defaultTheme="dark"`); mantener y asegurar que todos los componentes respeten el tema.

---

### 1.3 Motion y microinteracciones

**Estado actual:** AnimatedSection, StaggerContainer, AnimatedCounter, `animate-glow`, `animate-float`; Framer Motion en ProductMockup. Buen nivel.

**Mejoras:**

- **Scroll-reveal consistente:** Revisar que todas las secciones de la home usen `AnimatedSection`/`StaggerContainer` con `triggerOnMount={false}` para evitar animaciones al cargar y activar solo al scroll.
- **Un “momento hero” claro:** En el hero, una sola animación coordinada (por ejemplo: badge → título → subtítulo → CTAs) con delays crecientes, sin saturar.
- **Hover en cards:** Ya hay `hover:-translate-y-1` y `hover:shadow-lg`; opcional: transición de borde o de color de icono (p. ej. de muted a primary) para feedback más claro.
- **Reducir movimiento en preferencia:** Respetar `prefers-reduced-motion` desactivando o simplificando animaciones (por ejemplo en `AnimatedSection` y `ProductMockup`).

---

### 1.4 Composición y layout

**Estado actual:** Grids simétricos, container 7xl, secciones claras.

**Mejoras:**

- **Romper la cuadrícula en una sección:** Por ejemplo en testimonios o beneficios: una card más grande o con offset, o un bloque de cita que salga del grid para dar ritmo editorial.
- **Espacio en blanco:** En marketing, aumentar padding vertical en 1–2 secciones (p. ej. entre Features y Benefits) para respirar.
- **Footer:** Ya tiene estructura; opcional: una línea decorativa (línea en color primary/muted) o pequeño detalle geométrico alineado con la identidad.

---

### 1.5 Fondos y atmósfera

**Estado actual:** Gradientes suaves (`from-primary/5`, `blur-3xl` orbs) en hero y CTAs.

**Mejoras:**

- **Textura sutil:** Capa de ruido/grain con `opacity` baja (p. ej. 3–5%) sobre hero o CTAs para dar tacto y evitar “flat”.
- **Patrón geométrico opcional:** En una franja (p. ej. encima del footer) un patrón muy sutil (líneas, grid o formas) que recuerde planos/arquitectura.
- Mantener coherencia: todo en la misma familia (soft, profesional) sin mezclar estilos.

---

## 2. Web Interface Guidelines (accesibilidad y UX)

_(Nota: las guidelines de Vercel Labs no se pudieron cargar por timeout; las siguientes se basan en buenas prácticas estándar de WAI y UX.)_

### 2.1 Accesibilidad (A11y)

- **Enfoque visible:** Revisar que todos los controles (botones, enlaces, inputs) tengan `:focus-visible` claro (p. ej. `outline-ring/50` ya en base; comprobar contraste).
- **Contraste:** Los tokens `muted-foreground` están ajustados para WCAG AA; revisar cualquier texto nuevo sobre `primary/10` o fondos claros.
- **Encabezados:** Mantener orden lógico (h1 → h2 → h3). En home hay un único h1; en app (dashboard) asegurar h1 por página.
- **Landmarks:** `main` con `id="main-content"` ya está en marketing y app; mantener y evitar múltiples `main`.
- **Navegación móvil:** El Sheet del menú tiene `SheetTitle` en `sr-only`; correcto. Comprobar que “Abrir menú” / “Cerrar menú” tengan `aria-label` o texto accesible.

### 2.2 Formularios

- **Labels:** Formularios con react-hook-form + FormLabel; asegurar que cada input tenga label asociado (por id o aria-label).
- **Errores:** Mostrar mensajes de error cerca del campo y asociarlos con `aria-describedby` cuando haya error.
- **Auth:** En la página de auth, el estado “Revisa tu correo” está claro; el botón “Reenviar enlace” debería indicar estado loading (ya tiene `disabled={loading}`).

### 2.3 Navegación y wayfinding

- **Skip link:** Omitido (en una prueba previa el botón se superponía al navbar).
- **Breadcrumbs:** No añadidos. El contexto ya lo dan la barra lateral (enlace activo «Proyectos»), el h1 con el nombre del proyecto y las pestañas (Resumen, Espacios, Presupuesto, etc.).

### 2.4 Feedback y estado

- **Loading:** Hay skeletons en dashboard y loaders en rutas; mantener patrón consistente (Skeleton vs “Cargando...”).
- **Toasts:** Sonner está integrado; asegurar que los mensajes sean breves y que las notificaciones críticas no dependan solo de color (icono + texto).

---

## 3. Next.js Best Practices

### 3.1 Convenciones de archivos y rutas

- **Estructura:** App Router con (marketing), (app), auth; correcto.
- **Loading:** Existen `loading.tsx` en dashboard, projects, catalog, etc.; bien. Revisar que todas las rutas que hacen fetch tengan loading o Suspense donde aplique.

### 3.2 Metadata y OG

- **Root:** `metadataBase`, `title`, `description`, `openGraph`, `twitter` están definidos en `layout.tsx`.
- **Por ruta:** Home y otras páginas definen `metadata`; mantener y extender a todas las rutas públicas (about, contact, pricing, legal).
- **OG image:** Hay `opengraph-image.tsx`; según metadata está en `/opengraph-image`; correcto.

### 3.3 Imágenes

- **next/image:** Ya se usa en catalog, dialogs, product-detail-modal, veta-logo, etc. No hay `<img>` crudo; bien.
- **Revisar:** En componentes que usan imágenes remotas (Supabase Storage), comprobar que el host esté en `next.config` (`images.remotePatterns`).
- **LCP:** Para hero o imagen principal de marketing, si se añade una imagen real (no solo mockup), usar `priority` y `sizes` adecuados.

### 3.4 Fuentes

- **next/font:** Montserrat cargado en root con `variable` y `display: "swap"`; correcto.
- **Una sola instancia:** La fuente se importa solo en `layout.tsx`; no duplicar en otros archivos.
- Si se añade display font (ver 1.1), cargarla también desde el layout con `variable` y usarla vía CSS.

### 3.5 Manejo de errores

- **not-found:** Existe `app/not-found.tsx` (404 personalizado); bien.
- **error.tsx:** No existe. Añadir `app/error.tsx` (y opcionalmente `app/(app)/error.tsx`, `app/(marketing)/error.tsx`) para capturar errores en el árbol y mostrar UI con “Reintentar”.
- **global-error.tsx:** No existe. Añadir `app/global-error.tsx` con `<html>` y `<body>` para errores en root layout (según documentación Next).

**Ejemplo mínimo `app/error.tsx`:**

```tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-lg font-semibold">Algo ha fallado</h2>
      <p className="text-muted-foreground text-sm">{error.message}</p>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}
```

### 3.5.1 Otras vistas de error (propuestas)

- **`app/error.tsx`** (error en una ruta): Misma línea visual que 404: fondo con `not-found-pattern`, franja decorativa, card centrada con título “Algo ha fallado”, mensaje, botón “Reintentar”. Client component con `error`, `reset`; opcionalmente reutilizar estilos o un layout compartido con `not-found`.
- **`app/global-error.tsx`** (error en root layout): Debe incluir `<html>` y `<body>` propios. Mantener tono Veta (card, primary, copy breve) y enlace “Ir al inicio” para recuperar la sesión cuando el fallo sea de layout/Shell.

### 3.6 Suspense y client hooks

- **useSearchParams:** La página `auth` usa `useSearchParams` dentro de `AuthContent` y está envuelta en `<Suspense>` en el export default; correcto.
- **usePathname:** En `AppLayoutClient` se usa `usePathname()`; la ruta es dinámica bajo `(app)`. Según best practices, en rutas dinámicas conviene Suspense si hay riesgo de CSR bailout. Si el layout app es siempre client-rendered por el auth check, puede ser aceptable; si se quiere estático parcial, valorar envolver la parte que use `usePathname` en Suspense.

### 3.7 RSC y datos

- **App layout:** El layout `(app)` es async y hace `getUser()` en servidor; redirige si no hay usuario. Patrón correcto.
- **Dashboard:** La página dashboard es client y hace fetch en `useEffect`; para una futura optimización se podría pasar datos iniciales desde un Server Component padre o usar RSC para el primer paint y client para actualizaciones.

### 3.8 Redirects y notFound

- En Server Actions que usen `redirect()` o `notFound()`, no envolver esas llamadas en try/catch (o re-lanzar con `unstable_rethrow`) para no tragar el “throw” de Next.

---

## 4. Resumen de acciones prioritarias

| Prioridad | Área     | Acción                                                                  |
| --------- | -------- | ----------------------------------------------------------------------- |
| Alta      | Next.js  | Añadir `app/error.tsx` y `app/global-error.tsx`.                        |
| —         | A11y     | Skip link omitido (superposición con navbar en prueba previa).          |
| Media     | Frontend | Introducir segunda fuente (display) para títulos y usarla en marketing. |
| Media     | Frontend | Respetar `prefers-reduced-motion` en animaciones.                       |
| Media     | Next.js  | Comprobar `images.remotePatterns` para dominios de imágenes (Supabase). |
| Baja      | Frontend | Añadir textura sutil (grain) en hero o CTAs.                            |
| Baja      | Frontend | Una sección con layout asimétrico (testimonios o beneficios).           |
| Baja      | UX       | Breadcrumbs en rutas profundas de la app (ej. proyecto por id).         |

---

## 5. No cambiar (está bien resuelto)

- Uso de `next/image` en todos los usos de imagen revisados.
- Fuente cargada una sola vez en root con variable.
- Tema light/dark con variables OKLCH y contraste revisado.
- Metadata y OG en root y en home.
- not-found personalizado.
- Auth con Suspense para useSearchParams.
- Estructura de layouts (marketing vs app) y `main` con id.
- Skeleton y estados de carga en dashboard y listados.

Este documento se puede usar como backlog para implementar las mejoras por fases (primero errores y a11y, después tipografía y motion, por último refinamientos visuales).
