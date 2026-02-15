# Análisis de Marketing, SEO y GEO – Vistas Públicas Veta

**Fecha:** 14 de febrero de 2025  
**Alcance:** Todas las vistas públicas (/, /about, /pricing, /contact, /legal, /auth, 404)

---

## 1. Resumen Ejecutivo

Las vistas públicas de Veta tienen una base sólida de contenido y estructura, pero presentan carencias importantes en SEO técnico, GEO (Generative Engine Optimization), impacto visual y conversión. La propuesta prioriza mejoras de alto impacto con esfuerzo controlado.

---

## 2. Análisis por Área

### 2.1 SEO (Search Engine Optimization)

| Aspecto                    | Estado actual | Observación                                                                                                         |
| -------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Meta title/description** | Parcial       | Root layout tiene metadata global. Falta metadata específica en Home. Algunas descripciones superan 160 caracteres. |
| **Open Graph**             | Incompleto    | Solo title, description, type, locale, siteName. Falta: `url`, `image`, `image:alt`, `image:width/height`.          |
| **Twitter Cards**          | Ausente       | No hay `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.                                     |
| **Canonical URLs**         | Ausente       | No se definen URLs canónicas por página.                                                                            |
| **Sitemap**                | Ausente       | No existe `sitemap.xml` o `sitemap.ts`.                                                                             |
| **robots.txt**             | Ausente       | No hay `robots.txt` ni `robots.ts`.                                                                                 |
| **Estructura Hn**          | Correcta      | H1 único por página, jerarquía coherente.                                                                           |
| **Semántica HTML**         | Correcta      | Uso de `<main>`, `<header>`, `<footer>`, `<section>`, `<article>`.                                                  |
| **Lang attribute**         | Correcto      | `lang="es"` en `<html>`.                                                                                            |
| **JSON-LD**                | Ausente       | No hay datos estructurados (Organization, SoftwareApplication, FAQ, etc.).                                          |

**Problemas específicos:**

- Home no exporta metadata propia → usa solo la del root.
- Descripciones largas (ej. About: 90 caracteres, OK; Contact: 58, corta).
- Middleware declara `/privacy` y `/terms` como rutas públicas pero no existen páginas (solo `/legal`).

---

### 2.2 GEO (Generative Engine Optimization)

Las IA y motores generativos (ChatGPT, Perplexity, Bing, etc.) priorizan:

- **Contenido estructurado** (JSON-LD, encabezados claros).
- **Respuestas directas** a preguntas frecuentes.
- **Contexto de marca** explícito (qué es, para quién, beneficios).

| Aspecto             | Estado          | Recomendación                                                                          |
| ------------------- | --------------- | -------------------------------------------------------------------------------------- |
| Schema.org          | Ausente         | Añadir Organization, SoftwareApplication, FAQPage.                                     |
| FAQ explícitas      | Solo en Pricing | Ampliar FAQ en Home y About para consultas tipo “cómo”, “qué es”, “para quién”.        |
| Resumen ejecutivo   | Implícito       | Añadir bloque tipo “Veta es… en una frase” en hero de Home.                            |
| Respuestas directas | Parciales       | Reformular subtítulos para que funcionen como respuestas a búsquedas conversacionales. |

---

### 2.3 Contenido y Copy

| Página      | Fortalezas                                                    | Debilidades                                                                                                                                                       |
| ----------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home**    | Propuesta de valor clara, CTAs visibles, beneficios concretos | Falta prueba social (testimonios, cifras, logos). Mensaje “30 días gratis” se repite; podría variar.                                                              |
| **About**   | Historia creíble, valores definidos                           | Texto genérico; sin fotos de equipo ni fundadores. “Nuestro Equipo” es un icono placeholder.                                                                      |
| **Pricing** | Planes claros, FAQ útil, CTA por plan                         | Límites del plan BASE podrían explicarse mejor. Falta comparativa “vs. hojas de cálculo” o “vs. herramientas genéricas”.                                          |
| **Contact** | Varios canales (email, chat, oficina)                         | **Formulario no funcional** (sin `onSubmit`). Email `hola@studiomanager.app` incoherente con marca Veta. “Chat en Vivo” y “Oficina” apuntan a `#` (placeholders). |
| **Legal**   | Contenido completo, RGPD, estructura clara                    | Sin fecha de última actualización por sección. Enlaces internos correctos.                                                                                        |
| **Auth**    | Flujo claro, selección de plan                                | OK para conversión.                                                                                                                                               |

**Inconsistencia crítica:** Contact usa `hola@studiomanager.app` en lugar de un email de dominio Veta.

---

### 2.4 Estética y UX

