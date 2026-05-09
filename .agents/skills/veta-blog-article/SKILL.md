---
name: veta-blog-article
description: >-
  Escribe y revisa artículos de blog para Veta sobre arquitectura, interiorismo y gestión
  de proyectos de diseño, aplicando SEO y GEO 2026. Genera contenido en español e inglés.
  Usar al crear o editar artículos del blog, sea sobre tendencias del sector, herramientas,
  gestión de estudios, eventos, tutoriales o recursos para profesionales del diseño interior
  y la arquitectura. También activar cuando el usuario pida "escribir un artículo",
  "post para el blog", "contenido para blog", "borrador de artículo", "artículo en inglés"
  o cualquier pieza editorial para el blog de Veta.
---

# Veta: artículos de blog — SEO, GEO y sector (2026)

Esta skill es la guía operativa para escribir artículos del blog de Veta. Define cómo estructurar, redactar y entregar un artículo que funcione para lectores humanos, para buscadores tradicionales (SEO) y para motores generativos como Perplexity, ChatGPT o Gemini (GEO).

El objetivo no es volumen: es utilidad real. Un artículo que responde bien una pregunta concreta vale más que diez artículos genéricos.

---

## Cuándo usar esta skill

- Escribir o revisar un artículo del blog de Veta (ES o EN o ambos).
- El tema toca: profesión de arquitecto/interiorista, gestión de proyectos, herramientas y software del sector, tendencias de diseño, eventos y referentes, gestión de estudio/negocio.
- El usuario pide un "post", "artículo", "borrador", "contenido para el blog" o similar.

**Relación con otras skills:**
- **`veta-blog-research`** — úsala antes si el tema aún no está definido o validado.
- **`veta-marketing-strategy-seo-geo`** — para copy de producto, landings y emails. Esta skill es para artículos editoriales.
- **`veta-marketing-i18n-content`** — para la implementación técnica ES+EN en el código de la web.

---

## 1. Antes de escribir: el brief mínimo

Antes de producir el artículo, confirma estos datos (si no los dio el usuario, pregúntalos o infierlos del contexto):

| Campo | Qué definir |
|---|---|
| **Tema / ángulo** | Pregunta concreta que resuelve el artículo |
| **Persona primaria** | Elena (propietaria/decisora), Javi (PM/obra) o Beatriz (ops/administración). Ver `memory-bank/buyerPersona.md` |
| **Idioma(s)** | ES, EN, o ambos (ES primario → EN adaptado, no traducción literal) |
| **Intención de búsqueda** | Informacional, comparativa, transaccional-suave |
| **Keyword principal** | Frase que el lector busca; intégrala en H1 y primer párrafo |
| **Keywords secundarias** | Entidades y variantes semánticas relacionadas |
| **Longitud estimada** | Artículo de nicho: 800-1200 palabras. Guía o pilar: 1500-2500 palabras |

Si el tema o la keyword no están definidos, usa **`veta-blog-research`** primero.

---

## 2. Estructura del artículo

### 2.1 Respuesta instantánea (primer párrafo — crítico para GEO)

Los primeros 200-300 caracteres deben responder la intención de búsqueda. Si un motor de IA lee solo el primer párrafo, debe poder resumir el artículo completo con precisión.

- Empezar con una afirmación directa, no con "En el mundo actual..." ni con preguntas retóricas vacías.
- Oraciones breves y declarativas.
- Incluir la keyword principal de forma natural.

**Ejemplo correcto (interiorismo):**
> Llevar el control de presupuesto en obra sin perder rentabilidad requiere tres hábitos: registrar gastos en el momento, separar costes fijos de variables y revisar la desviación semanalmente.

**Ejemplo a evitar:**
> En el apasionante mundo del diseño de interiores, gestionar un proyecto puede ser un verdadero desafío para los profesionales del sector...

### 2.2 Jerarquía de encabezados (H1 → H2 → H3)

- **H1:** Una sola vez. Incluye la keyword principal. Puede formularse como pregunta o como afirmación precisa.
- **H2:** Subtemas principales. Formularlos como preguntas literales que el usuario haría ("¿Cómo evitar desviaciones en obra?", "What tools do interior designers use for budgeting?"). Esto maximiza fragmentos destacados y la citabilidad en GEO.
- **H3:** Desglose dentro de un H2. Puede ser afirmativo o interrogativo según lo que sirva mejor.

