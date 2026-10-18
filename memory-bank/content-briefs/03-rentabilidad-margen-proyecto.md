# Brief: Rentabilidad y margen por proyecto de interiorismo

**Prioridad:** 3  
**Persona primaria:** Elena (propietaria estudio)  
**Persona secundaria:** Beatriz (ops/admin)

---

## Objetivo y target prompts Otterly

**Prompts ES:**
- "cómo calcular rentabilidad proyecto interiorismo"
- "margen por proyecto diseño interior"
- "control costes vs ingresos obra"
- "saber si proyecto interiorismo es rentable"
- "margen bruto proyecto arquitectura"

**Prompts EN:**
- "how to calculate profitability interior design project"
- "profit margin per interior design project"
- "cost vs revenue control interior design"
- "know if interior design project is profitable"
- "gross margin architecture project"

**Contexto:** Elena (propietaria) necesita saber si gana o pierde en cada proyecto sin esperar al cierre. Beatriz (ops) necesita cuadrar presupuesto inicial con gastos y cobros reales.

---

## Slug propuesto

- **ES:** `rentabilidad-margen-proyecto-interiorismo`
- **EN:** `profitability-margin-interior-design-project`

---

## Respuesta answer-first (una frase para abrir)

**La rentabilidad de un proyecto de interiorismo se calcula restando los costes totales (productos, servicios, obra) de los ingresos facturados al cliente; el margen se expresa como porcentaje del precio de venta y permite saber, antes del cierre, si el proyecto gana o pierde dinero.**

---

## Outline H2

1. **Qué es la rentabilidad de un proyecto de interiorismo**
2. **Por qué es difícil calcularla en tiempo real**
3. **Cómo Veta calcula rentabilidad y margen automáticamente**
4. **Desglose: costes estimados vs gastos reales**
5. **Productos: precio de venta, coste y margen por línea**
6. **Desviaciones presupuestarias: cómo detectarlas antes del cierre**
7. **Errores comunes al calcular rentabilidad en interiorismo**
8. **Preguntas frecuentes (FAQ)**

---

## Features Veta a destacar (con evidencia código)

1. **Control de costes: estimado vs real**  
   - Evidencia: `src/modules/app/projects/project-cost-control.tsx` (L260-273: totalBudgetLinesEstimated, totalBudgetLinesActual, grandTotalEstimated, grandTotalActual)  
   - Totales por categoría presupuestaria y por proyecto completo.

2. **Desviación porcentual en tiempo real**  
   - Evidencia: `project-cost-control.tsx` (L269-272: deviationPercentage = actual / estimated * 100; L275-288: color de barra según desviación)  
   - Indicador visual (verde ≤100%, amarillo ~101%, rojo >101%) para detectar sobrecostes antes del cierre.

3. **Margen por producto: coste vs precio de venta**  
   - Evidencia: `project-cost-control.tsx` (L690-750: productos con totalProductsCost, totalProductsPrice, margen = precio - coste)  
   - Cálculo automático del margen de productos sin fórmulas manuales.

4. **Indicador de desviación por línea presupuestaria**  
   - Evidencia: `project-cost-control.tsx` (L290-320: getDeviationIndicator con ícono TrendingUp/Down/Minus y texto de desviación %)  
   - Ver qué partidas se desvían (TrendingUp rojo si +5%, TrendingDown verde si -5%).

5. **Totales grand por proyecto**  
   - Evidencia: `project-cost-control.tsx` (L265-267: grandTotalEstimated, grandTotalActual, suma de budget lines + productos)  
   - Un solo número que responde "¿este proyecto gana o pierde?"

6. **Visibilidad restringida de costes internos al cliente**  
   - Evidencia: `project-cost-control.tsx` (L520-523, L570-580: is_internal_cost, ícono EyeOff para costes no visibles)  
   - Separar margen interno de lo que ve el cliente en presupuesto y vista pública.

7. **Resumen financiero de productos**  
   - Evidencia: `project-cost-control.tsx` (L670-758: productsCostTitle, totalCost, totalSale, productsMargin con %)  
   - Panel dedicado para ver rentabilidad de productos (coste, venta, margen, %).

---

## FAQ (5-7 preguntas con schema FAQPage)

