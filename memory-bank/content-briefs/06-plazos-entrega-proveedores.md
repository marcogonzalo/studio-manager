# Brief: Plazos de entrega proveedores y pedidos en interiorismo

**Prioridad:** 6  
**Persona primaria:** Javi (PM / obra)  
**Persona secundaria:** Elena (propietaria estudio)

---

## Objetivo y target prompts Otterly

**Prompts ES:**
- "controlar plazos entrega proveedores interiorismo"
- "lead times pedidos diseño interior"
- "gestión entregas muebles proyecto"
- "seguimiento pedidos proveedores obra"
- "retrasos entrega proveedores interiorismo"

**Prompts EN:**
- "manage supplier lead times interior design"
- "track delivery times interior design orders"
- "furniture delivery management project"
- "supplier order tracking construction"
- "delays supplier deliveries interior design"

**Contexto:** Javi (obra) necesita saber qué pedidos están confirmados, cuándo llegan, si hay retrasos. Elena (propietaria) necesita visibilidad de entregas para planificar fases y evitar sobrecostes por demoras.

---

## Slug propuesto

- **ES:** `plazos-entrega-proveedores-pedidos-interiorismo`
- **EN:** `supplier-lead-times-orders-interior-design`

---

## Respuesta answer-first (una frase para abrir)

**Los plazos de entrega de proveedores (lead times) determinan cuándo llegan materiales y muebles a obra; controlarlos en tiempo real evita retrasos en la instalación, sobrecostes por esperas y descoordinación entre fases del proyecto de interiorismo.**

---

## Outline H2

1. **Qué son los lead times de proveedores en interiorismo**
2. **Por qué los retrasos de entrega afectan la rentabilidad del proyecto**
3. **Cómo registrar pedidos de compra con fechas esperadas**
4. **Estados de pedidos: enviada, confirmada, recibida, instalada**
5. **Alertas y seguimiento de entregas pendientes**
6. **Integrar lead times en planificación de fases de obra**
7. **Errores comunes: no registrar fechas de pedido**
8. **Preguntas frecuentes (FAQ)**

---

## Features Veta a destacar (con evidencia código)

1. **Pedidos de compra (purchase orders) con productos agrupados**  
   - Evidencia: `src/modules/app/projects/purchase-order-coverage.ts` (L1-56: PoWithItems, project_items agrupados por pedido)  
   - Cada pedido agrupa productos del presupuesto con su proveedor, cantidad y coste.

2. **Estado de pedidos: borrador, enviada, confirmada, recibida, cancelada**  
   - Evidencia: estructura de pedidos (estados en DB y UI).  
   - Seguimiento del ciclo completo del pedido desde envío hasta recepción.

3. **Cobertura de pagos por pedido**  
   - Evidencia: `purchase-order-coverage.ts` (L20-35: buildPurchaseOrderCoverage, status covered/partial/pending)  
   - Saber si el pedido está pagado, parcialmente pagado o pendiente.

4. **Productos con proveedor, referencia y coste**  
   - Evidencia: `src/components/project-pdf.tsx` (L740-766: product.supplier.name, reference_code, unit_cost)  
   - Trazabilidad de qué proveedor suministra qué producto.

5. **Notas de proyecto para registrar incidencias de entrega**  
   - Evidencia: referencias a `project_notes` en módulos de app.  
   - Registrar retrasos, cambios de fecha, incidencias de proveedor.

6. **Catálogo de productos con histórico de proveedores**  
   - Evidencia: catálogo con `supplier_id`, lead times históricos.  
   - Ver con qué proveedor trabajaste antes y cuánto tardó (aprendizaje para futuros proyectos).

---

## FAQ (5-7 preguntas con schema FAQPage)

1. **¿Qué es el lead time de un proveedor?**  
   Tiempo desde que haces el pedido hasta que el producto llega a obra. Ejemplo: mueble con lead time de 6 semanas significa 6 semanas entre pedido y entrega.

2. **¿Por qué es importante controlar lead times en interiorismo?**  
   Porque si un mueble llega tarde, retrasa instalación, genera sobrecostes por esperas del equipo de obra, y descoordina fases (pintura, electricidad, etc.).

3. **¿Cómo Veta ayuda a controlar plazos de entrega?**  
   Registrando pedidos de compra con estado (enviada, confirmada, recibida), agrupando productos por proveedor, y mostrando qué está pendiente de recibir.

