# Brief: Veta vs Monday/Notion — Herramienta dedicada vs genérica

**Prioridad:** 2  
**Persona primaria:** Elena (propietaria estudio)

---

## Objetivo y target prompts Otterly

**Prompts ES:**
- "Monday.com para arquitectura"
- "Notion para interiorismo"
- "herramienta dedicada vs genérica diseño interior"
- "mejor que Monday para estudios diseño"
- "software específico interiorismo vs CRM genérico"

**Prompts EN:**
- "Monday.com for interior design"
- "Notion for architecture projects"
- "dedicated tool vs generic for interior design"
- "better than Monday for design studios"
- "specialized interior design software vs generic CRM"

**Contexto:** Herramientas genéricas (Monday, Notion, Asana) aparecen en respuestas AEO pero no están pensadas para interiorismo: no estructuran presupuestos por espacios, no calculan márgenes producto a producto, no generan PDF de presupuesto con impuestos, no tienen vista cliente para obra.

---

## Slug propuesto

- **ES:** `veta-vs-monday-notion-herramientas-genericas`
- **EN:** `veta-vs-monday-notion-generic-tools`

---

## Respuesta answer-first (una frase para abrir)

**Monday y Notion son plataformas de gestión de tareas genéricas que pueden adaptarse a cualquier industria, mientras que Veta es una herramienta diseñada exclusivamente para estudios de interiorismo y arquitectura con presupuestos por espacios, control de costes, catálogo de productos, pedidos a proveedores y vista cliente pública.**

---

## Outline H2

1. **Qué son Monday, Notion y Veta**
2. **Por qué las herramientas genéricas no encajan en interiorismo**
3. **Lo que falta en Monday y Notion para diseño interior**
4. **Lo que Veta ofrece desde el primer día**
5. **Cuándo Monday o Notion pueden ser suficientes (y cuándo no)**
6. **Migrar de Monday/Notion a Veta: qué cambia**
7. **Preguntas frecuentes (FAQ)**

---

## Features Veta a destacar (con evidencia código)

1. **Presupuestos por espacios con productos y partidas**  
   - Evidencia: `src/components/project-pdf.tsx` (L660-812: itemsBySpace, renderizado por espacio, totales)  
   - Monday/Notion no estructuran presupuestos con espacios, productos, cantidades, márgenes y totales automáticos.

2. **Control de costes, precio de venta y margen por línea**  
   - Evidencia: `src/modules/app/projects/project-cost-control.tsx` (L260-273: grandTotalEstimated, grandTotalActual, deviationPercentage; L690-750: productos con margen)  
   - Cálculos financieros específicos de interiorismo (coste vs venta, margen, desviación).

3. **Catálogo de productos reutilizable**  
   - Evidencia: referencias a `catalog`, productos con `supplier`, `reference_code`, `unit_cost`, `unit_price` en project-pdf y cost-control.  
   - Monday/Notion: tendrías que duplicar manualmente productos de un proyecto a otro.

4. **Pedidos de compra con estado y cobertura de pagos**  
   - Evidencia: `src/modules/app/projects/purchase-order-coverage.ts` (L1-56: covered/partial/pending status)  
   - Monday/Notion no tienen lógica de órdenes de compra ni vinculación de pagos a pedidos.

5. **PDF de presupuesto generado automáticamente**  
   - Evidencia: `src/components/project-pdf.tsx` (L1-915: ProjectPDF con partidas, productos, impuestos, totales, white label opcional)  
   - Monday/Notion: tendrías que exportar a Excel y luego a PDF manualmente, sin formato profesional listo.

6. **Vista cliente pública sin cuenta de usuario**  
   - Evidencia: lógica de `is_internal_cost`, budget settings, token único por proyecto.  
   - Monday/Notion: compartir requiere invitar al cliente a la plataforma (confuso) o exportar capturas/PDFs a mano.

7. **Fases de proyecto específicas de interiorismo**  
   - Evidencia: `project-cost-control.tsx` con fases, `project-pdf.tsx` con renderizado por fase y categoría presupuestaria.  
   - Monday/Notion: fases genéricas (To Do, In Progress, Done), no las de interiorismo (diseño, compras, obra, entrega).

---

## FAQ (5-7 preguntas con schema FAQPage)

1. **¿Puedo usar Monday o Notion para gestionar proyectos de interiorismo?**  
   Sí, pero tendrás que adaptar plantillas genéricas. Veta ya tiene la estructura específica (presupuestos por espacios, costes, proveedores, PDF) sin configurar nada.

