# Brief: Extras no cobrados / Change orders en interiorismo

**Prioridad:** 4  
**Persona primaria:** Lucía (freelancer / estudio 1-3 personas)  
**Persona secundaria:** Javi (PM / obra)

---

## Objetivo y target prompts Otterly

**Prompts ES:**
- "cómo evitar extras sin cobrar interiorismo"
- "change orders diseño interior"
- "control cambios obra sin perder dinero"
- "gestión de cambios proyecto interiorismo"
- "facturar extras cliente interiorismo"

**Prompts EN:**
- "how to avoid unbilled extras interior design"
- "change orders interior design"
- "change management interior design projects"
- "bill extras to client interior design"
- "prevent unbilled change orders"

**Contexto:** Lucía y Elena pierden dinero cuando olvidan cobrar cambios del cliente. Javi (obra) registra cambios pero no siempre llegan al presupuesto. Necesitan sistema para capturar y registrar extras sin perder el hilo.

---

## Slug propuesto

- **ES:** `extras-no-cobrados-cambios-obra-interiorismo`
- **EN:** `unbilled-extras-change-orders-interior-design`

---

## Respuesta answer-first (una frase para abrir)

**Los extras no cobrados (change orders) ocurren cuando un cliente solicita cambios durante la obra —materiales distintos, ampliación de alcance, modificaciones de diseño— y el estudio ejecuta el trabajo sin actualizar el presupuesto; Veta ayuda a prevenirlos registrando cambios como partidas adicionales con descripción, fase y coste, visibles tanto para el equipo como en la vista cliente.**

---

## Outline H2

1. **Qué son los extras o change orders en interiorismo**
2. **Por qué los estudios pierden dinero con extras no cobrados**
3. **Errores comunes: confiar en la memoria o en WhatsApp**
4. **Cómo registrar cambios en Veta sin perder trazabilidad**
5. **Del cambio al presupuesto: actualizar líneas y costes**
6. **Vista cliente: mostrar extras en el proyecto**
7. **Control de costes adicionales vinculados a pedidos**
8. **Preguntas frecuentes (FAQ)**

---

## Features Veta a destacar (con evidencia código)

1. **Líneas presupuestarias adicionales (budget lines)**  
   - Evidencia: `src/modules/app/projects/project-cost-control.tsx` (L150-160: budgetLines, dialog para añadir/editar líneas; L224-237: handleAddBudgetLine, handleEditBudgetLine)  
   - Permite añadir partidas nuevas (extras, cambios) sin editar el presupuesto original.

2. **Descripción y fase por línea**  
   - Evidencia: `project-cost-control.tsx` (L543-547: line.description; L545-547: line.phase, phaseLabel)  
   - Registrar qué cambió, en qué fase (diseño, compras, obra), con nota explicativa.

3. **Estado de líneas presupuestarias**  
   - Evidencia: estructura de `ProjectBudgetLine` (subcategory, estimated_amount, actual_amount, is_internal_cost, phase).  
   - Diferenciar cambios aprobados (actual_amount > 0) de pendientes (estimated_amount sin actual).

4. **Visibilidad cliente (is_internal_cost = false)**  
   - Evidencia: `project-cost-control.tsx` (L520-523, L570-580: is_internal_cost, ícono Eye/EyeOff)  
   - Mostrar extras al cliente en vista pública y PDF; ocultar costes internos de gestión del cambio.

5. **Costes adicionales (additional costs)**  
   - Evidencia: referencias a `additional_cost` en pagos y lógica de presupuesto.  
   - Registrar gastos imprevistos (extras materiales, servicios urgentes) fuera del presupuesto inicial.

6. **Vinculación de pagos a extras**  
   - Evidencia: `src/modules/app/projects/purchase-order-coverage.ts` (L20-35: pagos asociados a purchase_order_id o coste adicional)  
   - Seguir si el extra ya está pagado, pendiente de cobro al cliente, o pendiente de pago a proveedor.

7. **PDF actualizable con extras**  
   - Evidencia: `src/components/project-pdf.tsx` (L1-915: budget lines incluidos en PDF, sumados en totales)  
   - Generar PDF con presupuesto original + extras aprobados en un solo documento.

---

## FAQ (5-7 preguntas con schema FAQPage)

1. **¿Qué es un extra o change order en un proyecto de interiorismo?**  
   Cualquier cambio solicitado por el cliente después de aprobar el presupuesto inicial: material distinto, ampliación de alcance, cambio de diseño. Si no se registra y cobra, el estudio pierde dinero.

2. **¿Por qué los extras no se cobran?**  
   Porque se olvidan (memoria, WhatsApp), no se actualizan en el presupuesto, o se registran en notas sueltas sin flujo de aprobación.