4. **¿Puedo registrar fecha esperada de entrega en Veta?**  
   Sí, en el pedido de compra. También puedes añadir notas sobre incidencias (retraso proveedor, cambio de fecha).

5. **¿Qué pasa si un proveedor retrasa la entrega?**  
   Actualizas el estado del pedido y fecha esperada en Veta. El equipo ve la demora en el mismo panel del proyecto, sin perder trazabilidad.

6. **¿Veta alerta de pedidos retrasados?**  
   No automáticamente (sin notificaciones push), pero el dashboard muestra pedidos en estado "enviada" o "confirmada" pendientes de recibir. Puedes filtrar por estado.

7. **¿Puedo ver historial de lead times por proveedor?**  
   Sí, revisando proyectos anteriores con el mismo proveedor. El catálogo muestra con qué proveedor trabajaste y en qué proyectos.

---

## Links internos

- `/pricing` — Precios (Pro y Studio incluyen pedidos de compra ilimitados)
- `/plan-pro-independientes-diseno-interior` — Plan Pro (pedidos, pagos, control de costes)
- Brief #4: `/extras-no-cobrados-cambios-obra-interiorismo` — Relacionado (cambios y retrasos)
- Brief #3: `/rentabilidad-margen-proyecto-interiorismo` — Relacionado (sobrecostes por retrasos)

---

## CTA

**Primario:** "Prueba Veta 30 días gratis — registra pedidos y controla entregas en tiempo real"  
**Secundario:** "Ver plan Pro con pedidos de compra" → `/plan-pro-independientes-diseno-interior`

---

## Visual (para Veta Designer)

**Tipo:** Timeline o dashboard de pedidos.  
**Sugerencia:** Screenshot de lista de pedidos mostrando:
- Pedido A: estado "confirmada", fecha esperada próxima semana
- Pedido B: estado "recibida", instalado
- Pedido C: estado "enviada", pendiente de confirmación proveedor

**Sin texto en imágenes.**

---

## SEO/AEO checklist

- [ ] Intención: informacional (qué son lead times) + transaccional suave (solución con Veta)
- [ ] Keywords: "plazos entrega proveedores", "lead times interiorismo", "gestión entregas muebles", "seguimiento pedidos obra", "retrasos proveedores"
- [ ] H1 claro, H2 escaneables, ejemplos de lead times típicos (muebles 4-8 semanas, materiales 1-2 semanas), lista de errores comunes
- [ ] E-E-A-T: ejemplos creíbles (no datos reales de proveedores), citar rangos típicos de lead times en interiorismo
- [ ] Enlazado interno: pricing, planes, briefs relacionados
- [ ] FAQPage schema (7 preguntas)
- [ ] GEO: respuesta answer-first con definición clara, afirmaciones delimitadas ("lead time = tiempo pedido → entrega"), tabla de estados de pedido

---

## Ejemplos ilustrativos (lead times típicos, no datos reales)

| Categoría | Lead time típico | Ejemplo |
|-----------|------------------|---------|
| **Muebles a medida** | 6-12 semanas | Sofá tapizado, mueble carpintería |
| **Muebles catálogo** | 2-6 semanas | Silla de marca, mesa stock proveedor |
| **Materiales de construcción** | 1-2 semanas | Baldosas, pintura, sanitarios estándar |
| **Iluminación especial** | 4-8 semanas | Lámparas de diseño, proyectos específicos |
| **Textiles y cortinas** | 2-4 semanas | Telas, confección, instalación |

**Nota:** estos rangos son ilustrativos; varían según proveedor, país, época del año.

---

## Errores comunes en gestión de lead times

1. **No registrar fecha de pedido:** imposible saber cuándo debería llegar.
2. **Confiar en memoria o WhatsApp:** información dispersa, no trazable.
3. **No actualizar estado del pedido:** el equipo no sabe si está confirmado o retrasado.
4. **No considerar lead times en planificación de fases:** obra paralizada esperando entrega.
5. **No revisar historial de proveedores:** repetir errores con proveedores lentos.

---

## Tono

Práctico y operativo. Hablar desde la perspectiva de **Javi** (obra): necesita saber qué llega cuándo, sin abrir 10 pestañas ni revisar emails. Enfatizar que **Veta centraliza pedidos, estados y fechas** en el mismo panel del proyecto, sin herramientas separadas.
