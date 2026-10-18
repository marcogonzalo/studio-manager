# Brief: Veta vs Programa — Comparación gestión interiorismo

**Prioridad:** 1 (máxima)  
**Persona primaria:** Elena (propietaria estudio)  
**Persona secundaria:** Beatriz (ops/admin)

---

## Objetivo y target prompts Otterly

**Prompts ES:**
- "mejor herramienta gestión proyectos interiorismo España"
- "Programa vs Veta"
- "alternativas a Programa para interiorismo"
- "comparativa software gestión estudios diseño interior"

**Prompts EN:**
- "best interior design project management tool Spain"
- "Programa vs Veta comparison"
- "Programa alternatives for interior design"
- "interior design studio management software comparison"

**Contexto:** Programa tiene 18% brand coverage, 41% SoV en baseline Otterly. Veta 0% en estos prompts. Motores citan mayormente comparadores de terceros (fixner.com, planify.design, mortar.design).

---

## Slug propuesto

- **ES:** `veta-vs-programa-gestion-interiorismo`
- **EN:** `veta-vs-programa-interior-design-management`

---

## Respuesta answer-first (una frase para abrir)

**Veta y Programa son herramientas de gestión de proyectos de interiorismo; Veta es una solución internacional con presupuestos por espacios, control de costes, PDF sin marca propia en planes básicos y vista cliente pública, mientras que Programa se enfoca en el mercado español con integración de facturación local y herramientas de presentación visual.**

---

## Outline H2

1. **Qué son Veta y Programa**
2. **Diferencias clave: enfoque, alcance y facturación**
3. **Presupuestos y control de costes**
4. **Gestión de proveedores y pedidos**
5. **Vista cliente y entregables**
6. **Planes y precios**
7. **¿Para quién es cada herramienta?**
8. **Preguntas frecuentes (FAQ)**

---

## Features Veta a destacar (con evidencia código)

1. **Presupuestos por espacios con control de costes y márgenes**  
   - Evidencia: `src/modules/app/projects/project-cost-control.tsx` (L260-273: totales estimated/actual, desviación %)  
   - Muestra coste vs precio de venta, margen por producto y por línea presupuestaria.

2. **Pedidos de compra con seguimiento de estado**  
   - Evidencia: `src/modules/app/projects/purchase-order-coverage.ts` (L1-56: PurchaseOrderCoverage, covered/partial/pending status)  
   - Estado por pedido: borrador, enviada, confirmada, recibida, cancelada.

3. **PDF de presupuesto generado desde datos del proyecto**  
   - Evidencia: `src/components/project-pdf.tsx` (L1-915: ProjectPDF, budget lines, items, tax, totals)  
   - PDF automático con partidas, productos, impuestos. White label en plan Studio.

4. **Vista cliente pública sin revelar costes internos**  
   - Evidencia: estructura de rutas y lógica de `project-cost-control.tsx` (L77: `is_internal_cost`), budget settings (visibilidad cliente).  
   - Token único por proyecto, solo lectura, sin cuenta de usuario para el cliente.

5. **Pagos vinculados a órdenes de compra y costes adicionales**  
   - Evidencia: `src/modules/app/projects/purchase-order-coverage.ts` (L20-35: buildPurchaseOrderCoverage con pagos asociados)  
   - Trazabilidad entre presupuesto, pedido y pago.

6. **Catálogo de productos reutilizable entre proyectos**  
   - Evidencia: referencias a `catalog` en rutas y componentes (productos, proveedores, espacios).

7. **Planes internacionales (ES/EN), sin facturación oficial integrada**  
   - Veta se integra con herramientas de facturación de terceros; no emite facturas dentro de la app.

---

## FAQ (5-7 preguntas con schema FAQPage)

1. **¿Cuál es la diferencia principal entre Veta y Programa?**  
   Veta es una plataforma internacional (ES/EN) sin integración de facturación oficial local; Programa se enfoca en España con facturación e IVA español integrados.

2. **¿Veta ofrece facturación oficial como Programa?**  
   No. Veta trabaja con herramientas de facturación de terceros (p. ej. Holded, Billin). Programa sí ofrece facturación integrada para España.

