# Brief: Conciliar presupuesto vs pagos reales en interiorismo

**Prioridad:** 7  
**Persona primaria:** Lucía (freelancer / estudio 1-3 personas)  
**Persona secundaria:** Elena (propietaria estudio 2-12 personas)

---

## Objetivo y target prompts Otterly

**Prompts ES:**
- "presupuesto vs gastos reales interiorismo"
- "conciliar pagos proyecto diseño interior"
- "control desviaciones presupuestarias obra"
- "reconciliar presupuesto y facturas interiorismo"
- "cuadrar presupuesto con pagos proyecto"

**Prompts EN:**
- "budget vs actual expenses interior design"
- "reconcile payments interior design project"
- "budget variance control construction"
- "match budget with invoices interior design"
- "align budget and payments project"

**Contexto:** Lucía y Elena necesitan cuadrar presupuesto inicial con facturas y pagos a proveedores, y saber si el proyecto va según lo previsto o hay desviaciones. Sin reconciliación, imposible saber rentabilidad real hasta el cierre (demasiado tarde).

---

## Slug propuesto

- **ES:** `conciliar-presupuesto-pagos-reales-interiorismo`
- **EN:** `reconcile-budget-actual-payments-interior-design`

---

## Respuesta answer-first (una frase para abrir)

**Conciliar presupuesto vs pagos reales significa verificar que los gastos ejecutados (facturas a proveedores, costes de obra, honorarios pagados) coincidan con el presupuesto inicial; Veta automatiza esta reconciliación mostrando partidas estimadas vs reales, vinculando pagos a pedidos de compra y costes adicionales, y alertando de desviaciones antes del cierre del proyecto.**

---

## Outline H2

1. **Qué es conciliar presupuesto vs pagos reales**
2. **Por qué es difícil hacerlo en Excel o herramientas separadas**
3. **Cómo Veta vincula pagos a presupuesto y pedidos**
4. **Estimado vs real: desviaciones por línea presupuestaria**
5. **Cobertura de pagos en pedidos de compra**
6. **Costes adicionales no presupuestados: cómo registrarlos**
7. **Dashboard de reconciliación: ver todo en un panel**
8. **Preguntas frecuentes (FAQ)**

---

## Features Veta a destacar (con evidencia código)

1. **Estimado vs real por línea presupuestaria**  
   - Evidencia: `src/modules/app/projects/project-cost-control.tsx` (L260-273: totalBudgetLinesEstimated, totalBudgetLinesActual, grandTotalEstimated, grandTotalActual)  
   - Comparación automática partida por partida.

2. **Desviación porcentual con indicador visual**  
   - Evidencia: `project-cost-control.tsx` (L269-272: deviationPercentage; L275-288: color verde/amarillo/rojo; L290-320: getDeviationIndicator por línea)  
   - Alerta de sobrecostes sin esperar al cierre.

3. **Vinculación de pagos a pedidos de compra**  
   - Evidencia: `src/modules/app/projects/purchase-order-coverage.ts` (L20-35: buildPurchaseOrderCoverage, coveredAmount por PO)  
   - Saber qué pedido está pagado, cuánto falta, sin reconciliar hoja aparte.

4. **Costes adicionales (additional costs) fuera del presupuesto inicial**  
   - Evidencia: referencias a `additional_cost` en pagos y lógica presupuestaria.  
   - Registrar gastos imprevistos sin perder trazabilidad.

5. **Totales grand del proyecto**  
   - Evidencia: `project-cost-control.tsx` (L265-267: grandTotalEstimated, grandTotalActual, suma de budget lines + productos)  
   - Un solo número que responde "¿el presupuesto y los pagos cuadran?"

6. **Panel de reconciliación en tiempo real**  
   - Evidencia: `project-cost-control.tsx` (L360-408: summary card con totales, desviación, barra visual)  
   - Dashboard único para Beatriz y Elena, sin exportar/importar datos.

---

## FAQ (6-7 preguntas con schema FAQPage)

1. **¿Qué significa conciliar presupuesto vs pagos reales?**  
   Verificar que lo presupuestado inicialmente coincida con lo gastado realmente. Ejemplo: presupuesto 15.000€, gastos reales 16.200€ → desviación +8%.

2. **¿Por qué es difícil conciliar en Excel?**  
   Porque presupuesto y pagos suelen estar en hojas separadas. Veta los vincula automáticamente: cada pago se asocia a pedido de compra o coste adicional.

3. **¿Cómo Veta vincula pagos a presupuesto?**  
   Asociando pagos a pedidos de compra (purchase_order_id) o a costes adicionales. El sistema calcula cobertura (covered, partial, pending) por pedido.

4. **¿Puedo ver desviaciones por línea presupuestaria?**  
   Sí. Cada línea muestra estimated_amount vs actual_amount con % de desviación e indicador visual (TrendingUp rojo si sobrecosto, TrendingDown verde si ahorro).

