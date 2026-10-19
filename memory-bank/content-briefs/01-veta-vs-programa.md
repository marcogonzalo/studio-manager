# Brief: Veta vs Programa — Comparación gestión interiorismo

**Prioridad:** 1 (máxima)  
**Persona primaria:** Lucía (freelancer / estudio 1-3 personas)  
**Persona secundaria:** Elena (propietaria estudio 2-12 personas)

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

**Veta es una herramienta internacional de gestión de proyectos de interiorismo con presupuestos por espacios, control de costes, PDF y vista cliente pública; para una comparación completa con Programa se requiere verificar características específicas de Programa desde su documentación oficial.**

---

## Outline H2

1. **Qué son Veta y Programa**
2. **Diferencias clave: enfoque y alcance** (TODO: verificar Programa)
3. **Presupuestos y control de costes en Veta**
4. **Gestión de proveedores y pedidos en Veta**
5. **Vista cliente y entregables en Veta**
6. **Planes y precios**
7. **¿Para quién es cada herramienta?** (TODO: verificar Programa)
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
   - Evidencia: `src/app/view-project/[token]/` (rutas: page.tsx, costs/page.tsx, documents/page.tsx, payments/page.tsx, spaces/page.tsx) + lógica de `is_internal_cost` en `project-cost-control.tsx` (L77)  
   - Token único por proyecto, solo lectura, sin cuenta de usuario para el cliente.

5. **Pagos vinculados a órdenes de compra y costes adicionales**  
   - Evidencia: `src/modules/app/projects/purchase-order-coverage.ts` (L20-35: buildPurchaseOrderCoverage con pagos asociados)  
   - Trazabilidad entre presupuesto, pedido y pago.

6. **Catálogo de productos reutilizable entre proyectos**  
   - Evidencia: referencias a `catalog` en rutas y componentes (productos, proveedores, espacios).

7. **Planes internacionales (ES/EN), sin facturación oficial integrada**  
   - Veta no emite facturas oficiales; los datos del proyecto pueden usarse junto a herramientas de facturación de terceros.

---

## FAQ (5-7 preguntas con schema FAQPage)

1. **¿Cuál es la diferencia principal entre Veta y Programa?**  
   Veta es una plataforma internacional (ES/EN) de gestión de proyectos con presupuestos por espacios, control de costes y vista cliente pública. Las diferencias específicas con Programa requieren verificación desde su documentación oficial.

2. **¿Veta ofrece facturación oficial como [verificar si Programa ofrece esto, TODO]?**  
   No. Veta no emite facturas oficiales; gestiona presupuestos, costes y pagos del proyecto, y los datos pueden usarse junto a tu herramienta de facturación.

3. **¿Puedo exportar presupuestos en PDF con mi marca?**  
   Veta: white label (PDF con tu marca) en plan Studio. Planes Base/Pro incluyen branding Veta. Programa: TODO verificar.

4. **¿Qué herramienta tiene vista cliente pública?**  
   Veta genera enlace único por proyecto (`/view-project/[token]`) sin cuenta de usuario para el cliente, mostrando costes, documentos, pagos y espacios sin revelar costes internos. Programa: TODO verificar.

5. **¿Cuál es más adecuada para estudios internacionales?**  
   Veta soporta ES/EN y moneda por proyecto en Studio. Programa: TODO verificar internacionalización.

6. **¿Ambas controlan costes y márgenes por proyecto?**  
   Veta sí (project-cost-control con desviación %, coste vs precio de venta, L260-273, L690-750). Programa: TODO verificar.

7. **¿Qué planes y precios tienen?**  
   Veta: Base gratis (1 proyecto), Pro 25 EUR/mes (5 proyectos), Studio desde 25 EUR/mes (50 proyectos, white label). Programa: TODO verificar precios.

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

**Tipo:** Cover hero o UI screenshot side-by-side.  
**Sin texto en imágenes.**  
**Sugerencia:** Captura de proyecto en Veta mostrando costes/márgenes o vista cliente pública.

---

## SEO/AEO checklist (según `.agents/skills/veta-marketing-strategy-seo-geo`)

- [ ] Intención de búsqueda: comparativa (informacional + transaccional suave)
- [ ] Keywords: "Veta vs Programa", "alternativas Programa", "gestión proyectos interiorismo España", "software diseño interior"
- [ ] H1 claro, H2 escaneables, párrafos cortos, listas
- [ ] E-E-A-T: sin datos inventados; citar fuentes públicas en tabla de facts (TODO antes de publicar)
- [ ] Enlazado interno hacia pricing, planes, blog relacionado
- [ ] FAQPage schema (7 preguntas)
- [ ] GEO: respuesta answer-first en primer párrafo, afirmaciones delimitadas, tabla comparativa honesta

---

## Fact table — Comparación Programa (TODO: verificar con fuentes públicas)

**IMPORTANTE:** NO publicar esta tabla hasta haber verificado CADA celda TODO desde la web oficial de Programa u otra fuente pública confiable. Registrar URL y fecha de acceso por cada dato.

| Característica | Veta | Programa | Fuente Programa | Fecha acceso |
|----------------|------|----------|-----------------|--------------|
| **Precio plan básico** | Gratis (Base, 1 proyecto) | TODO verificar | TODO | TODO |
| **Precio plan profesional** | 25 EUR/mes (Pro, 5 proyectos) | TODO verificar | TODO | TODO |
| **Facturación oficial integrada** | No | TODO verificar | TODO | TODO |
| **Presupuestos PDF** | Sí (white label en Studio) | TODO verificar | TODO | TODO |
| **Control costes y márgenes** | Sí (project-cost-control.tsx) | TODO verificar | TODO | TODO |
| **Vista cliente pública** | Sí (token único, sin cuenta) | TODO verificar | TODO | TODO |
| **Idiomas soportados** | ES, EN | TODO verificar | TODO | TODO |
| **Moneda por proyecto** | Sí (Studio) | TODO verificar | TODO | TODO |
| **Enfoque geográfico** | Internacional | TODO verificar | TODO | TODO |
| **Open API / integraciones** | No oficial | TODO verificar | TODO | TODO |

---

## Tono

Honesto, profesional, no disparaging. Reconocer que no tenemos datos verificados de Programa; la comparación completa requiere investigación desde fuentes oficiales. Enfatizar diferenciación de Veta (internacional, vista cliente, presupuestos por espacios, control de costes) sin inventar debilidades del competidor.