### 2.3 Chunking (bloques de contenido)

Cada sección entre H2/H3 no debe superar 150 palabras de texto corrido. Si hay más, introduce una lista o tabla o divide en un H3 adicional. Los motores de IA extraen información por fragmentos; los bloques cortos y bien delimitados se citan mejor.

### 2.4 Elementos de apoyo visual

Usar **tablas** para comparaciones, **listas numeradas** para pasos y **listas de viñetas** para características. Son los formatos que los LLMs prefieren para extraer fragmentos. No usarlos por decoración: solo cuando ordenan o aclaran información real.

### 2.5 Cierre y CTA

- Párrafo de cierre que consolide el aprendizaje (no repetir lo dicho, sintetizarlo).
- CTA contextual: si el artículo toca gestión de proyectos, obra o presupuestos → enlace a la prueba gratuita de Veta o a una landing de plan relevante (ver rutas en `memory-bank/productContext.md`).
- Para artículos puramente informativos sin relación directa con el producto, el CTA puede ser a otro artículo relacionado (enlace interno).

---

## 3. SEO técnico en el artículo

### Keywords

- Integrar la **keyword principal** en: título H1, primer párrafo, al menos un H2, y meta-description.
- No repetirla mecánicamente. Usar **entidades relacionadas** y sinónimos: el motor semántico de Google entiende contexto, no densidad.
- Palabras clave de referencia del proyecto (de `memory-bank/productContext.md`): gestión de proyectos, arquitectura de diseño interior, diseño interior, interiorismo, gestión de presupuestos.

### Enlazado interno

- Al menos 2 enlaces internos a: landings de planes, artículos relacionados del blog, o páginas de producto.
- Usar anchor text descriptivo y natural (no "haz clic aquí").

### Meta-description

- Entre 140-160 caracteres.
- Incluir keyword principal y una propuesta de valor clara.
- Formulación activa: "Aprende cómo...", "Descubre los pasos...", "Guía para...".

### Schema.org recomendado