3. **¿Cómo Veta ayuda a registrar extras?**  
   Añadiendo líneas presupuestarias nuevas con descripción, fase, coste estimado y actual. Visibles para el equipo y, si se marca, para el cliente en PDF y vista pública.

4. **¿Puedo mostrar un extra al cliente?**  
   Sí. Creas la línea presupuestaria con estimated_amount, la marcas visible al cliente (is_internal_cost = false), y aparece en vista pública y PDF. El cliente puede consultarlo pero no hay flujo de aprobación digital dentro de Veta.

5. **¿Cómo sé si un extra está registrado?**  
   Vinculando pagos a la línea presupuestaria o al coste adicional. Veta muestra cobertura de pagos (covered, partial, pending) igual que en pedidos de compra.

6. **¿Puedo ocultar extras internos al cliente?**  
   Sí. Marca la línea como is_internal_cost = true. Solo tu equipo la ve; no aparece en PDF ni vista pública.

7. **¿Qué pasa si olvido añadir un extra antes del cierre?**  
   Pierdes el margen de esa partida. Por eso Veta permite añadir líneas en cualquier fase del proyecto, con descripción y justificación.

---

## Links internos

- `/pricing` — Precios (Pro y Studio incluyen líneas presupuestarias ilimitadas)
- `/plan-pro-independientes-diseno-interior` — Plan Pro (control de cambios y costes)
- `/blog/veta-vs-excel-presupuestos-interiorismo` — Post relacionado (extras en Excel vs Veta)
- Artículo futuro: "Conciliar presupuesto vs pagos reales" (relacionado, brief #7)

---

## CTA

**Primario:** "Prueba Veta 30 días gratis — registra extras antes de que se olviden"  
**Secundario:** "Ver plan Pro con control de cambios" → `/plan-pro-independientes-diseno-interior`

---

## Visual (para Veta Designer)

**Tipo:** Before/after o flujo visual.  
**Sugerencia:**
- Antes: notas sueltas, WhatsApp, Excel con celda de "extras" sin detallar.
- Después: Screenshot de Veta añadiendo línea presupuestaria con descripción, fase, coste, estado; y vista cliente mostrando el extra pendiente de aprobación.

**Sin texto en imágenes.**

---

## SEO/AEO checklist

- [ ] Intención: informacional (qué son change orders) + transaccional suave (solución con Veta)
- [ ] Keywords: "extras no cobrados", "change orders interiorismo", "gestión cambios obra", "facturar extras cliente", "control cambios presupuesto"
- [ ] H1 claro, H2 escaneables, lista de errores comunes, flujo de aprobación
- [ ] E-E-A-T: ejemplos creíbles (sin datos reales de clientes), citar proceso estándar de change orders en construcción/interiorismo
- [ ] Enlazado interno: pricing, planes Pro/Studio, blog relacionado
- [ ] FAQPage schema (7 preguntas)
- [ ] GEO: respuesta answer-first con definición clara, afirmaciones delimitadas ("extra = cambio no presupuestado inicialmente"), flujo visual

---

## Ejemplos ilustrativos

**Nota:** Los siguientes son ejemplos ilustrativos, no datos reales de clientes.

### Ejemplo 1: Extra registrado
- **Cliente solicita:** cambiar encimera de granito a cuarzo (+800 €)
- **Registro en Veta:** nueva línea presupuestaria "Encimera cuarzo (cambio)", categoría construcción, subcategoría "otro", fase obra, estimated_amount 800 €, visible al cliente.
- **Resultado:** cliente ve extra en vista pública, se actualiza presupuesto y PDF, actual_amount 800 € cuando se ejecuta.

### Ejemplo 2: Extra olvidado (sin Veta)
- **Cliente solicita por WhatsApp:** añadir apliques en pasillo (+200 €)
- **Sin registro:** obra se hace, no se actualiza presupuesto, no se cobra.
- **Resultado:** estudio pierde 200 € de margen.

### Ejemplo 3: Extra interno (no visible al cliente)
- **Estudio añade:** coste de gestoría para trámite extra (+150 €)
- **Registro:** is_internal_cost = true, no aparece en PDF ni vista cliente.
- **Resultado:** equipo sabe que hay un coste adicional, cliente no lo ve, se absorbe en honorarios generales.

---

## Tono

Pragmático y empático. Reconocer que **extras olvidados son un problema común** (no falta de disciplina, sino falta de sistema). Enfatizar que **Veta ofrece flujo claro** (registrar → mostrar al cliente → aprobar → cobrar) sin depender de memoria o mensajes dispersos.
