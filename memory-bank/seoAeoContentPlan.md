# SEO/AEO Content Plan 2026

Plan de contenido editorial alineado a buyer personas (Lucía, Elena, Javi) con enfoque SEO clásico y GEO (optimización para motores generativos: ChatGPT, Perplexity, Google AI Overviews). Prioriza estudios pequeños (1–3 personas) y funcionalidades reales de Veta.

**Dependencia:** Este plan se basa en los buyer personas actualizados en `memory-bank/buyerPersona.md` (PR #244: `cursor/buyer-personas-2026-4545`).

---

## 1. Objetivos y KPIs

| Objetivo                     | KPI primario                                     | Hipótesis inicial (a calibrar tras 4 semanas de analítica real)                                   |
| ---------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| **Tráfico orgánico**         | Usuarios únicos desde búsqueda (Google + IA)    | Hipótesis: +30% vs baseline; validar baseline actual en Google Search Console antes de fijar meta |
| **Generación de leads**      | Evento `demo_access` desde blog                  | Hipótesis: 50 clics/mes hacia demo o prueba gratuita desde artículos del blog                     |
| **Registro**                 | Evento `sign_up` atribuido a contenido orgánico  | Hipótesis: 15 registros/mes con fuente orgánica                                                    |
| **Activación**               | Usuario crea proyecto + añade presupuesto/proveedor (7 días) | Hipótesis: 60% de registros orgánicos alcanzan activación                                          |
| **Visibilidad GEO**          | Citas/menciones de Veta en respuestas de IA     | Medir mensualmente con búsqueda manual en ChatGPT/Perplexity para queries clave (ej. "software presupuestos interiorismo"). Herramienta a evaluar: [Otterly.ai](https://otterly.ai/) |

**Fuente de datos:** Google Search Console, Google Analytics 4 (eventos `demo_access`, `sign_up`), tabla `user_events` (fuente: PR #212 funnel data foundations).

**Nota crítica:** Los números anteriores son **hipótesis de trabajo, no compromisos**. Tras las primeras 4 semanas de publicación (finales de noviembre 2026), revisar analítica real y ajustar metas según baseline y tendencia observada.

---

## 2. Arquitectura de Contenido: Clusters Temáticos

### Cluster 1: Gestión de Presupuestos y Control Financiero

**Pilar:** [Existente] "Por qué Veta supera a las hojas de cálculo en la gestión de presupuestos de interiorismo" (`veta-vs-excel-presupuestos-interiorismo`)

**Artículos satélite:**

1. **Cómo estructurar un presupuesto de diseño interior sin errores** (evergreen, informacional)
   - Persona: Lucía
   - Funnel: ToFu (awareness)
   - Keywords ES: estructurar presupuesto interiorismo, presupuesto diseño interior paso a paso
   - Keywords EN: how to structure interior design budget, budget template for interior designers
   - AEO queries: "¿Cómo hacer un presupuesto de interiorismo?", "What should an interior design budget include?"

2. **Presupuesto vs coste real: cómo evitar desviaciones en proyectos de diseño** (evergreen, problema-solución)
   - Persona: Elena
   - Funnel: MoFu (consideration)
   - Keywords ES: desviaciones presupuestarias interiorismo, control de costes en obra
   - Keywords EN: budget overrun interior design, cost control in design projects
   - AEO queries: "¿Por qué se desvían los presupuestos de diseño?", "How to prevent budget overruns in interior projects?"

3. **Márgenes en diseño interior: cómo calcularlos y protegerlos sin exponer datos al cliente** (evergreen, transaccional-suave)
   - Persona: Lucía, Elena
   - Funnel: MoFu/BoFu
   - Keywords ES: márgenes interiorismo, cálculo margen diseño interior
   - Keywords EN: interior design markup, profit margin for designers
   - AEO queries: "¿Qué margen cobran los interioristas?", "How to calculate markup on furniture?"
   - CTA: vista pública de Veta (`/view-project`) como herramienta que oculta márgenes

### Cluster 2: Gestión de Obra y Proveedores

**Pilar:** (nuevo) "Guía completa para gestionar la fase de obra en proyectos de interiorismo"

4. **Guía completa para gestionar la fase de obra en proyectos de interiorismo** (evergreen, pilar, 2000-2500 palabras)
   - Persona: Elena, Javi
   - Funnel: ToFu/MoFu
   - Keywords ES: gestión de obra interiorismo, fases proyecto diseño interior, control de obra
   - Keywords EN: construction phase management interior design, site management for designers
   - AEO queries: "¿Cómo se gestiona la fase de obra en interiorismo?", "What are the phases of an interior design project?"
   - Enlazado: artículos satélite 5, 6, 7

5. **Cómo gestionar pedidos y proveedores en proyectos de diseño interior** (evergreen, operacional)
   - Persona: Javi
   - Funnel: MoFu
   - Keywords ES: gestión proveedores interiorismo, pedidos mobiliario diseño interior
   - Keywords EN: supplier management interior design, furniture procurement for designers
   - AEO queries: "¿Cómo controlar pedidos de mobiliario en obra?", "How do interior designers manage suppliers?"

6. **Estados de pedido en obra: de "pendiente" a "instalado"** (evergreen, funcional)
   - Persona: Javi, Lucía
   - Funnel: MoFu/BoFu
   - Keywords ES: seguimiento pedidos obra, estado mobiliario interiorismo
   - Keywords EN: order tracking interior design, furniture delivery status
   - AEO queries: "¿Cómo saber si el mobiliario ya está pedido?", "How to track furniture orders in a project?"
   - CTA: Veta permite estados por producto (pendiente, pedido, recibido, instalado)

7. **Órdenes de compra en diseño interior: qué son y cómo usarlas para no perder dinero** (evergreen, educacional)
   - Persona: Elena, Beatriz
   - Funnel: MoFu
   - Keywords ES: orden de compra interiorismo, purchase order diseño interior
   - Keywords EN: purchase order interior design, PO management for designers
   - AEO queries: "¿Qué es una orden de compra en interiorismo?", "When do interior designers use purchase orders?"

### Cluster 3: Relación con el Cliente y Transparencia

**Pilar:** [Existente] "Por qué tu cliente necesita una vista pública del proyecto de interiorismo" (`vista-publica-cliente-interiorismo`)

8. **Cómo comunicar cambios y extras al cliente sin perder confianza** (evergreen, relacional)
   - Persona: Elena, Lucía
   - Funnel: ToFu
   - Keywords ES: comunicar cambios cliente interiorismo, extras proyecto diseño interior
   - Keywords EN: communicate design changes to client, change orders interior design
   - AEO queries: "¿Cómo cobrar extras en un proyecto de interiorismo?", "How to handle client requests for changes?"

9. **Qué esperan los clientes premium de un estudio de diseño interior en 2026** (evergreen, aspiracional)
   - Persona: Elena
   - Funnel: ToFu/MoFu
   - Keywords ES: cliente premium interiorismo, expectativas cliente diseño interior
   - Keywords EN: luxury interior design client expectations, premium design clients
   - AEO queries: "¿Qué busca un cliente de alto nivel en un estudio de interiorismo?", "What do luxury clients expect from interior designers?"
   - Enlace interno: vista pública como estándar de transparencia

### Cluster 4: Herramientas y Comparativas

**Pilar:** [Existente] "Por qué Veta supera a las hojas de cálculo..." (ya en blog)

10. **Software para diseñadoras de interiores freelance: qué necesitas de verdad** (evergreen, funcional, orientado a Lucía)
    - Persona: Lucía
    - Funnel: MoFu
    - Keywords ES: software interiorismo freelance, herramientas diseñadora interior independiente
    - Keywords EN: interior design software for freelancers, tools for independent designers
    - AEO queries: "¿Qué software necesita una interiorista freelance?", "What tools do freelance interior designers need?"
    - Ángulo: funcionalidades críticas para freelance (presupuestos limpios, vista cliente profesional, móvil-friendly, simplicidad sin curva de aprendizaje, precio accesible). Enlace interno al artículo existente "Veta vs Excel" como comparativa relacionada.

11. **Veta vs herramientas genéricas de gestión de proyectos (Monday, Notion, Trello)** (comparativa, transaccional)
    - Persona: Lucía, Elena
    - Funnel: BoFu
    - Keywords ES: Veta vs Monday interiorismo, software diseño interior vs Notion
    - Keywords EN: Veta vs Monday interior design, project management tools for designers
    - AEO queries: "¿Es Monday bueno para estudios de interiorismo?", "Can I use Notion for interior design projects?"
    - Ángulo: herramientas genéricas no entienden presupuestos, márgenes, órdenes de compra ni vista pública cliente

12. **Comparativa: software vertical de interiorismo (Veta, Houzz Pro, Studio Designer, Programa)** (comparativa, transaccional)
    - Persona: Elena
    - Funnel: BoFu
    - Keywords ES: comparativa software interiorismo, Veta vs Houzz Pro
    - Keywords EN: interior design software comparison, Veta vs Studio Designer
    - AEO queries: "¿Cuál es el mejor software para estudios de interiorismo?", "What's the difference between Veta and Houzz Pro?"
    - Ángulo: Veta = control de presupuesto y obra sin complejidad de ERP; sin disparar competidores con datos falsos

---

## 3. Calendario Editorial 12 Semanas (Oct 26, 2026 – Ene 11, 2027)

Publicación: **1 post/semana**, par ES+EN (mismo `entryId`), idioma primario ES. Orden priorizado por encaje con Lucía (early-adopter) y funcionalidades reales de Veta.

| Fecha      | Artículo                                                                  | Persona   | Funnel     | Prioridad | Visual                                               |
| ---------- | ------------------------------------------------------------------------- | --------- | ---------- | --------- | ---------------------------------------------------- |
| **Oct 26** | Cómo estructurar un presupuesto de diseño interior sin errores           | Lucía     | ToFu       | Alta      | Blog cover + Instagram carousel (5 slides) + LinkedIn single post |
| **Nov 2**  | Cómo gestionar pedidos y proveedores en proyectos de diseño interior     | Javi      | MoFu       | Alta      | Blog cover + Instagram single post + LinkedIn single post |
| **Nov 9**  | Software para diseñadoras de interiores freelance: qué necesitas de verdad | Lucía | MoFu | Alta | Blog cover + Instagram carousel (5 slides) + LinkedIn single post |
| **Nov 16** | Estados de pedido en obra: de "pendiente" a "instalado"                  | Javi, Lucía | MoFu/BoFu | Alta      | Blog cover + Instagram single post (infográfico) + LinkedIn single post |
| **Nov 23** | Márgenes en diseño interior: cómo calcularlos y protegerlos              | Lucía, Elena | MoFu/BoFu | Alta      | Blog cover + Instagram carousel (6 slides) + LinkedIn carousel (PDF) |
| **Nov 30** | Cómo comunicar cambios y extras al cliente sin perder confianza          | Elena, Lucía | ToFu      | Media     | Blog cover + Instagram single post + LinkedIn single post |
| **Dec 7**  | Presupuesto vs coste real: cómo evitar desviaciones en proyectos de diseño | Elena   | MoFu       | Media     | Blog cover + Instagram carousel (5 slides) + LinkedIn single post |
| **Dec 14** | Órdenes de compra en diseño interior: qué son y cómo usarlas             | Elena, Beatriz | MoFu    | Media     | Blog cover + Instagram single post + LinkedIn single post |
| **Dec 21** | Veta vs herramientas genéricas (Monday, Notion, Trello)                  | Lucía, Elena | BoFu     | Alta      | Blog cover + Instagram carousel (comparativa tabla 4 slides) + LinkedIn carousel (PDF) |
| **Dec 28** | Guía completa para gestionar la fase de obra en proyectos de interiorismo | Elena, Javi | ToFu/MoFu | Media   | Blog cover + Instagram carousel (8 slides — pilar largo) + LinkedIn single post |
| **Ene 4, 2027**  | Qué esperan los clientes premium de un estudio de diseño interior en 2026 | Elena     | ToFu/MoFu | Media     | Blog cover + Instagram single post (aspiracional, foto premium) + LinkedIn single post |
| **Ene 11, 2027** | Comparativa: software vertical de interiorismo (Veta, Houzz Pro, Studio Designer, Programa) | Elena | BoFu | Alta | Blog cover + Instagram carousel (comparativa 6 slides) + LinkedIn carousel (PDF) |

**Nota Visual:** Blog cover = imagen cover del artículo (640x360 recomendado, se commitea en PR del artículo). Instagram carousel = múltiples slides (formato 1:1 o 4:5). LinkedIn carousel = PDF multi-página. Single post = imagen única.

**Cambio respecto a plan inicial:** La semana del 9 de noviembre (originalmente "cuándo necesitas más que Excel") se reemplazó por "Software para diseñadoras freelance: qué necesitas de verdad" para evitar solapamiento con el artículo existente ["Veta vs Excel presupuestos"](https://veta.pro/blog/veta-vs-excel-presupuestos-interiorismo). Este nuevo artículo abordará funcionalidades críticas para freelance (presupuestos, vista cliente, móvil, simplicidad) y enlazará internamente al artículo de comparativa Excel existente.

---

## 4. Distribución y Promoción por Post

Cada artículo publicado sigue este flujo:

| Canal                         | Acción                                                                                                      | Responsable     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------- |
| **Blog (ES+EN)**              | Publicar par ES+EN con mismo `entryId`, metadata SEO, schema.org (Article/BlogPosting + FAQ si aplica)     | Dev + Content Writer |
| **Instagram @veta.interiordesign** | Post o carousel ES con extracto, CTA a artículo (link en bio), hashtags sector (#interiorismo #diseñodeinteriores #estudiodediseño) | Social Media Manager |
| **LinkedIn Company Page**     | Post ES + post EN (dos publicaciones separadas), extracto + link directo al artículo, hashtags profesionales (#InteriorDesign #DesignBusiness #ProjectManagement) | Social Media Manager |
| **Newsletter (futuro)**       | Incluir enlace a artículo destacado de la semana cuando exista lista de suscriptores                       | Marketing       |
| **Founder-led (opcional)**    | Si artículo es pilar o comparativa, Marco puede compartir desde perfil personal en LinkedIn con opinión propia | Marco           |

**No incluido (futuro):** Pinterest (pins con link a blog cuando tengamos presencia activa), YouTube shorts (cuando haya recursos de video).

---

## 5. Checklist On-Page y AEO por Artículo

Antes de publicar, cada artículo debe cumplir:

### SEO Clásico
- [ ] **H1** incluye keyword principal (una sola vez)
- [ ] **Primer párrafo** responde la pregunta principal en 200-300 caracteres (extracto para GEO)
- [ ] **H2/H3** formulados como preguntas literales que el usuario haría ("¿Cómo...?", "¿Qué...?", "¿Por qué...?")
- [ ] **Meta description** 140-160 caracteres, incluye keyword principal y propuesta de valor
- [ ] **Slug** descriptivo, corto, con keyword principal (ES y EN pueden diferir)
- [ ] **Enlazado interno:** mínimo 2 enlaces a product pages (pricing, planes, demo) o artículos relacionados del blog
- [ ] **Imágenes:** cover image con alt text descriptivo; imágenes inline con alt relevante
- [ ] **Schema.org:** `Article` o `BlogPosting` + `FAQPage` si hay sección de preguntas frecuentes explícitas

### GEO (Motores Generativos)
- [ ] **Respuesta instantánea:** primer párrafo extrae la respuesta completa (un LLM puede resumir el artículo leyendo solo el inicio)
- [ ] **Chunking:** secciones H2/H3 de máximo 150 palabras de texto corrido; usar listas y tablas para fragmentar
- [ ] **Terminología consistente:** nombres de funciones y conceptos coinciden con la UI de Veta y con `memory-bank/productContext.md`
- [ ] **Atribución de datos:** si se cita cifra o estadística, referenciar fuente o reformular como "según experiencia habitual..." (no inventar datos)
- [ ] **Bloque FAQ:** si aplica, incluir 3-5 preguntas frecuentes con respuestas directas (marcado con schema FAQPage)

### CTAs y Enlaces Internos
- [ ] **CTA al final:** enlace contextual a prueba gratuita, demo, o plan relevante (ver rutas en `memory-bank/productContext.md`: `/plan-base-primer-proyecto-interiorismo`, `/plan-pro-independientes-diseno-interior`, `/plan-studio-empresas-arquitectura-diseno-interior`)
- [ ] **Enlaces internos a comparativas existentes:** "Veta vs Excel" ya existe; enlazar cuando sea relevante
- [ ] **Enlaces a funcionalidades reales:** mencionar vista pública (`/view-project`), órdenes de compra, estados de pedido, registro de pagos — solo features que existen en producción

---

## 6. Keywords y Queries Clave por Idioma

### ES (Español — prioridad primaria)

**Informacionales (ToFu):**
- gestión de proyectos de diseño interior
- cómo hacer un presupuesto de interiorismo
- fases de un proyecto de diseño interior
- control de obra interiorismo
- gestión proveedores diseño interior

**Comparativas (MoFu/BoFu):**
- software gestión interiorismo
- Veta vs Excel presupuestos
- mejor herramienta para estudios de diseño
- comparativa software interiorismo (Veta, Houzz Pro, Programa)

**Transaccionales-suaves (BoFu):**
- software presupuestos diseño interior freelance
- herramienta gestión proyectos arquitectura pequeño estudio
- plataforma para interioristas con vista cliente

**AEO (preguntas para IA):**
- ¿Cómo estructurar un presupuesto de interiorismo?
- ¿Qué software usan los interioristas?
- ¿Cómo evitar desviaciones en el presupuesto de diseño?
- ¿Cuál es el mejor software para estudios de interiorismo pequeños?
- ¿Qué es una orden de compra en diseño interior?

### EN (English — secundario pero global)

**Informacionales (ToFu):**
- interior design project management
- how to create interior design budget
- construction phase interior design
- supplier management for interior designers

**Comparativas (MoFu/BoFu):**
- interior design software comparison
- Veta vs spreadsheets
- best project management tool for interior designers
- Veta vs Houzz Pro

**Transaccionales-suaves (BoFu):**
- interior design software for freelancers
- project management app for small design studios
- software with client portal for interior designers

**AEO (preguntas para IA):**
- How do interior designers manage budgets?
- What software do interior designers use?
- How to prevent budget overruns in design projects?
- What's the best software for freelance interior designers?
- Do I need project management software for my design studio?

---

## 7. Comparativas: Ángulos Honestos sin Disparar Competencia

Cuando se compara Veta con competidores (Monday, Notion, Houzz Pro, Programa, Studio Designer, Dzylo), seguir estos principios:

1. **No inventar debilidades.** Si no hemos usado la herramienta o no tenemos dato verificable, no afirmar "X es lenta" o "Y es cara". Usar "X no está diseñada específicamente para..." (factual).
2. **Ángulo de especialización.** Veta = **gestión de presupuesto, obra y cliente para diseño interior/arquitectura sin complejidad de ERP**. No tratamos de ser CRM ni ERP ni facturación oficial.
3. **Reconocer fortalezas ajenas.** Ej.: "Houzz Pro destaca en captación de clientes residenciales y galería pública; Veta se enfoca en control de presupuesto y obra".
4. **Comparar en tabla neutral.** Presentar features (presupuesto, órdenes de compra, vista cliente, móvil-first, integraciones, precio) sin juicios subjetivos. Dejar que el lector decida.
5. **CTA final honesto.** "Si buscas X, prueba Y. Si buscas control de obra sin ERP, prueba Veta 30 días gratis."

**Prohibido:**
- Citar precios de competidores sin fuente pública actualizada (cambian frecuentemente)
- Atribuir fallos técnicos sin evidencia ("X pierde datos", "Y tiene bugs")
- Tono despectivo o marketing agresivo

---

## 8. Medición y Retrospectiva

### KPIs a medir semanalmente (dashboard o Google Sheets)

| Métrica                          | Herramienta                  | Frecuencia |
| -------------------------------- | ---------------------------- | ---------- |
| Usuarios orgánicos al blog       | Google Analytics 4           | Semanal    |
| Consultas con impresiones        | Google Search Console        | Semanal    |
| CTR medio artículos              | Google Search Console        | Semanal    |
| Eventos `demo_access` desde blog | GA4 + tabla `user_events`    | Semanal    |
| Eventos `sign_up` orgánicos      | GA4 + tabla `leads`          | Semanal    |
| Activación (7 días)              | Query sobre `user_events`    | Mensual    |
| Citas en respuestas IA           | Búsqueda manual en ChatGPT/Perplexity; herramienta a evaluar: [Otterly.ai](https://otterly.ai/) | Mensual    |

### Retrospectiva mensual (después de semanas 4, 8, 12)

**IMPORTANTE:** Tras la semana 4 (23 de noviembre), realizar la **primera calibración de hipótesis KPI** contra analítica real. Ajustar metas y estrategia según baseline observado.

1. **Top 3 artículos por tráfico:** ¿Qué tienen en común? (keywords, formato, persona)
2. **Artículos con bajo CTR:** ¿Título poco claro? ¿Meta description débil? Iterar.
3. **Conversión blog → demo:** ¿Qué artículos generan más `demo_access`? Priorizar temas similares.
4. **Visibilidad GEO:** Buscar manualmente en ChatGPT/Perplexity las 5 queries clave. ¿Veta aparece citada? Si no, revisar estructura del artículo (chunking, primer párrafo, FAQ).
5. **Feedback cualitativo:** Si hay comentarios, emails o menciones en redes sobre un artículo, incorporar aprendizajes al siguiente.

---

## 9. Posicionamiento y Restricciones

### Posicionamiento Internacional
- **Público objetivo:** Freelance y estudios pequeños/medianos en España, Latinoamérica, EE.UU., Europa anglófona.
- **No asumir normativa local:** Evitar referencias a facturación oficial (Verifactu, e-invoicing) salvo para aclarar que Veta facilita exportación a herramientas de facturación de terceros.
- **Copy adaptado EN vs ES:** EN no es traducción literal; adaptar ejemplos y referencias (ej. COAM → RIBA/AIA, HábitatMadrid → Clerkenwell Design Week).

### Restricciones de Datos
- **No inventar estadísticas.** Si no hay fuente verificable, reformular como "según experiencia habitual..." o eliminar.
- **No citar volúmenes de búsqueda sin herramienta.** Si no hay acceso a Ahrefs/Semrush/Google Keyword Planner, marcar keywords como "a validar".
- **No prometer features que no existen.** Revisar contra `memory-bank/activeContext.md` y `productContext.md` antes de afirmar "Veta hace X".

### Funcionalidades Reales de Veta (Q4 2026)
Confirmar contra `memory-bank/activeContext.md` y código:
- ✅ Proyectos con fases
- ✅ Presupuesto por partidas (categorías, subcategorías)
- ✅ Productos con coste, margen, precio de venta, proveedor, estado (pendiente, pedido, recibido, instalado, completado, cancelado)
- ✅ Órdenes de compra con estado (borrador, enviada, confirmada, recibida, cancelada)
- ✅ Registro de pagos (honorarios, provisión compras, coste adicional, otro) vinculados a órdenes de compra o costes adicionales
- ✅ Vista pública del proyecto (`/view-project/[token]`) con control de visibilidad
- ✅ PDF del presupuesto
- ✅ Espacios con imágenes y productos
- ✅ Catálogo de productos y proveedores
- ❌ **No existe (no mencionar):** facturación oficial, integración nativa con ERPs (solo exportación manual por ahora), app móvil nativa (web responsive sí), gestión de equipo avanzada (permisos granulares), time tracking, CRM de captación

---

## 10. Próximos Pasos (Post-Q1)

Después de las 12 semanas iniciales y retrospectiva:

1. **Cluster 5: Profesión y Carrera** (si Lucía/Elena responden bien a contenido aspiracional)
   - Ej.: "Cómo fijar honorarios como interiorista freelance", "Errores comunes al montar un estudio de diseño"
2. **Cluster 6: Tendencias y Sector** (si hay recursos para cobertura de ferias)
   - Ej.: "Tendencias de diseño interior 2027", "Qué esperar del Salone del Mobile 2027"
3. **Pilar de casos de uso** (cuando tengamos testimonios reales)
   - Ej.: "Cómo [Estudio X] recuperó el control de 8 proyectos simultáneos con Veta"
4. **Contenido estacional:** Preparar con 4-6 semanas de antelación para Salone del Mobile (abril), Maison & Objet (septiembre), HábitatMadrid (septiembre).
5. **Expansión de comparativas:** Según feedback, añadir "Veta vs Dzylo" (si mercado EN responde), "Veta vs Zoho Projects", etc.

---

## Recursos de Referencia

- **Skills del proyecto:**
  - `veta-marketing-strategy-seo-geo` — estrategia de contenido general
  - `veta-blog-research` — investigación de temas y briefs
  - `veta-blog-article` — escritura operativa de artículos
  - `veta-marketing-i18n-content` — implementación ES+EN, metadata, sitemap
- **Buyer personas:** `memory-bank/buyerPersona.md` (PR #244)
- **Producto y copy:** `memory-bank/productContext.md`
- **Estado del producto:** `memory-bank/activeContext.md`
- **Artículos existentes (no duplicar):**
  - Flujo de trabajo estudio
  - Iluminación por capas
  - Veta vs Excel presupuestos
  - Vista pública cliente interiorismo
- **Herramientas AEO:**
  - [HubSpot AEO Grader](https://www.hubspot.com/ai-search-grader)
  - [Otterly.ai](https://otterly.ai/) — herramienta a evaluar para visibilidad en respuestas generativas
  - [AnswerThePublic](https://answerthepublic.com/) — preguntas reales de usuarios
  - [Google Rich Results Test](https://search.google.com/test/rich-results) — validar schema
