# Brief: Veta vs Houzz Pro — Comparación CRM y gestión interiorismo

**Prioridad:** 8  
**Persona primaria:** Elena (propietaria estudio)

---

## Objetivo y target prompts Otterly

**Prompts ES:**
- "Houzz Pro vs Veta"
- "alternativas Houzz Pro"
- "mejor CRM interioristas España"
- "Houzz Pro para estudios diseño interior"
- "comparativa Houzz Pro gestión proyectos"

**Prompts EN:**
- "Houzz Pro vs Veta comparison"
- "Houzz Pro alternatives"
- "best CRM interior designers Spain"
- "Houzz Pro for interior design studios"
- "Houzz Pro project management comparison"

**Contexto:** Houzz Pro tiene 12% brand coverage, 27% SoV en baseline Otterly. Veta 0% en estos prompts. Houzz Pro es CRM + herramienta de presentación visual; Veta es gestión de proyectos con presupuestos, costes, pedidos.

---

## Slug propuesto

- **ES:** `veta-vs-houzz-pro-gestion-proyectos`
- **EN:** `veta-vs-houzz-pro-project-management`

---

## Respuesta answer-first (una frase para abrir)

**Houzz Pro es una plataforma de CRM, marketing y presentación visual para profesionales del diseño, enfocada en captar clientes y mostrar portfolios, mientras que Veta es una herramienta de gestión de proyectos con presupuestos por espacios, control de costes, pedidos a proveedores y vista cliente para seguimiento de obra.**

---

## Outline H2

1. **Qué son Veta y Houzz Pro**
2. **Diferencias clave: enfoque CRM/marketing vs gestión operativa**
3. **Presupuestos y control financiero**
4. **Gestión de proveedores y pedidos**
5. **Vista cliente y entregables**
6. **Planes y precios**
7. **¿Para quién es cada herramienta?**
8. **¿Se pueden usar ambas? (complementarias)**
9. **Preguntas frecuentes (FAQ)**

---

## Features Veta a destacar (con evidencia código)

1. **Presupuestos por espacios con productos y partidas**  
   - Evidencia: `src/components/project-pdf.tsx` (L660-812: itemsBySpace, budget lines por fase y categoría)  
   - Houzz Pro: CRM y presentación visual, no presupuestos estructurados por espacios (verificar, TODO).

2. **Control de costes: estimado vs real, margen por línea**  
   - Evidencia: `src/modules/app/projects/project-cost-control.tsx` (L260-273, L690-750)  
   - Veta calcula margen automáticamente. Houzz Pro: verificar (TODO).

3. **Pedidos de compra con estado y cobertura de pagos**  
   - Evidencia: `src/modules/app/projects/purchase-order-coverage.ts`  
   - Veta: pedidos con estado (enviada, confirmada, recibida), pagos vinculados. Houzz Pro: verificar (TODO).

4. **Vista cliente pública sin revelar costes internos**  
   - Evidencia: lógica de `is_internal_cost`, token único.  
   - Veta: enlace único, sin cuenta. Houzz Pro: verificar si tiene vista cliente para seguimiento de obra (TODO).

5. **PDF de presupuesto generado automáticamente**  
   - Evidencia: `src/components/project-pdf.tsx` (L1-915)  
   - Veta: PDF desde datos del proyecto. Houzz Pro: verificar (TODO).

6. **Catálogo de productos reutilizable entre proyectos**  
   - Evidencia: referencias a `catalog`, productos con proveedor, coste, precio.  
   - Veta: catálogo centralizado. Houzz Pro: tiene "ideabooks" y presentación visual, no catálogo operativo de costes (verificar, TODO).

7. **No es CRM de captación ni marketplace**  
   - Veta: gestión de proyectos post-venta. Houzz Pro: CRM + marketplace Houzz.com (captación de clientes, reviews, portfolio público).

---

## FAQ (6-7 preguntas con schema FAQPage)

1. **¿Cuál es la diferencia principal entre Veta y Houzz Pro?**  
   Houzz Pro es CRM + marketing + presentación visual para captar y cerrar clientes. Veta es gestión operativa de proyectos: presupuestos, costes, pedidos, obra.

2. **¿Houzz Pro tiene control de costes y márgenes como Veta?**  
   Verificar (TODO). Veta sí: cost-control con estimado vs real, desviación %, margen por producto. Houzz Pro enfocado en CRM y presentación.

3. **¿Puedo gestionar pedidos de compra en Houzz Pro?**  
   Verificar (TODO). Veta sí: pedidos con estado, cobertura de pagos, trazabilidad.