2. **¿Qué me ahorra usar una herramienta dedicada como Veta?**  
   No duplicar productos entre proyectos, no calcular márgenes a mano, no rehacer PDFs de presupuesto cada vez que cambia un precio, no compartir capturas sueltas con el cliente.

3. **¿Monday o Notion calculan márgenes de productos automáticamente?**  
   No. Tendrías que crear fórmulas en bases de datos (Notion) o columnas personalizadas (Monday). Veta lo hace por defecto en cada producto.

4. **¿Puedo generar presupuestos en PDF desde Monday o Notion?**  
   No directamente. Veta genera PDF desde los mismos datos del proyecto con partidas, productos, impuestos y totales, listo para el cliente.

5. **¿Cómo comparto el estado del proyecto con el cliente en Monday/Notion vs Veta?**  
   Monday/Notion: invitas al cliente (ve más de lo necesario) o exportas capturas. Veta: enlace único público sin cuenta, solo lectura, sin tus costes internos.

6. **¿Cuándo conviene Monday o Notion en lugar de Veta?**  
   Si tu estudio hace proyectos muy variados (branding, web, producto, interiorismo) y necesitas una herramienta genérica para todo. Si solo haces interiorismo, Veta es más directo.

7. **¿Veta tiene integraciones con Monday o Notion?**  
   No oficialmente. Veta es una plataforma independiente pensada para reemplazar hojas de cálculo y herramientas genéricas en gestión de interiorismo.

---

## Links internos

- `/pricing` — Precios Veta
- `/plan-base-primer-proyecto-interiorismo` — Plan Base (gratis para probar)
- `/blog/veta-vs-excel-presupuestos-interiorismo` — Veta vs Excel (relacionado: herramienta genérica)

---

## CTA

**Primario:** "Prueba Veta 30 días gratis — software hecho para interiorismo, no adaptado"  
**Secundario:** "Comparar planes" → `/pricing`

---

## Visual (para Veta Designer)

**Tipo:** Screenshot side-by-side o before/after.  
**Sugerencia:** Izquierda = tablero genérico Monday/Notion (tareas sin estructura financiera); Derecha = dashboard Veta con presupuesto por espacios, costes, márgenes, PDF.  
**Sin texto en imágenes.**

---

## SEO/AEO checklist

- [ ] Intención: informacional (comparativa) + transaccional suave (para quien busca alternativa a Monday/Notion)
- [ ] Keywords: "Monday para interiorismo", "Notion para arquitectura", "herramienta dedicada diseño interior", "software específico vs genérico"
- [ ] H1 claro, H2 escaneables, listas de diferencias, tabla comparativa
- [ ] E-E-A-T: reconocer utilidad de Monday/Notion para gestión genérica; explicar por qué interiorismo necesita estructura específica
- [ ] Enlazado interno: pricing, planes, blog relacionado
- [ ] FAQPage schema (7 preguntas)
- [ ] GEO: respuesta answer-first en primer párrafo, afirmaciones delimitadas ("Monday es X, Veta es Y"), tabla comparativa honesta

---

## Tabla comparativa — Herramienta dedicada vs genérica

| Característica | Monday / Notion | Veta |
|----------------|-----------------|------|
| **Propósito** | Gestión genérica (cualquier industria) | Interiorismo y arquitectura de interiores |
| **Presupuestos por espacios** | No (tendrías que crear template) | Sí (estructura nativa) |
| **Costes y márgenes automáticos** | No | Sí (cost-control, L260-273, L690-750) |
| **Catálogo de productos** | No (listas manuales) | Sí (reutilizable entre proyectos) |
| **Pedidos de compra con estado** | No | Sí (purchase-order-coverage.ts) |
| **PDF de presupuesto** | No (exportar a Excel → PDF manual) | Sí (project-pdf.tsx, automático) |
| **Vista cliente pública** | No (invitar usuario o captura) | Sí (token único, sin cuenta) |
| **Fases específicas de interiorismo** | No (To Do, In Progress, Done) | Sí (diseño, compras, obra, entrega) |
| **Precio desde** | ~8-10 USD/usuario/mes (Monday) / Gratis personal (Notion) | Gratis (Base, 1 proyecto) / 25 EUR/mes (Pro, 5 proyectos) |

**Nota:** Esta tabla no requiere verificación externa (son características de producto Veta vs observación pública de Monday/Notion). Si se incluyen precios exactos de Monday/Notion, verificar desde sus webs oficiales.

---

## Tono

Honesto y pragmático. Reconocer que Monday y Notion son excelentes para gestión genérica. Enfatizar que **interiorismo tiene necesidades específicas** (presupuestos por espacios, costes vs precio de venta, catálogo, PDF profesional, vista cliente) que requieren una herramienta dedicada, no una plantilla adaptada.