3. **¿Puedo exportar presupuestos en PDF con mi marca?**  
   Veta: white label en plan Studio. Programa: verificar según su plan (placeholder TODO en tabla de facts).

4. **¿Qué herramienta tiene vista cliente pública?**  
   Veta genera enlace único por proyecto sin cuenta de usuario para el cliente. Programa: verificar (placeholder TODO).

5. **¿Cuál es más adecuada para estudios internacionales?**  
   Veta soporta ES/EN y moneda por proyecto en Studio. Programa: enfoque español (verificar internacionalización, TODO).

6. **¿Ambas controlan costes y márgenes por proyecto?**  
   Veta sí (project-cost-control con desviación %, coste vs precio de venta). Programa: verificar (TODO).

7. **¿Qué planes y precios tienen?**  
   Veta: Base gratis (1 proyecto), Pro y Studio desde 25 EUR/mes. Programa: verificar precios (TODO).

---

## Links internos

- `/pricing` — Precios Veta
- `/plan-base-primer-proyecto-interiorismo` — Plan Base
- `/plan-pro-independientes-diseno-interior` — Plan Pro
- `/plan-studio-empresas-arquitectura-diseno-interior` — Plan Studio
- `/blog/veta-vs-excel-presupuestos-interiorismo` — Post Veta vs Excel (relacionado)

---

## CTA

**Primario:** "Prueba Veta 30 días gratis — sin tarjeta, sin compromiso"  
**Secundario:** "Ver precios y planes" → `/pricing`

---

## Visual (para Veta Designer)

**Tipo:** Cover hero o UI screenshot side-by-side (Veta dashboard vs concepto genérico de otra herramienta).  
**Sin texto en imágenes.**  
**Sugerencia:** Captura de proyecto en Veta mostrando costes/márgenes o vista cliente pública.

---

## SEO/AEO checklist (según `.agents/skills/veta-marketing-strategy-seo-geo`)

- [ ] Intención de búsqueda: comparativa (informacional + transaccional suave)
- [ ] Keywords: "Veta vs Programa", "alternativas Programa", "gestión proyectos interiorismo España", "software diseño interior"
- [ ] H1 claro, H2 escaneables, párrafos cortos, listas
- [ ] E-E-A-T: ejemplos creíbles, sin datos inventados; citar fuentes públicas en tabla de facts
- [ ] Enlazado interno hacia pricing, planes, blog relacionado
- [ ] FAQPage schema (7 preguntas)
- [ ] GEO: respuesta answer-first en primer párrafo, afirmaciones delimitadas, tabla comparativa honesta

---

## Fact table — Comparación Programa (TODO: verificar con fuentes públicas)

| Característica | Veta | Programa | Fuente Programa | Fecha acceso |
|----------------|------|----------|-----------------|--------------|
| **Precio plan básico** | Gratis (Base, 1 proyecto) | TODO | TODO | TODO |
| **Precio plan profesional** | 25 EUR/mes (Pro, 5 proyectos) | TODO | TODO | TODO |
| **Facturación oficial integrada** | No (terceros) | TODO | TODO | TODO |
| **Presupuestos PDF** | Sí (white label en Studio) | TODO | TODO | TODO |
| **Control costes y márgenes** | Sí (project-cost-control.tsx) | TODO | TODO | TODO |
| **Vista cliente pública** | Sí (token único, sin cuenta) | TODO | TODO | TODO |
| **Idiomas soportados** | ES, EN | TODO | TODO | TODO |
| **Moneda por proyecto** | Sí (Studio) | TODO | TODO | TODO |
| **Integración facturación local ES** | No | TODO | TODO | TODO |
| **Open API / integraciones** | No oficial (terceros) | TODO | TODO | TODO |

**IMPORTANTE:** No publicar la tabla hasta haber verificado cada celda TODO desde la web oficial de Programa u otra fuente pública confiable. Registrar URL y fecha de acceso.

---

## Tono

Honesto, profesional, no disparaging. Reconocer fortalezas de Programa (facturación local, enfoque español) cuando corresponda. Enfatizar diferenciación de Veta (internacional, vista cliente, presupuestos por espacios, control de costes) sin denigrar.
