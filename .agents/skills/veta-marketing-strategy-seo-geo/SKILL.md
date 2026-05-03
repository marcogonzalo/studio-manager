---
name: veta-marketing-strategy-seo-geo
description: >-
  Genera y revisa contenido de marketing con enfoque estratégico SEO y GEO (motores generativos y
  visibilidad citada), alineado a buyer personas y al producto Veta. Usar para blog, páginas
  públicas, copy in-app/emails privados, guías y piezas que deban posicionar o ser reutilizadas por
  IA en búsqueda.
---

# Veta: estrategia de contenido — SEO, GEO y buyer personas

## Cuándo usar

- **Blog:** artículos, guías, casos de uso, glosario sectorial.
- **Contenido público:** landings, FAQs ampliadas, recursos descargables, copy de ampliación más allá del checklist i18n.
- **Contenido privado o semi-privado:** textos en la app autenticada (onboarding, empty states, ayuda contextual, emails transaccionales, notas de producto internas que acaban en Help Center).
- El usuario pide “SEO”, “posicionamiento”, “contenido para ChatGPT/perplexity”, “GEO”, “pensado para Elena/Javi/Beatriz”, o alinear copy con **buyer personas**.

## Fuentes de verdad en el repo

- **Buyer personas:** `memory-bank/buyerPersona.md` — decisor principal **Elena** (propietaria de estudio); facilitadores **Javi** (obra / PM) y **Beatriz** (ops / administración). Toda pieza debe decidir **persona primaria** y, si aplica, **secundaria** (sin mezclar voces en el mismo bloque sin intención).
- **Marca, keywords y landings de planes:** `memory-bank/productContext.md` (hero, trial 30 días, palabras clave, rutas de planes).
- **Implementación técnica ES+EN en web pública:** skill **`veta-marketing-i18n-content`** y **`veta-multilanguage-views`** (metadata, sitemap, pathnames). Esta skill define **qué decir** y **para quién**; aquellas, **cómo publicarlo** sin romper URLs ni SEO técnico.

## SEO (clásico)

1. **Intención de búsqueda:** mapear cada pieza a intención (informacional, comparativa, transaccional suave). Priorizar consultas que conecten con dolores del persona (caos de proyectos, presupuesto vs obra, facturas/proveedores, rentabilidad del estudio).
2. **Keywords:** integrar de forma natural las de `productContext.md` (gestión de proyectos, diseño interior, interiorismo, presupuestos, arquitectura de diseño interior) y variaciones long-tail por persona (ej. obra / PM vs “gestión financiera estudio”).
3. **Jerarquía:** un **H1** claro, **H2/H3** escaneables, párrafos cortos, listas cuando ayuden a SERP y a lectura móvil.
4. **E-E-A-T (experiencia, expertise, autoridad, confianza):** ejemplos creíbles del sector (sin datos inventados); si se citan cifras, marcarlas como ilustrativas o respaldarlas; voz profesional acorde a estudios y freelance premium.
5. **Enlazado interno:** enlaces contextuales hacia landings de planes, pricing, producto y posts relacionados (usar route keys y slugs según `veta-marketing-i18n-content`).
6. **Fragmentos enriquecidos:** donde encaje, estructurar FAQs (pregunta/respuesta explícita), definiciones o pasos numerados para mejorar resultados y previews.

## GEO (motores generativos y respuestas citadas)

En este proyecto, **GEO** se entiende como optimización para que el contenido sea **fácil de citar, resumir y recomendar** en experiencias de búsqueda asistida por IA (respuestas con fuentes, “AI Overviews”, asistentes que leen la web).

1. **Claridad extractiva:** primera frase o párrafo que responda de forma directa la pregunta del título; después el desarrollo.
2. **Afirmaciones delimitadas:** preferir “Veta ayuda a…” / “Los estudios suelen…” antes que generalidades absolutas no verificables.
3. **Estructura máquina-legible:** títulos descriptivos, listas con verbos de acción, tablas comparativas cuando comparen enfoques (sin denigrar competidores con datos falsos).
4. **Terminología consistente:** mismo nombre de producto, mismas etiquetas de funciones que en la app pública (`memory-bank`, UI) para que resúmenes y snippets no contradigan la realidad del producto.
5. **Actualización:** fechas o “última actualización” en piezas que dependan de producto o normativa, cuando el formato lo permita.

## Mensaje por buyer persona (resumen estratégico)

| Persona     | Enfoque de mensaje                                                         | Tipos de contenido que funcionan                                                |
| ----------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Elena**   | Paz mental, rentabilidad, imagen profesional, recuperar tiempo para diseño | Visión de estudio, casos “antes/después” de procesos, marca y cliente premium   |
| **Javi**    | Velocidad en obra, móvil, menos fricción, menos papel perdido              | Tutoriales cortos, checklists de obra, “cómo hacer X en un minuto”              |
| **Beatriz** | Control, trazabilidad, cuadre presupuesto–factura, informes                | Guías financieras, comparativas de flujo de trabajo, rigor y seguridad de datos |

Un mismo **artículo** puede tener secciones orientadas a perfiles distintos; un **email o modal in-app** debe elegir **una** persona objetivo por envío o pantalla.

## Blog vs público vs privado

| Canal                             | Objetivo típico                             | Notas                                                                                                                                                                                                                                              |
| --------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Blog**                          | Tráfico orgánico, confianza, GEO            | Pilar editorial alineado a intención; enlaces internos; meta y OG al publicar en web (vía skill i18n si la plantilla es bilingüe).                                                                                                                 |
| **Páginas públicas (marketing)**  | Conversión y refuerzo de marca              | Respetar copy base en `productContext.md`; ampliaciones siguen esta skill + `veta-marketing-i18n-content`.                                                                                                                                         |
| **Privado (app, email producto)** | Activación, retención, reducción de soporte | Misma verdad de producto que el marketing; tono puede ser más directo. La UI autenticada hoy no exige bilingüe en código: **mantener coherencia terminológica**; si en el futuro hay EN en app, replicar estructura de mensajes como en marketing. |

## Checklist antes de dar por buena una pieza

- [ ] Persona primaria (y secundaria si aplica) definida según `buyerPersona.md`.
- [ ] Intención SEO y keyword principal / secundarias alineadas con `productContext.md` sin keyword stuffing.
- [ ] Título + resumen inicial útiles para humanos y para extracción en motores generativos.
- [ ] Sin promesas que el producto no cumpla (revisar contra `memory-bank/` y la app).
- [ ] Para contenido **en web pública indexable:** plan de metadata, locale ES/EN y sitemap según **`veta-marketing-i18n-content`**.
- [ ] CTAs y enlaces coherentes con el funnel (prueba, demo, contacto, plan adecuado).

## Relación con otras skills

- **`veta-marketing-i18n-content`** — implementación ES+EN, `marketing.json`, `routing.ts`, sitemap, rewrites.
- **`veta-multilanguage-views`** — SEO avanzado, canónicos, hreflang, depuración de URLs.
- **`veta-app-routing`** — si el contenido implica nuevas rutas públicas vs privadas (`PUBLIC_ROUTES`).
