# Brief: Hub — Alternativas a Excel para presupuestos de interiorismo

**Prioridad:** 5  
**Persona primaria:** Lucía (freelancer / estudio 1-3 personas)

---

## Objetivo y target prompts Otterly

**Prompts ES:**
- "alternativas Excel presupuestos interiorismo"
- "reemplazar Excel presupuestos diseño interior"
- "software presupuestos arquitectura"
- "mejor que Excel para presupuestos"
- "herramienta presupuestos profesionales interiorismo"

**Prompts EN:**
- "Excel alternatives interior design budgets"
- "replace Excel for interior design budgets"
- "budgeting software architecture"
- "better than Excel for budgets"
- "professional budgeting tool interior design"

**Contexto:** Página hub que agrupa alternativas a Excel. Enlaza al post existente "Veta vs Excel presupuestos interiorismo" y a otras comparaciones (Veta vs Programa, vs Monday/Notion). Objetivo: capturar tráfico de quien busca reemplazar Excel sin tener claro qué alternativa específica.

---

## Slug propuesto

- **ES:** `alternativas-excel-presupuestos-interiorismo`
- **EN:** `excel-alternatives-interior-design-budgets`

---

## Respuesta answer-first (una frase para abrir)

**Las alternativas a Excel para presupuestos de interiorismo incluyen herramientas dedicadas como Veta con presupuestos por espacios, control de costes, catálogo de productos, vista cliente pública y PDF profesional; la mejor opción depende de tus necesidades específicas de gestión de proyectos.**

---

## Outline H2

1. **Por qué buscar alternativas a Excel para presupuestos de interiorismo**
2. **Veta: herramienta dedicada con presupuestos por espacios**
3. **Otras alternativas: Programa, Monday, Notion, Houzz Pro** (TODO: verificar características)
4. **Comparativa rápida: qué ofrece Veta vs Excel**
5. **Cuándo quedarse con Excel (y cuándo no)**
6. **Preguntas frecuentes (FAQ)**

---

## Features Veta a destacar (con evidencia código)

1. **Presupuestos por espacios**  
   - Evidencia: `src/components/project-pdf.tsx` (L660-812: itemsBySpace, renderizado por espacio)  
   - Excel: hojas duplicadas por espacio. Veta: estructura nativa.

2. **Control de costes y márgenes automáticos**  
   - Evidencia: `src/modules/app/projects/project-cost-control.tsx` (L260-273, L690-750: totales, margen, desviación %)  
   - Excel: fórmulas frágiles. Veta: cálculos automáticos.

3. **PDF generado desde datos del proyecto**  
   - Evidencia: `src/components/project-pdf.tsx` (L1-915: ProjectPDF)  
   - Excel: exportar a PDF manualmente. Veta: un clic.

4. **Vista cliente pública sin revelar costes internos**  
   - Evidencia: lógica de `is_internal_cost`, token único.  
   - Excel: duplicar archivo "para el cliente". Veta: enlace único.

5. **Catálogo de productos reutilizable**  
   - Excel: copiar/pegar entre archivos. Veta: catálogo compartido entre proyectos.

6. **Pedidos de compra con estado**  
   - Evidencia: `src/modules/app/projects/purchase-order-coverage.ts`  
   - Excel: notas en celdas. Veta: estado por pedido.

7. **Vinculación de pagos a presupuesto y pedidos**  
   - Evidencia: `purchase-order-coverage.ts` (L20-35: pagos asociados)  
   - Excel: hoja separada sin reconciliar. Veta: trazabilidad automática.

---

## FAQ (6-7 preguntas con schema FAQPage)

1. **¿Por qué buscar alternativas a Excel para presupuestos de interiorismo?**  
   Excel no estructura presupuestos por espacios, no calcula márgenes automáticamente, no genera PDF profesional, no ofrece vista cliente pública. Alternativas dedicadas sí.

2. **¿Cuál es la mejor alternativa a Excel para interiorismo?**  
   Veta ofrece gestión internacional con control de costes, catálogo, PDF y vista cliente. Planes desde gratuito (Base, 1 proyecto) hasta Pro/Studio (desde 25 EUR/mes).

3. **¿Puedo seguir usando Excel y complementarlo con otra herramienta?**  
   Sí, pero duplicas trabajo. Mejor centralizar presupuesto, costes y pagos en una herramienta que ya estructure todo.

4. **¿Las alternativas a Excel son más caras?**  
   Veta Base es gratis (1 proyecto). Pro desde 25 EUR/mes (5 proyectos). Otras herramientas: TODO verificar precios.

5. **¿Qué alternativa genera PDF de presupuesto automáticamente?**  
   Veta sí (project-pdf.tsx). Monday/Notion no (tendrías que exportar a Excel → PDF). Programa: verificar (TODO).

