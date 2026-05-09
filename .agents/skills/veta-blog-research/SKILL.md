---
name: veta-blog-research
description: >-
  Investiga temas, encuentra ángulos originales y valida ideas para el blog de Veta
  sobre arquitectura, interiorismo y gestión de proyectos de diseño. Genera briefs de
  contenido con keywords, intención de búsqueda, fuentes del sector y un esquema de
  artículo listo para redactar. Usar cuando el usuario busca ideas para artículos,
  pregunta "sobre qué escribir", necesita un brief de contenido, quiere saber si un tema
  tiene potencial SEO, o quiere planificar el calendario editorial del blog de Veta.
---

# Veta: investigación de contenido y briefs para el blog

Esta skill guía el proceso previo a la escritura: encontrar un tema con potencial real, definir el ángulo correcto, validar la demanda de búsqueda y entregar un brief que la skill **`veta-blog-article`** pueda ejecutar directamente.

Un brief bien construido es la diferencia entre un artículo que posiciona y uno que nadie lee.

---

## Cuándo usar esta skill

- El usuario quiere ideas de temas para el blog de Veta.
- Se necesita validar si un tema tiene potencial de tráfico o GEO.
- Hay que definir la keyword principal, la intención de búsqueda y la estructura antes de escribir.
- Se busca construir un calendario editorial o un cluster de contenido.

**Flujo habitual:** esta skill → entrega un brief → **`veta-blog-article`** escribe el artículo.

---

## 1. Marco del blog de Veta

El blog de Veta debe posicionarse como un recurso editorial para profesionales del diseño interior y la arquitectura en España y Latinoamérica (ES) y el mercado anglófono (EN). No es un blog corporativo de noticias: es un recurso útil que resuelve problemas reales de Elena, Javi y Beatriz (ver `memory-bank/buyerPersona.md`).

**Categorías editoriales principales:**

| Categoría                    | Tipo de audiencia    | Intención típica                   |
| ---------------------------- | -------------------- | ---------------------------------- |
| Gestión de proyectos         | Elena, Javi          | Informacional, comparativa         |
| Gestión de estudio y negocio | Elena, Beatriz       | Informacional, transaccional-suave |
| Herramientas y software      | Elena, Javi, Beatriz | Comparativa, informacional         |
| Tendencias de diseño         | Elena                | Informacional                      |
| Profesión y carrera          | Elena, Javi          | Informacional                      |
| Eventos y sector             | Elena                | Informacional, de comunidad        |

---

## 2. Proceso de investigación

### Paso 1: Capturar la semilla del tema

Si el usuario da una idea vaga ("algo sobre presupuestos en obra"), concretarla con estas preguntas:

- ¿A quién le duele este tema? ¿Elena, Javi o Beatriz?
- ¿Qué pregunta concreta intenta resolver el lector?
- ¿El tema es evergreen (siempre relevante) o estacional (evento, tendencia)?
- ¿En qué idioma(s) debe publicarse?

### Paso 2: Identificar la intención de búsqueda

Clasificar la intención antes de elegir la keyword:

- **Informacional:** "Cómo se hace X", "Qué es Y", guías, tutoriales → ideal para tráfico de blog.
- **Comparativa:** "X vs Y", "Mejores herramientas para Z" → muy buen encaje para GEO (los LLMs citan comparativas).
- **Transaccional-suave:** "Software para gestionar proyectos de diseño interior" → enlazar a landing de producto.

### Paso 3: Definir keywords

Para cada artículo, definir:

1. **Keyword principal** (1 frase, 2-5 palabras, volumen de búsqueda razonable, competencia alcanzable).
2. **Keywords secundarias** (2-4 variantes semánticas o entidades relacionadas).
3. **Keywords de cola larga** para H2/H3 (frases que el lector usaría en búsqueda por voz o en formato pregunta).

**Herramientas de apoyo:**