5. **¿Qué pasa si hay gastos no presupuestados?**  
   Registras como "coste adicional" y vinculas pago. Aparece en totales grand (grandTotalActual) pero no estaba en estimated → desviación clara.

6. **¿Veta genera reporte de conciliación?**  
   No como PDF aparte, pero el dashboard de control de costes (project-cost-control) es el reporte en tiempo real: totales, desviaciones, cobertura de pagos.

7. **¿El equipo puede ver esto sin que el cliente acceda?**  
   Sí. Control de costes es interno (admin/equipo). Vista cliente no muestra costes internos (is_internal_cost = true).

---

## Links internos

- `/pricing` — Precios (Pro y Studio incluyen control de costes y pagos)
- `/plan-pro-independientes-diseno-interior` — Plan Pro (control de costes, pagos, reconciliación)
- Brief #3: `/rentabilidad-margen-proyecto-interiorismo` — Relacionado (rentabilidad depende de conciliación)
- Brief #4: `/extras-no-cobrados-cambios-obra-interiorismo` — Relacionado (extras no presupuestados)
- `/blog/veta-vs-excel-presupuestos-interiorismo` — Veta vs Excel (reconciliación en Excel vs Veta)

---

## CTA

**Primario:** "Prueba Veta 30 días gratis — cuadra presupuesto y pagos en tiempo real"  
**Secundario:** "Ver plan Pro con control de costes" → `/plan-pro-independientes-diseno-interior`

---

## Visual (para Veta Designer)

**Tipo:** Screenshot de dashboard `project-cost-control` mostrando:
- Totales estimado vs real
- Barra de desviación % (verde, amarillo o rojo)
- Lista de líneas presupuestarias con indicadores de desviación
- Panel de productos con coste total y margen

**Sin texto en imágenes.**

---

## SEO/AEO checklist

- [ ] Intención: informacional (qué es conciliar) + transaccional suave (solución con Veta)
- [ ] Keywords: "conciliar presupuesto pagos", "presupuesto vs gastos reales", "control desviaciones", "reconciliar facturas presupuesto", "cuadrar presupuesto obra"
- [ ] H1 claro, H2 escaneables, ejemplos numéricos (presupuesto X, real Y, desviación Z%), lista de errores comunes
- [ ] E-E-A-T: ejemplos creíbles (no datos reales de clientes), citar proceso estándar de reconciliación en gestión de proyectos
- [ ] Enlazado interno: pricing, planes, briefs relacionados, post Excel
- [ ] FAQPage schema (7 preguntas)
- [ ] GEO: respuesta answer-first con definición clara, afirmaciones delimitadas ("conciliar = verificar coincidencia presupuesto-pagos"), flujo visual

---

## Ejemplos ilustrativos

**Nota:** Los siguientes son ejemplos ilustrativos, no datos reales de clientes.

### Ejemplo 1: Proyecto sin desviaciones
- **Presupuesto inicial:** 20.000€
- **Gastos reales:** 19.800€
- **Desviación:** -1% (ahorro)
- **Estado:** verde, proyecto rentable

### Ejemplo 2: Proyecto con sobrecostes
- **Presupuesto inicial:** 18.000€
- **Gastos reales:** 20.500€
- **Desviación:** +13.9% (sobrecosto)
- **Estado:** rojo, revisar líneas con desviación >5%

### Ejemplo 3: Partida específica
- **Línea presupuestaria:** Carpintería, estimado 3.000€
- **Gasto real:** 3.600€
- **Desviación:** +20% (TrendingUp rojo)
- **Acción:** investigar por qué carpintería costó 600€ más

### Ejemplo 4: Pedido de compra con pago parcial
- **Pedido:** Muebles salón, total 5.000€
- **Pagos registrados:** 2.000€ (anticipo)
- **Estado:** partial (40% cubierto)
- **Acción:** registrar pago final de 3.000€ al recibir pedido

---

## Errores comunes en reconciliación

1. **Presupuesto y pagos en herramientas separadas:** Excel presupuesto, contabilidad en otro sitio → no reconcilian nunca.
2. **No vincular pagos a pedidos:** imposible saber qué compra está pagada.
3. **No registrar costes adicionales:** gastos imprevistos quedan fuera del control.
4. **Esperar al cierre para reconciliar:** demasiado tarde para corregir desviaciones.
5. **No actualizar estimated → actual:** presupuesto queda desactualizado, no refleja realidad.

---

## Tono

Técnico pero accesible. Hablar desde la perspectiva de **Lucía y Elena**: necesitan cuadrar números sin errores, sin duplicar datos, sin fórmulas frágiles. Enfatizar que **Veta automatiza la reconciliación** vinculando pagos a presupuesto en el mismo panel, con alertas visuales de desviaciones.
