---
version: alpha
name: Veta
description: Plataforma de gestión de proyectos de diseño interior para estudios y profesionales freelance.
colors:
  # --- Light mode (normative) ---
  primary: "#759b6d"
  primary-foreground: "#faf9f1"
  secondary: "#f1ebd5"
  secondary-foreground: "#111006"
  accent: "#d7ecd3"
  accent-foreground: "#0f0d04"
  background: "#faf9f1"
  foreground: "#111006"
  muted: "#f4f2e7"
  muted-foreground: "#111006"
  card: "#f7f5ec"
  card-foreground: "#111006"
  border: "#dad8c9"
  input: "#dad8c9"
  ring: "#759b6d"
  destructive: "#ca5551"
  destructive-foreground: "#f8f8f8"
  brand-golden: "#c3aa88"
  brand-golden-foreground: "#0a0501"
  brand-cream: "#e2dac9"
  brand-cream-foreground: "#0f0a03"
  sidebar: "#f5f2e3"
  sidebar-accent: "#ece9d2"
  sidebar-border: "#dad8c9"
  # --- Dark mode variants ---
  background-dark: "#150e06"
  foreground-dark: "#faf8f3"
  card-dark: "#161108"
  muted-dark: "#161108"
  secondary-dark: "#4e3800"
  secondary-foreground-dark: "#faf8f3"
  accent-dark: "#140e04"
  border-dark: "#312a20"
  destructive-dark: "#b32517"
  brand-golden-dark: "#ceb38d"
  sidebar-dark: "#100a04"
  sidebar-accent-dark: "#161107"
  sidebar-border-dark: "#2c251c"
typography:
  display:
    fontFamily: Montserrat
    fontSize: 3.75rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.03em
  h1:
    fontFamily: Montserrat
    fontSize: 3rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  h2:
    fontFamily: Montserrat
    fontSize: 2.25rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  h3:
    fontFamily: Montserrat
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.3
  body-lg:
    fontFamily: Montserrat
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.7
  body-md:
    fontFamily: Montserrat
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Montserrat
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: Montserrat
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1
  label-sm:
    fontFamily: Montserrat
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.05em
  logo:
    fontFamily: Montserrat
    fontSize: 1rem
    fontWeight: 300
    lineHeight: 1
rounded:
  sm: 8px
  md: 10px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 64px
  gutter: 24px
  margin: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "#618658"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.md}"
    padding: 12px
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 12px
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    rounded: "{rounded.md}"
    padding: 12px
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.lg}"
    padding: 24px
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 12px
  input-focus:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 12px
  sidebar-item:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: 8px
  sidebar-item-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.sm}"
    padding: 8px
  badge-default:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.full}"
    padding: 4px
  badge-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    padding: 4px
  badge-golden:
    backgroundColor: "{colors.brand-golden}"
    textColor: "{colors.brand-golden-foreground}"
    rounded: "{rounded.full}"
    padding: 4px
---

## Overview

Veta está construida para diseñadores de interiores y estudios de arquitectura: profesionales que viven rodeados de texturas, materiales y paletas cuidadosamente elegidas. La interfaz refleja ese mundo — tierra, sage y cremas cálidas — sin caer en lo decorativo a expensas de la funcionalidad.

El lenguaje visual equilibra **calidez profesional** y **claridad operativa**. No es corporativo ni frío; tampoco es un moodboard. Es una herramienta que los diseñadores pueden abrir cada mañana y que se siente coherente con el tipo de trabajo que hacen.

El modo oscuro es primario: fondos en marrones cacao cálidos (no grises neutros) mantienen la identidad de marca en cualquier condición de luz. El modo claro usa cremas y beiges suaves como base, con Soft Sage como único color de acción.

## Colors

La paleta está construida alrededor de una sola familia de verdes sage y una escala de neutros cálidos, con dos acentos de marca decorativos.

- **Primary — Soft Sage (`#759b6d`):** El verde de la salvia suave es el único color de acción en toda la interfaz. Se reserva exclusivamente para botones primarios, enlaces activos, anillos de foco y estados seleccionados. Su calidez vegetal conecta con el material natural que los diseñadores de interiores trabajan a diario.

- **Secondary — Sand Beige (`#f1ebd5` / dark `#4e3800`):** Superficies secundarias, fondos de chips y botones de nivel 2. En luz, una arena suave; en oscuro, un marrón profundo y terroso.

- **Accent — Sage Tint (`#d7ecd3`):** Versión muy diluida del primary. Hover sobre ítems de lista, fondos de filas seleccionadas, highlights de baja intensidad.

- **Background / Card / Muted:** Escala de cremas cálidas en modo luz (`#faf9f1` → `#f7f5ec` → `#f4f2e7`). En oscuro, escala de marrones cacao (`#150e06` → `#161108`). La diferencia entre pasos es deliberadamente sutil — la profundidad se lee por acumulación.

- **Brand Golden (`#c3aa88`):** Acento secundario del logotipo. Usar únicamente en contextos decorativos: logo, badges premium, highlights de marketing. No es un color interactivo.

- **Brand Cream (`#e2dac9`):** Tercer acento de marca, presente en gradientes de secciones hero en marketing. Nunca en componentes de UI funcional.

- **Destructive (`#ca5551` / dark `#b32517`):** Rojo tierra para errores, confirmaciones de borrado y estados de alerta. Su temperatura cálida lo mantiene dentro de la familia cromática.

Todos los pares texto/fondo cumplen WCAG AA (4.5:1) en ambos modos. El primary sobre primary-foreground y el destructive sobre su foreground son los únicos pares que requieren verificación cuidadosa al cambiar los tokens.

## Typography