1. **¿Cómo saber si un proyecto de interiorismo es rentable antes de cerrarlo?**  
   Comparando costes totales (productos, servicios, obra) con ingresos estimados. Veta muestra estimado vs real en tiempo real con % de desviación.

2. **¿Qué es el margen bruto de un proyecto?**  
   Diferencia entre precio de venta y coste, expresada como porcentaje del precio de venta. Ejemplo: venta 10.000€, coste 7.000€ → margen 30%.

3. **¿Veta calcula el margen automáticamente?**  
   Sí. Por cada producto (unit_price - unit_cost) y total de productos (totalProductsPrice - totalProductsCost). Ver `project-cost-control.tsx` L690-750.

4. **¿Qué es la desviación presupuestaria?**  
   Diferencia entre coste estimado y coste real. Desviación >5% indica sobrecostes; <-5% indica ahorro o subestimación inicial.

5. **¿Puedo ocultar costes internos al cliente?**  
   Sí. Marca partidas como "coste interno" (is_internal_cost = true) y no aparecen en PDF ni vista pública. Solo tú ves el margen real.

6. **¿Cómo Veta me avisa si un proyecto se desvía?**  
   Con indicadores de color (verde, amarillo, rojo) y % de desviación por categoría y por proyecto. Detectas sobrecostes antes del cierre.

7. **¿Puedo ver rentabilidad de productos vs servicios por separado?**  
   Sí. Panel de productos (coste, venta, margen) + panel de partidas presupuestarias (estimado vs real) separados en la misma vista.

---

## Links internos

- `/pricing` — Precios (Pro y Studio incluyen control de costes avanzado)
- `/plan-pro-independientes-diseno-interior` — Plan Pro (control de costes y márgenes)
- `/plan-studio-empresas-arquitectura-diseno-interior` — Plan Studio (desviaciones, márgenes, soporte prioritario)
- `/blog/veta-vs-excel-presupuestos-interiorismo` — Post relacionado (control sin Excel)

---

## CTA

**Primario:** "Prueba Veta 30 días gratis — ve rentabilidad de cada proyecto en tiempo real"  
**Secundario:** "Ver plan Pro con control de costes" → `/plan-pro-independientes-diseno-interior`

---

## Visual (para Veta Designer)

**Tipo:** Screenshot de dashboard `project-cost-control` mostrando:
- Totales estimado vs real
- Barra de desviación % con color (verde/amarillo/rojo)
- Panel de productos con coste, venta, margen

**Sin texto en imágenes.**

---

## SEO/AEO checklist

- [ ] Intención: informacional (cómo calcular) + transaccional suave (solución con Veta)
- [ ] Keywords: "rentabilidad proyecto interiorismo", "margen diseño interior", "control costes obra", "presupuesto vs real", "margen bruto proyecto"
- [ ] H1 claro, H2 escaneables, fórmulas simples (precio - coste = margen), listas de errores comunes
- [ ] E-E-A-T: ejemplos numéricos creíbles (no inventar casos de clientes reales, usar ejemplos ilustrativos)
- [ ] Enlazado interno: pricing, planes Pro/Studio, blog relacionado
- [ ] FAQPage schema (7 preguntas)
- [ ] GEO: respuesta answer-first con fórmula clara, afirmaciones delimitadas ("margen = (precio - coste) / precio * 100"), tabla de escenarios

---

## Ejemplos ilustrativos (no datos reales de clientes)

### Escenario 1: Proyecto con margen saludable
- Precio de venta: 15.000 €
- Coste total: 10.500 €
- Margen bruto: 4.500 € (30%)
- Estado: rentable

### Escenario 2: Proyecto con desviación
- Presupuesto estimado: 12.000 €
- Coste real: 13.200 €
- Desviación: +10% (TrendingUp rojo)
- Acción: revisar partidas con desviación >5%

### Escenario 3: Producto individual
- Precio de venta: 1.200 €
- Coste de compra: 800 €
- Margen: 400 € (33.3%)

---

## Tono

Práctico y educativo. Explicar conceptos financieros (rentabilidad, margen, desviación) de forma clara sin jerga contable. Enfatizar que **Veta automatiza estos cálculos** para que Elena y Beatriz no tengan que hacer fórmulas manuales en Excel.