6. **¿Puedo migrar presupuestos de Excel a Veta?**  
   Sí. No hay importación automática CSV, pero puedes trasladar datos manualmente a la estructura de Veta (partidas, productos, importes). Ver post "Veta vs Excel" para detalles.

7. **¿Cuándo tiene sentido quedarse con Excel?**  
   Si solo haces 1-2 proyectos al año, muy simples, sin equipo. Para más de eso, una herramienta dedicada ahorra tiempo y errores.

---

## Links internos (clave para hub)

- `/blog/veta-vs-excel-presupuestos-interiorismo` — **Post existente** (artículo pilar)
- Brief #1: `/veta-vs-programa-gestion-interiorismo` — Comparación Veta vs Programa
- Brief #2: `/veta-vs-monday-notion-herramientas-genericas` — Veta vs Monday/Notion
- Brief #8: `/veta-vs-houzz-pro-gestion-proyectos` — Veta vs Houzz Pro
- `/pricing` — Precios Veta
- `/plan-base-primer-proyecto-interiorismo` — Plan Base (gratis, alternativa directa a Excel)

---

## CTA

**Primario:** "Prueba Veta gratis — alternativa a Excel con presupuestos por espacios, costes y PDF"  
**Secundario:** "Leer: Veta vs Excel (guía completa)" → `/blog/veta-vs-excel-presupuestos-interiorismo`

---

## Visual (para Veta Designer)

**Tipo:** Comparativa visual o diagrama.  
**Sugerencia:** Excel (hojas duplicadas, fórmulas frágiles) → Veta (dashboard unificado, presupuestos por espacios, PDF automático).  
**Sin texto en imágenes.**

---

## SEO/AEO checklist

- [ ] Intención: informacional (alternativas disponibles) + transaccional suave (Veta como opción)
- [ ] Keywords: "alternativas Excel presupuestos", "reemplazar Excel interiorismo", "software presupuestos diseño interior", "mejor que Excel"
- [ ] H1 claro, H2 escaneables, tabla comparativa, enlaces a artículos relacionados
- [ ] E-E-A-T: reconocer que Excel es útil para proyectos muy simples; explicar cuándo una herramienta dedicada compensa
- [ ] Enlazado interno: **hub conecta post existente Veta vs Excel + briefs de comparaciones** (estrategia hub-and-spoke)
- [ ] FAQPage schema (7 preguntas)
- [ ] GEO: respuesta answer-first con lista de alternativas, afirmaciones delimitadas por herramienta, tabla comparativa honesta

---

## Tabla comparativa — Alternativas a Excel

| Característica | Excel | Veta | Otras alternativas |
|----------------|-------|------|--------------------|
| **Propósito** | Hoja de cálculo genérica | Interiorismo dedicado | TODO verificar Programa, Monday, Notion, Houzz Pro |
| **Presupuestos por espacios** | Manual (hojas duplicadas) | Sí (nativo, project-pdf.tsx L660-812) | TODO verificar |
| **Costes y márgenes automáticos** | Fórmulas manuales | Sí (cost-control.tsx L260-273, L690-750) | TODO verificar |
| **PDF profesional** | Exportar manualmente | Sí (project-pdf.tsx L1-915) | TODO verificar |
| **Vista cliente pública** | Duplicar archivo | Sí (token único, /view-project) | TODO verificar |
| **Catálogo de productos** | No | Sí (reutilizable) | TODO verificar |
| **Pedidos de compra** | No | Sí (con estado, purchase-order-coverage.ts) | TODO verificar |
| **Precio desde** | Gratis (licencia Office) | Gratis (Base) / 25 EUR/mes (Pro) | TODO verificar |

**Nota:** Características de Veta verificadas con código. Para otras alternativas, verificar desde webs oficiales con URL y fecha de acceso antes de publicar.

---

## Estrategia hub-and-spoke

Esta página es un **hub** que enlaza:
- **Post existente:** `/blog/veta-vs-excel-presupuestos-interiorismo` (artículo pilar, 1.000+ palabras, ya publicado)
- **Briefs de comparaciones** (cuando se publiquen): Veta vs Programa, vs Monday/Notion, vs Houzz Pro

**Objetivo SEO/AEO:** capturar tráfico genérico "alternativas Excel" y distribuir hacia artículos específicos según intención del usuario (Programa si busca facturación ES, Monday/Notion si busca genérico, Houzz Pro si viene de CRM).

---

## Tono

Objetivo y educativo. Reconocer que **Excel es una herramienta válida para proyectos muy simples**. Explicar **cuándo una alternativa dedicada compensa** (varios proyectos, equipo, control de costes, vista cliente). No forzar Veta como única opción; presentar el panorama completo y dejar que el lector decida según su caso.