Veta usa **Montserrat** en toda la interfaz, cargada vía `next/font/google` con todos los pesos del subconjunto latin. Su geometría clara y su carácter moderno-humanista se adaptan tanto a los titulares expansivos del marketing como a la densidad informativa de la app de gestión.

- **Display / H1 (700, −0.03em / −0.02em):** Titulares de marketing y páginas de planes. La tracking negativa los comprime visualmente para mayor impacto a tamaños grandes.
- **H2 / H3 (600):** Encabezados de sección dentro de la app y en páginas públicas.
- **Body-lg / Body-md / Body-sm (400):** Contenido principal. `body-md` (1rem, 1.6) es el nivel base de la app. `body-lg` para intros y descripciones en marketing.
- **Label-md / Label-sm (500):** Etiquetas de formulario, metadatos, columnas de tabla. `label-sm` lleva tracking positivo (0.05em) para mejorar la legibilidad a tamaños pequeños.
- **Logo (300):** El logotipo usa Montserrat en su peso más ligero, lo que le da distinción frente al resto del texto de la interfaz.

## Layout

Sistema de grid de **8px** como unidad base. El espaciado de la interfaz opera en múltiplos: 4px para micro-ajustes, 8px para gaps internos, 16px para separaciones entre elementos, 24px para padding de cards y secciones, 32px para márgenes de columna, 64px para separaciones entre secciones en marketing.

**App (`/veta-app`):** Layout de sidebar fija + área de contenido. El sidebar tiene su propio escalón de color (`sidebar`), ligeramente distinto del fondo, para delimitar el espacio sin bordes duros. El contenido se organiza en cards con padding interno de 24px.

**Marketing (`/(marketing)`):** Columnas centradas con `max-width: 1200px`. Secciones con separación generosa (64px+). Diseño mobile-first: una columna en móvil, hasta tres en desktop.

**Responsive:** Breakpoints de Tailwind (`sm`, `md`, `lg`, `xl`). El patrón más común en la app es `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` para listas de proyectos y clientes.

## Elevation & Depth

La profundidad se construye por **capas tonales**, no por sombras pesadas.

En modo luz, la jerarquía de superficies de fondo a primer plano es:
`background (#faf9f1)` → `card (#f7f5ec)` → `muted (#f4f2e7)` → `secondary (#f1ebd5)`

En modo oscuro, la jerarquía equivalente es:
`sidebar (#100a04)` → `background (#150e06)` → `card/muted (#161108)` → `secondary (#4e3800)`

Las **sombras de modo oscuro están invertidas**: en lugar de sombra oscura, una luz sutil desde arriba (blanca con opacidad baja). Las utilidades `.dark .shadow-*` en `globals.css` implementan este comportamiento para todas las escalas de sombra de Tailwind.

Popovers, dropdowns y diálogos usan `card` como fondo, separándose del contexto sin necesitar border forzado.

## Shapes

**Radio base: 12px** (`--radius: 0.75rem`). Toda la interfaz usa esta escala:

- `rounded.sm` (8px): elementos muy pequeños, chips internos, iconos con fondo.
- `rounded.md` (10px): botones, inputs, selects, tooltips.
- `rounded.lg` (12px): cards de proyectos, clientes y presupuestos; dialogs; modales.
- `rounded.xl` (16px): elementos destacados, contenedores de sección en marketing, imágenes hero.
- `rounded.full` (9999px): badges, avatares, pills de estado, indicadores.

No hay esquinas rectas (0px) en ningún componente de la interfaz. La consistencia del radio comunica cohesión y cuidado en el detalle — coherente con el perfil del usuario.

## Components

**Botones:**

- `button-primary`: Soft Sage sólido. Único botón de acción principal por pantalla. Hover oscurece ~7% de luminosidad.
- `button-secondary`: Fondo Sand Beige, texto oscuro. Para acciones de nivel 2 o complementarias.
- `button-ghost`: Sin fondo. Para acciones de baja prominencia: cancelar, ver más, iconos de acción en tabla.
- `button-destructive`: Rojo tierra. Solo para confirmaciones de borrado y acciones irreversibles.

**Cards:** Fondo `card`, radio `lg`, padding 24px. Variantes: card de proyecto (con imagen de portada), card de cliente, card de resumen de presupuesto.

**Inputs y formularios:** Fondo `background`, borde `border`, radio `md`. Estados: default → focus (ring `primary`) → error (ring/borde `destructive`). Etiquetas en `label-md`.

**Badges:** Tres variantes principales — default (beige, para estado neutro), primary (sage, para estado activo/aprobado), golden (dorado, para plan premium o destacado).

**Sidebar:** Fondo `sidebar` (un escalón más oscuro que `background`), ítems con `accent` en hover, ítem activo con fondo `sidebar-accent` y texto `primary`. Sin border lateral visible — la diferencia tonal es suficiente.

## Do's and Don'ts

### Do

- Usar `primary` exclusivamente para la acción más importante por pantalla
- Mantener contraste WCAG AA (4.5:1) para todo texto sobre superficies
- Proveer siempre variante clara y oscura al añadir nuevas superficies
- Usar la escala tonal para expresar elevación (background → card → muted → secondary)
- Aplicar `rounded.lg` en cards y diálogos, `rounded.md` en botones e inputs

### Don't

- No usar oklch como valor de token en YAML — siempre convertir a hex sRGB
- No usar más de dos pesos tipográficos en una misma pantalla
- No usar colores literales para superficies — siempre tokens semánticos (`bg-card`, `bg-muted`)
- No mezclar esquinas rectas (0px) con esquinas redondeadas en la misma vista
- No usar `brand-golden` en elementos interactivos — es exclusivamente decorativo
- No usar el primary en más de un componente prominente por pantalla (riesgo de dilución)