| Aspecto              | Estado           | Comentario                                                                                                                 |
| -------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Hero visual**      | Placeholder      | Gradiente + icono en lugar de screenshot real o ilustración. Bajo impacto emocional.                                       |
| **Imágenes**         | Placeholders     | “Vista previa del dashboard” y “Nuestro Equipo” son cajas con iconos. No hay fotos ni mockups.                             |
| **Navegación móvil** | Ausente          | `nav` con `hidden md:flex` → en móvil no hay menú de navegación. Solo logo y botones “Iniciar Sesión” / “Comenzar Gratis”. |
| **CTAs**             | Correctos        | Variedad de botones (primario/outline), enlaces a auth y contact.                                                          |
| **Tipografía**       | Correcta         | Montserrat, jerarquía legible.                                                                                             |
| **Tema**             | Dark por defecto | Adecuado para público creativo; alternativa clara disponible.                                                              |
| **Footer**           | Correcto         | Enlaces agrupados, legal accesible.                                                                                        |

---

### 2.5 Técnico y Rutas

- **Middleware:** `/privacy` y `/terms` están como públicas pero no hay páginas; conviene redirigir a `/legal` o crear redirects.
- **Footer:** “Términos y Privacidad” apunta correctamente a `/legal`.
- **404:** Diseño correcto; el enlace a Dashboard puede llevar a login si el usuario no está autenticado (comportamiento aceptable).

---

## 3. Propuesta de Cambios

### 3.1 Prioridad Alta (impacto inmediato)

| #   | Cambio                     | Esfuerzo | Descripción                                                                                       |
| --- | -------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| 1   | **Menú móvil**             | Medio    | Añadir Sheet/Burger para navegación en móvil en `(marketing)/layout.tsx`.                         |
| 2   | **Formulario de contacto** | Alto     | Conectar formulario a API/Server Action (ej. Resend, Supabase Edge Function). Validación con Zod. |
| 3   | **Email de contacto**      | Bajo     | Sustituir `hola@studiomanager.app` por email de dominio Veta o genérico (ej. `hola@veta.pro`).    |
| 4   | **Sitemap y robots**       | Bajo     | Crear `app/sitemap.ts` y `app/robots.ts` con rutas públicas.                                      |
| 5   | **Metadata por página**    | Medio    | Metadata específica en Home; revisar longitud de descripciones (≈155–160 caracteres).             |
| 6   | **Open Graph completo**    | Medio    | Añadir `url`, `image` (1200×630), `image:alt`; Twitter Cards.                                     |

### 3.2 Prioridad Media (SEO/GEO)

| #   | Cambio                          | Esfuerzo | Descripción                                                                              |
| --- | ------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| 7   | **JSON-LD**                     | Medio    | Organization, SoftwareApplication, FAQPage (Pricing).                                    |
| 8   | **Canonical URLs**              | Bajo     | `metadataBase` en root + `alternates.canonical` por página.                              |
| 9   | **FAQ en Home**                 | Bajo     | Bloque “Preguntas frecuentes” con 3–4 preguntas tipo “¿Qué es Veta?”, “¿Para quién es?”. |
| 10  | **Redirects /privacy y /terms** | Bajo     | Redirect 308 de `/privacy` y `/terms` a `/legal`.                                        |

### 3.3 Prioridad Baja (mejora progresiva)

| #   | Cambio              | Esfuerzo | Descripción                                                                                                        |
| --- | ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| 11  | **Imágenes reales** | Alto     | Screenshot del dashboard, ilustración hero, foto de equipo (About).                                                |
| 12  | **Prueba social**   | Alto     | Testimonios, “X diseñadores confían en Veta”, logos (cuando existan).                                              |
| 13  | **Chat y oficina**  | Medio    | Definir si hay chat real; si no, quitar o sustituir por “Próximamente”. Dirección real o quitar si no hay oficina. |
| 14  | **Fechas en Legal** | Bajo     | Fecha de última modificación por sección (Términos, Privacidad, RGPD).                                             |

---

## 4. Checklist de Implementación Sugerida

```markdown
## Fase 1 – Crítico (1–2 sprints)

- [x] Menú móvil en marketing layout
- [x] Formulario de contacto funcional
- [x] Email de contacto coherente con Veta
- [x] sitemap.ts y robots.ts
- [x] Metadata y Open Graph por página

## Fase 2 – SEO/GEO (1 sprint)

- [x] JSON-LD (Organization, SoftwareApplication, FAQPage)
- [x] Canonical URLs
- [x] FAQ en Home
- [x] Redirects /privacy, /terms → /legal

## Fase 3 – Contenido y branding (continuo)

- [ ] Imágenes reales (ver [Propuesta de imágenes](phase3-images-proposal.md))
- [x] Prueba social (testimonios FH Interiorismo, EM Estilo Creativo)
- [x] Revisión de placeholders (solo formulario + email en Contact)
- [x] Fechas en Legal
```

---

## 5. Métricas Recomendadas

Tras aplicar los cambios, medir:

- **SEO:** Posiciones para “software diseño interior”, “gestión proyectos diseño interior”, “Veta”.
- **Conversión:** Tasa de registro (auth) desde cada página pública.
- **Engagement:** Tiempo en página, scroll depth, clics en CTAs.
- **Técnico:** Core Web Vitals, indexación (Search Console), errores en formulario de contacto.

---

_Documento generado como análisis de marketing, SEO y GEO para las vistas públicas de Veta._
