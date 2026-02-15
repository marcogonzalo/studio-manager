# Propuesta de imágenes – Fase 3

Documento de referencia para sustituir placeholders por imágenes reales en las vistas públicas.

---

## 1. Hero – Home (`/`)

**Ubicación:** Sección hero, encima del titular y la descripción.

**Propuesta:**

- **Opción A:** Screenshot del dashboard de Veta (vista principal con proyectos o resumen). Transmitir “así es la app”.
- **Opción B:** Ilustración o mockup que muestre un flujo de trabajo (ej. persona con portátil + vista de presupuesto o espacios).
- **Formato:** WebP o JPG, relación ~16:9 o 3:2. Ancho recomendado 1200–1600 px para retina.
- **Ruta sugerida:** `public/img/hero-home.webp` (o `.jpg`).
- **Alt:** "Veta - Gestión de proyectos de diseño interior" o descripción breve del contenido.

**Nota:** Si se usa screenshot, evitar datos sensibles y usar proyecto/datos de ejemplo.

---

## 2. Vista previa del dashboard – Home (`/`)

**Ubicación:** Bloque “¿Por qué elegir Veta?”, caja a la derecha donde ahora hay icono + texto “Vista previa del dashboard”.

**Propuesta:**

- Screenshot real del dashboard (lista de proyectos, tarjetas KPI o vista de un proyecto).
- Mismo estilo que la app: tema claro u oscuro según el diseño de la página.
- **Formato:** WebP, relación 16:9 (aspect-video). Ancho ~800–1000 px.
- **Ruta sugerida:** `public/img/dashboard-preview.webp`.
- **Alt:** "Vista del dashboard de Veta".

---

## 3. Nuestro equipo – About (`/about`)

**Ubicación:** Bloque “Nuestra historia”, caja a la derecha con icono “Nuestro Equipo”.

**Propuesta:**

- **Opción A:** Foto de equipo o fundadores (recomendado para confianza).
- **Opción B:** Ilustración genérica de equipo (siluetas, avatares) si no se quieren fotos reales.
- **Formato:** Cuadrado o 4:3, mínimo 400×400 px. WebP o JPG.
- **Ruta sugerida:** `public/img/team.webp` o `public/img/about-hero.webp`.
- **Alt:** "Equipo de Veta" o descripción de la imagen.

---

## Resumen de archivos a crear

| Archivo                                      | Uso                    | Dimensiones orientativas |
| -------------------------------------------- | ---------------------- | ------------------------ |
| `public/img/hero-home.webp`                  | Hero Home              | 1200×675 o 1600×900      |
| `public/img/dashboard-preview.webp`          | Preview dashboard Home | 800×450 (16:9)           |
| `public/img/team.webp` (o `about-hero.webp`) | About – Nuestro equipo | 400×400 o 600×450        |

Cuando tengáis las imágenes, sustituir en el código los bloques con `FolderKanban`/gradiente (Home) y `Users`/gradiente (About) por `<Image>` de Next.js apuntando a estas rutas.