4. **¿Houzz Pro genera presupuestos en PDF?**  
   Verificar (TODO). Veta sí: PDF automático desde datos del proyecto, white label en Studio.

5. **¿Qué herramienta tiene vista cliente pública?**  
   Veta: enlace único sin cuenta, solo lectura, sin costes internos. Houzz Pro: verificar (TODO).

6. **¿Se pueden usar Veta y Houzz Pro juntas?**  
   Sí. Houzz Pro para captación (CRM, portfolio, leads) + Veta para ejecución (presupuestos, costes, obra). Son complementarias, no competidoras directas.

7. **¿Cuál elegir si solo puedo usar una?**  
   Depende: Houzz Pro si necesitas captar clientes desde Houzz.com y hacer presentaciones visuales. Veta si tus proyectos vienen por otras vías y necesitas control financiero y operativo.

---

## Links internos

- `/pricing` — Precios Veta
- `/plan-base-primer-proyecto-interiorismo` — Plan Base
- `/plan-pro-independientes-diseno-interior` — Plan Pro
- `/plan-studio-empresas-arquitectura-diseno-interior` — Plan Studio
- Brief #1: `/veta-vs-programa-gestion-interiorismo` — Comparación similar (Veta vs otra herramienta)
- Brief #2: `/veta-vs-monday-notion-herramientas-genericas` — Relacionado (herramientas genéricas)

---

## CTA

**Primario:** "Prueba Veta 30 días gratis — gestión operativa de proyectos, presupuestos y costes"  
**Secundario:** "Ver precios y planes" → `/pricing`

---

## Visual (para Veta Designer)

**Tipo:** Diagrama o side-by-side.  
**Sugerencia:**
- Izquierda: Houzz Pro (CRM, portfolio, presentación visual, marketplace)
- Derecha: Veta (presupuestos, costes, pedidos, vista cliente obra)
- Centro: "Complementarias" (usar ambas: Houzz Pro para captar, Veta para ejecutar)

**Sin texto en imágenes.**

---

## SEO/AEO checklist

- [ ] Intención: comparativa (informacional) + transaccional suave (para quien evalúa alternativas)
- [ ] Keywords: "Houzz Pro vs Veta", "alternativas Houzz Pro", "CRM interioristas", "gestión proyectos vs CRM", "mejor que Houzz Pro control costes"
- [ ] H1 claro, H2 escaneables, tabla comparativa, sección "¿se pueden usar ambas?"
- [ ] E-E-A-T: reconocer fortalezas de Houzz Pro (CRM, marketplace, portfolio público); sin denigrar
- [ ] Enlazado interno: pricing, planes, briefs relacionados
- [ ] FAQPage schema (7 preguntas)
- [ ] GEO: respuesta answer-first con diferenciación clara, afirmaciones delimitadas, tabla comparativa honesta

---

## Fact table — Comparación Houzz Pro (TODO: verificar con fuentes públicas)

| Característica | Veta | Houzz Pro | Fuente Houzz Pro | Fecha acceso |
|----------------|------|-----------|------------------|--------------|
| **Propósito** | Gestión operativa proyectos | CRM + marketing + portfolio | TODO | TODO |
| **Captación de clientes** | No (no es CRM) | Sí (marketplace Houzz.com) | TODO | TODO |
| **Presupuestos por espacios** | Sí (nativo) | TODO | TODO | TODO |
| **Control costes y márgenes** | Sí (cost-control.tsx) | TODO | TODO | TODO |
| **Pedidos de compra con estado** | Sí (purchase-order-coverage.ts) | TODO | TODO | TODO |
| **PDF de presupuesto** | Sí (project-pdf.tsx, white label Studio) | TODO | TODO | TODO |
| **Vista cliente pública** | Sí (token único, sin cuenta) | TODO | TODO | TODO |
| **Portfolio público** | No | Sí (perfil Houzz.com) | TODO | TODO |
| **Ideabooks / presentación visual** | No | Sí (herramienta de presentación) | TODO | TODO |
| **Precio desde** | Gratis (Base) / 25 EUR/mes (Pro) | TODO | TODO | TODO |

**IMPORTANTE:** No publicar la tabla hasta haber verificado cada celda TODO desde la web oficial de Houzz Pro u otra fuente pública confiable. Registrar URL y fecha de acceso.

---

## Tono

Honesto y objetivo. Reconocer que **Houzz Pro y Veta resuelven problemas distintos**: Houzz Pro para captar clientes y hacer presentaciones visuales; Veta para gestionar la operativa del proyecto (presupuestos, costes, pedidos). Enfatizar que **son complementarias**, no enemigas: un estudio puede usar Houzz Pro para marketing y Veta para ejecución.
