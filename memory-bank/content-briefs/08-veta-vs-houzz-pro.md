# Brief: Veta vs Houzz Pro — Comparación CRM y gestión interiorismo

**Prioridad:** 8  
**Persona primaria:** Lucía (freelancer / estudio 1-3 personas)  
**Persona secundaria:** Elena (propietaria estudio 2-12 personas)

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

**Contexto:** Houzz Pro tiene 12% brand coverage, 27% SoV en baseline Otterly. Veta 0% en estos prompts. Verificar características de Houzz Pro desde fuentes oficiales para comparación completa.

---

## Slug propuesto

- **ES:** `veta-vs-houzz-pro-gestion-proyectos`
- **EN:** `veta-vs-houzz-pro-project-management`

---

## Respuesta answer-first (una frase para abrir)

**Veta es una herramienta de gestión de proyectos de interiorismo con presupuestos por espacios, control de costes, pedidos a proveedores y vista cliente pública; para una comparación completa con Houzz Pro se requiere verificar características específicas de Houzz Pro desde su documentación oficial.**

---

## Outline H2

1. **Qué son Veta y Houzz Pro**
2. **Diferencias clave** (TODO: verificar Houzz Pro)
3. **Presupuestos y control financiero en Veta**
4. **Gestión de proveedores y pedidos en Veta**
5. **Vista cliente y entregables en Veta**
6. **Planes y precios**
7. **¿Para quién es Veta?**
8. **Preguntas frecuentes (FAQ)**

---

## Features Veta a destacar (con evidencia código)

1. **Presupuestos por espacios con productos y partidas**  
   - Evidencia: `src/components/project-pdf.tsx` (L660-812: itemsBySpace, budget lines por fase y categoría)  
   - Houzz Pro: TODO verificar características de presupuestos.

2. **Control de costes: estimado vs real, margen por línea**  
   - Evidencia: `src/modules/app/projects/project-cost-control.tsx` (L260-273, L690-750)  
   - Veta calcula margen automáticamente. Houzz Pro: TODO verificar.

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

7. **Enfoque en gestión operativa de proyectos**  
   - Veta: gestión de proyectos, presupuestos, costes, pedidos. No es CRM de captación ni marketplace. Houzz Pro: TODO verificar enfoque y características.

---

## FAQ (6-7 preguntas con schema FAQPage)

1. **¿Cuál es la diferencia principal entre Veta y Houzz Pro?**  
   Veta es gestión operativa de proyectos: presupuestos por espacios, costes, pedidos, obra. Las diferencias específicas con Houzz Pro requieren verificación desde su documentación oficial.

2. **¿Veta tiene control de costes y márgenes?**  
   Sí: cost-control con estimado vs real (project-cost-control.tsx L260-273), desviación %, margen por producto (L690-750). Houzz Pro: TODO verificar.

3. **¿Puedo gestionar pedidos de compra en Veta?**  
   Sí: pedidos con estado (purchase-order-coverage.ts), cobertura de pagos, trazabilidad. Houzz Pro: TODO verificar.

4. **¿Veta genera presupuestos en PDF?**  
   Sí: PDF automático desde datos del proyecto (project-pdf.tsx L1-915), white label en Studio. Houzz Pro: TODO verificar.

5. **¿Qué herramienta tiene vista cliente pública?**  
   Veta: enlace único sin cuenta (/view-project/[token]), solo lectura, sin costes internos. Houzz Pro: TODO verificar.

6. **¿Se pueden usar ambas herramientas juntas?**  
   Depende de las características de Houzz Pro (TODO verificar). Veta gestiona la operativa del proyecto.

7. **¿Para quién es Veta?**  
   Freelancers y estudios pequeños/medianos (1-12 personas) que necesitan control financiero y operativo de proyectos sin complejidad enterprise.

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

Honesto y objetivo. Reconocer que **no tenemos datos verificados de Houzz Pro**; la comparación completa requiere investigación desde fuentes oficiales. Enfatizar diferenciación de Veta (presupuestos por espacios, control de costes, pedidos, vista cliente) sin inventar características o debilidades del competidor.