Para artículos del blog de Veta, el tipo base es `Article` o `BlogPosting`. Si el artículo tiene secciones de preguntas y respuestas explícitas, añadir `FAQPage` como tipo adicional. Validar siempre con [Google Rich Results Test](https://search.google.com/test/rich-results).

---

## 4. GEO: optimización para motores generativos

El contenido que los LLMs citan con frecuencia comparte estos rasgos:

1. **Define conceptos con claridad.** Si el artículo usa un término técnico (certificación de obra, gestión de fases, BIM, RIBA stages), explicarlo en una o dos frases la primera vez que aparece.
2. **Responde preguntas explícitas.** Estructurar al menos una sección como "¿Qué es X?", "¿Por qué importa?", "¿Cómo funciona?", "¿Cuándo usarlo?".
3. **Atribuye datos a fuentes.** No inventar cifras. Si se citan datos, referenciar la fuente (ArchDaily, Dezeen, estudio del CSCAE, informe sectorial, etc.). Si no hay dato verificable, reformular como "según la experiencia habitual en estudios pequeños..." o eliminar la afirmación.
4. **Evitar relleno.** Si un párrafo no aporta dato, ejemplo o argumento concreto, eliminarlo. El GEO penaliza implícitamente el contenido que diluye la señal informativa.
5. **Terminología consistente con la app.** Usar los mismos nombres de funciones y conceptos que Veta usa en la interfaz (proyectos, presupuesto, certificación, proveedor). Esto refuerza la coherencia de marca cuando la IA relaciona contenido del blog con la herramienta.

---

## 5. E-E-A-T: experiencia, expertise, autoridad, confianza

La autoridad no se declara, se demuestra. Aplicar al menos dos de estos recursos por artículo:

- **Ejemplo real o caso ilustrativo:** "Un estudio con tres proyectos simultáneos en fase de obra puede enfrentarse a..." (no datos inventados; situaciones verosímiles y verificables del sector).
- **Opinión fundamentada:** Sección corta con un punto de vista argumentado sobre el tema, diferenciando el contenido de cualquier artículo genérico.
- **Dato con fuente:** Cifra o estadística atribuida a un estudio, informe o publicación sectorial reconocida.
- **Fecha o vigencia:** Indicar el año o el contexto temporal para piezas que dependan de normativa, herramientas o tendencias.

---

## 6. Temas del sector (referencia para el ángulo del artículo)

El blog de Veta puede cubrir estas categorías:

| Categoría | Ejemplos de ángulos |
|---|---|
| **Profesión** | Cómo se estructura un estudio boutique, diferencias entre arquitecto de interiores y decorador, salidas profesionales, asociaciones del sector (COAM, AID) |
| **Gestión de proyectos** | Fases de un proyecto de interiorismo, cómo evitar desviaciones en obra, comunicación con cliente, gestión de cambios y extras |
| **Herramientas y software** | Comparativa de herramientas de gestión, BIM para interiores, software de presupuestos, apps de seguimiento de obra |
| **Tendencias** | Tendencias de diseño por temporada, materiales emergentes, sostenibilidad, diseño biofílico, minimalismo funcional |
| **Negocio del estudio** | Cómo fijar honorarios, rentabilidad por proyecto, captación de clientes, personal branding para estudios |
| **Eventos y referentes** | Ferias (Salone del Mobile, Maison & Objet, HábitatMadrid), premios, referentes internacionales, edición local |

El ángulo siempre debe conectarse con un **dolor o ambición de Elena, Javi o Beatriz** (ver `memory-bank/buyerPersona.md`). Un artículo sobre tendencias que no tiene ningún gancho de utilidad práctica para el lector no encaja bien en el blog de Veta.

---

## 7. Artículos bilingües (ES + EN)

Veta publica en español (idioma primario) e inglés. Las reglas:

1. **ES es el original.** Redactar primero en español salvo que el usuario pida EN directamente.
2. **EN es una adaptación, no una traducción.** Adaptar ejemplos, referencias y tono al contexto anglófono cuando sea relevante (ej. sustituir COAM por RIBA o AIA; adaptar ferias o normativas).
3. **Keywords en EN son distintas.** "Interior design project management", "architecture studio software", "how to manage a design project" no son traducciones directas de las keywords ES. Definirlas por separado.
4. **Meta y slugs en EN:** seguir el patrón de rutas definido en `veta-marketing-i18n-content`. Los slugs ES e EN pueden diferir.
5. Para la **implementación técnica** (mensajes JSON, sitemap, metadata), ver skill **`veta-marketing-i18n-content`**.

---

## 8. Checklist 2026 antes de entregar

- [ ] ¿El primer párrafo responde la pregunta principal sin rodeos?
- [ ] ¿Los H2/H3 están formulados como preguntas literales del usuario?
- [ ] ¿Las secciones tienen menos de 150 palabras de texto corrido?
- [ ] ¿Se incluye al menos un dato atribuido a fuente externa o ejemplo verificable?
- [ ] ¿La información es original (punto de vista propio, ángulo diferente al de los top-10 resultados de búsqueda)?
- [ ] ¿Se menciona la ubicación geográfica si el artículo tiene componente local (SEO local)?
- [ ] ¿Hay al menos 2 enlaces internos a producto, planes o artículos relacionados?
- [ ] ¿La keyword principal aparece en H1, primer párrafo y meta-description?
- [ ] ¿Si es bilingüe, el EN está adaptado y tiene sus propias keywords (no es traducción literal)?
- [ ] ¿Los términos de producto coinciden con los usados en la app de Veta?

---

## 9. Herramientas de referencia

Para validar y optimizar el artículo antes de publicar:

- **[Google Rich Results Test](https://search.google.com/test/rich-results)** — Validar Schema.org (Article, FAQ, HowTo).
- **[AnswerThePublic](https://answerthepublic.com/)** — Encontrar preguntas literales para H2/H3.
- **[Google Search Console](https://search.google.com/search-console)** — Verificar indexación y consultas reales.
- **[Frase.io](https://frase.io/)** — Optimizar la estructura y cobertura semántica del artículo.
- **[HubSpot AEO Grader](https://www.hubspot.com/ai-search-grader)** — Evaluar citabilidad del contenido por motores de IA.
- **[Otterly.ai](https://otterly.ai/)** — Monitorizar visibilidad de marca en respuestas generativas de LLMs.