- **[AnswerThePublic](https://answerthepublic.com/)** — preguntas reales que los usuarios hacen.
- **Google Search Console** — consultas que ya generan impresiones (si hay acceso).
- **Búsqueda manual en Google** — ver autocompletado, "Otras preguntas" y "Búsquedas relacionadas".
- **Frase.io** — cobertura semántica vs. los artículos mejor posicionados.

**Keywords de referencia del proyecto** (de `memory-bank/productContext.md`):

- ES: gestión de proyectos, diseño interior, interiorismo, arquitectura de diseño interior, gestión de presupuestos.
- EN: interior design project management, interior design software, architecture studio management.

### Paso 4: Evaluar el ángulo

Un artículo tiene buen ángulo cuando cumple al menos dos de estos criterios:

- Responde una pregunta que los competidores no responden bien (o responden de forma genérica).
- Aporta un dato, ejemplo o punto de vista que no aparece en los primeros 10 resultados.
- Conecta un tema del sector con una utilidad concreta de Veta (sin convertirse en publireportaje).
- Tiene potencial de ser citado por una IA (responde una pregunta clara, tiene estructura, usa datos).

### Paso 5: Validar relevancia sectorial

Contrastar el tema con fuentes del sector antes de comprometerse:

**Fuentes de referencia (arquitectura e interiorismo):**

- [ArchDaily](https://www.archdaily.com/) / [ArchDaily ES](https://www.archdaily.cl/) — referente editorial global.
- [Dezeen](https://www.dezeen.com/) — tendencias de diseño y arquitectura.
- [Interior Design Magazine](https://interiordesign.net/) — tendencias mercado EN.
- [HábitatMadrid](https://www.habitatmadrid.com/) / [Salone del Mobile](https://www.salonemilano.it/) — ferias del sector.
- [CSCAE](https://www.cscae.com/) / [Consejo Superior de los Colegios de Arquitectos de España](https://www.cscae.com/) — datos sectoriales ES.
- [RIBA](https://www.architecture.com/) — mercado EN.
- [AIA](https://www.aia.org/) — mercado EN (EE.UU.).

**Para herramientas y software:**

- G2, Capterra, Product Hunt — reviews de competidores y alternativas.
- Blogs y canales de YouTube de profesionales del sector.

---

## 3. Contenido estacional y tendencias

Algunos temas tienen ventana temporal. Identificar si el tema es:

- **Evergreen:** Posiciona durante meses o años. Priorizar para el blog. Ej.: "Cómo estructurar las fases de un proyecto de interiorismo".
- **Estacional:** Ligado a una feria, normativa o tendencia del año. Publicar con 4-6 semanas de antelación. Ej.: "Las tendencias de diseño interior para [año]" o cobertura de Salone del Mobile.
- **Reactivo:** Responde a una noticia o cambio del sector. Publicar rápido, pero asegurar que el artículo tiene vida útil más allá de la noticia.

**Eventos anuales de referencia para el calendario:**

| Evento                            | Período            | Tipo de contenido              |
| --------------------------------- | ------------------ | ------------------------------ |
| Salone del Mobile (Milán)         | Abril              | Tendencias, cobertura, crónica |
| Maison & Objet (París)            | Enero y Septiembre | Tendencias, novedades          |
| HábitatMadrid                     | Septiembre         | Sector español, ferias         |
| Clerkenwell Design Week (Londres) | Mayo               | Diseño de interiores EN        |
| DesignMiami                       | Diciembre          | Premium, tendencias globales   |
| COAM / Colegios de Arquitectos    | Todo el año        | Normativa, eventos locales ES  |

---

## 4. Análisis del cluster de contenido

Para temas importantes, construir un **cluster** en vez de artículos aislados:

1. **Artículo pilar:** amplio, cubre el tema en profundidad (1500-2500 palabras). Ej.: "Guía completa para gestionar proyectos de diseño interior".
2. **Artículos satélite:** más específicos, enlazan al pilar. Ej.: "Cómo evitar desviaciones de presupuesto en obra", "Herramientas de gestión de proyectos para interioristas", "Cómo comunicar cambios al cliente durante la reforma".

El cluster mejora la autoridad temática del dominio ante Google y facilita que los LLMs encuentren respuestas coherentes y relacionadas en el mismo sitio.

---

## 5. Plantilla de brief de contenido

Al terminar la investigación, entregar este brief estructurado:

```
## Brief: [Título provisional del artículo]

**Persona primaria:** [Elena / Javi / Beatriz]
**Idioma(s):** [ES / EN / Ambos]
**Categoría editorial:** [Gestión de proyectos / Herramientas / Tendencias / Negocio / Profesión / Eventos]
**Tipo:** [Evergreen / Estacional / Reactivo]

### Intención de búsqueda
[Informacional / Comparativa / Transaccional-suave]

### Keyword principal
[keyword - volumen estimado / competencia]

### Keywords secundarias
- [variante 1]
- [variante 2]
- [entidad relacionada]

### Keywords de cola larga para H2/H3
- ¿Cómo...?
- ¿Qué es...?
- ¿Por qué...?

### Ángulo y diferenciador
[Qué aportará este artículo que no aportan los 10 primeros resultados de búsqueda]

### Estructura propuesta
- H1: [título con keyword]
- H2: [pregunta 1]
  - H3: [subpunto si aplica]
- H2: [pregunta 2]
- H2: [pregunta 3]
- H2: [Preguntas frecuentes — si aplica]

### Fuentes de apoyo
- [Fuente 1 — para datos o contexto]
- [Fuente 2]

### Enlace interno sugerido
- [Artículo relacionado o landing de producto]

### CTA al final del artículo
[Prueba gratuita / artículo relacionado / landing de plan]

### Longitud estimada
[800-1200 / 1500-2500 palabras]

### Notas adicionales
[Contexto especial, ángulo de opinión, sección de experto, datos a buscar]
```

---

## 6. Criterios para descartar un tema

No todo tema que parece interesante merece un artículo. Descartar si:

- La búsqueda es casi inexistente y el tema tampoco tiene potencial GEO (no hay preguntas que los LLMs responderían con ese artículo).
- Los primeros 10 resultados de búsqueda ya lo cubren de forma exhaustiva y el ángulo no aporta nada diferente.
- El tema es tan genérico que no conecta con ninguno de los perfiles (Elena, Javi, Beatriz) ni con la propuesta de valor de Veta.
- Requiere datos o imágenes que no es posible conseguir o verificar.

Cuando hay dudas entre dos temas, priorizar el que tenga mayor potencial evergreen y mayor conexión con una necesidad real de los buyer personas.
