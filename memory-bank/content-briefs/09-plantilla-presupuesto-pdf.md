# Brief: Plantilla presupuesto PDF no Excel para interiorismo

**Prioridad:** 9  
**Persona primaria:** Lucía (freelancer / estudio 1-3 personas)

---

## Objetivo y target prompts Otterly

**Prompts ES:**
- "plantilla presupuesto interiorismo"
- "presupuesto profesional PDF diseño interior"
- "alternativa Excel presupuesto cliente"
- "formato presupuesto interiorismo PDF"
- "generar presupuesto PDF interiorismo"

**Prompts EN:**
- "interior design budget template"
- "professional budget PDF interior design"
- "Excel alternative budget template client"
- "interior design budget format PDF"
- "generate budget PDF interior design"

**Contexto:** Lucía y Elena necesitan entregar presupuestos profesionales en PDF sin rehacer Excel manualmente cada vez. Buscan herramienta que genere PDF desde datos del proyecto.

---

## Slug propuesto

- **ES:** `plantilla-presupuesto-pdf-no-excel-interiorismo`
- **EN:** `budget-template-pdf-not-excel-interior-design`

---

## Respuesta answer-first (una frase para abrir)

**Una plantilla de presupuesto en PDF para interiorismo debe incluir partidas de servicios (diseño, dirección de obra), productos por espacios con cantidades y precios, impuestos y totales; Veta genera este PDF automáticamente desde los datos del proyecto sin necesidad de exportar Excel manualmente, con opción de marca propia (white label) en el plan Studio.**

---

## Outline H2

1. **Qué debe incluir un presupuesto profesional de interiorismo en PDF**
2. **Por qué no usar Excel como plantilla PDF**
3. **Estructura del presupuesto: servicios, productos por espacios, impuestos**
4. **Cómo Veta genera PDF desde datos del proyecto**
5. **Personalización: marca propia (white label) vs plantilla estándar**
6. **Visibilidad cliente: ocultar costes internos en el PDF**
7. **Actualizar presupuesto sin rehacer el PDF manualmente**
8. **Preguntas frecuentes (FAQ)**

---

## Features Veta a destacar (con evidencia código)

1. **PDF generado automáticamente desde datos del proyecto**  
   - Evidencia: `src/components/project-pdf.tsx` (L1-915: ProjectPDF con partidas, productos, impuestos, totales)  
   - No exportar Excel → PDF a mano; un clic desde el proyecto.

2. **Estructura por espacios (productos) + fases y categorías (servicios)**  
   - Evidencia: `project-pdf.tsx` (L660-812: itemsBySpace con productos por espacio; L816-828: budget lines por fase y categoría)  
   - Organización profesional lista para cliente.

3. **Ocultar costes internos en el PDF**  
   - Evidencia: `project-pdf.tsx` con filtrado de `is_internal_cost`; lógica de `applyBudgetPresentation` (L432-443: visibleBudgetLines, visibleProducts)  
   - Cliente ve precio de venta, no tu coste ni margen.

4. **Impuestos multitasa o tasa única**  
   - Evidencia: `project-pdf.tsx` (L455-471: computeTaxGroups, multitax support)  
   - Presupuesto con IVA correcto por línea o global.

5. **White label: marca propia en PDF**  
   - Evidencia: `project-pdf.tsx` (L408-423: showVetaBranding, vetaLogoUrl; L576-588, L901-913: vetaHeader, vetaFooter)  
   - Plan Studio: PDF con tu logo y marca. Planes Base/Pro: branding Veta.

6. **Notas de presupuesto en el PDF**  
   - Evidencia: `project-pdf.tsx` (L889-900: budgetNotes con splitBudgetNotesLines)  
   - Incluir condiciones de pago, plazos, exclusiones en el mismo PDF.

7. **Metadatos del proyecto en encabezado**  
   - Evidencia: `project-pdf.tsx` (L590-655: header con nombre proyecto, fecha, descripción, cliente, arquitecto)  
   - Presupuesto personalizado con datos del encargo.

---

## FAQ (6-7 preguntas con schema FAQPage)

1. **¿Qué debe incluir un presupuesto de interiorismo profesional?**  
   Servicios (diseño, dirección, gestión), productos por espacios (muebles, materiales), cantidades, precios, impuestos, totales. Opcional: notas de pago, plazos, exclusiones.

2. **¿Por qué no usar Excel para generar PDF de presupuesto?**  
   Porque cada cambio (precio, cantidad, producto) obliga a exportar Excel → PDF manualmente. Veta genera PDF desde los mismos datos del proyecto automáticamente.

3. **¿Veta permite ocultar costes internos en el PDF?**  
   Sí. Marca partidas como "coste interno" (is_internal_cost = true) y no aparecen en PDF. Cliente ve precio de venta, no tu margen.

4. **¿Puedo personalizar el PDF con mi marca?**  
   Sí, en plan Studio (white label). Planes Base/Pro incluyen branding Veta (logo y pie de página).

5. **¿El PDF incluye impuestos por línea o solo total?**  
   Ambos. Veta soporta impuesto único (tax_rate global) o multitasa (tax_rate por producto/partida). El PDF muestra columna de impuesto y totales con IVA.

6. **¿Puedo añadir notas al presupuesto PDF?**  
   Sí. Campo `budget_notes` del proyecto se incluye al final del PDF (condiciones de pago, plazos, exclusiones).

7. **¿Cómo actualizo el presupuesto si cambia un precio?**  
   Cambias el precio en el proyecto (producto o línea presupuestaria), regeneras el PDF. No editar Excel ni rehacer layout.

---

## Links internos

- `/pricing` — Precios (Studio con white label, Base/Pro con branding Veta)
- `/plan-base-primer-proyecto-interiorismo` — Plan Base (PDF estándar)
- `/plan-pro-independientes-diseno-interior` — Plan Pro (PDF con más opciones)
- `/plan-studio-empresas-arquitectura-diseno-interior` — Plan Studio (PDF white label)
- `/blog/veta-vs-excel-presupuestos-interiorismo` — Veta vs Excel (PDF en Excel vs Veta)
- Brief #5: `/alternativas-excel-presupuestos-interiorismo` — Hub de alternativas Excel

---

## CTA

**Primario:** "Prueba Veta 30 días gratis — genera presupuestos en PDF sin exportar Excel"  
**Secundario:** "Ver plan Studio con PDF white label" → `/plan-studio-empresas-arquitectura-diseno-interior`

---

## Visual (para Veta Designer)

**Tipo:** Mockup de presupuesto PDF generado por Veta.  
**Sugerencia:** Captura de PDF mostrando:
- Encabezado con nombre proyecto, cliente, fecha
- Sección de productos por espacios (tabla con productos, cantidades, precios)
- Sección de servicios por fases (partidas presupuestarias)
- Totales con impuestos
- Pie de página (branding Veta en Base/Pro, white label en Studio)

**Sin texto en imágenes** (o texto ilustrativo genérico, no datos reales).

---

## SEO/AEO checklist

- [ ] Intención: informacional (qué incluir en presupuesto) + transaccional suave (generar con Veta)
- [ ] Keywords: "plantilla presupuesto interiorismo", "presupuesto PDF diseño interior", "formato presupuesto profesional", "generar PDF presupuesto", "alternativa Excel plantilla"
- [ ] H1 claro, H2 escaneables, ejemplo de estructura de presupuesto, captura de PDF
- [ ] E-E-A-T: mostrar elementos estándar de presupuesto (servicios, productos, impuestos), sin inventar formatos
- [ ] Enlazado interno: pricing, planes (especialmente Studio con white label), blog Excel, hub alternativas Excel
- [ ] FAQPage schema (7 preguntas)
- [ ] GEO: respuesta answer-first con estructura clara, afirmaciones delimitadas ("presupuesto incluye X, Y, Z"), ejemplo visual

---

## Ejemplo de estructura de presupuesto

**Nota:** El siguiente es un ejemplo ilustrativo, no un presupuesto real de cliente.

### Encabezado
- Nombre del proyecto: "Reforma vivienda calle X"
- Cliente: "María García"
- Fecha: 15 enero 2026
- Estudio: "Tu estudio de interiorismo"

### Servicios (partidas presupuestarias)
**Fase: Diseño**
- Diseño conceptual: 2.000€
- Diseño ejecutivo: 3.500€

**Fase: Obra**
- Dirección de obra: 4.000€
- Gestión de compras: 1.200€

### Productos por espacios
**Salón**
- Sofá modelo X: 1.800€ × 1 ud = 1.800€
- Mesa centro: 600€ × 1 ud = 600€
- Lámpara pie: 350€ × 2 ud = 700€

**Dormitorio principal**
- Cama tapizada: 1.200€ × 1 ud = 1.200€
- Mesitas noche: 280€ × 2 ud = 560€

### Totales
- Subtotal servicios: 10.700€
- Subtotal productos: 4.860€
- **Subtotal:** 15.560€
- IVA 21%: 3.267,60€
- **TOTAL:** 18.827,60€

### Notas
- Pago: 40% al inicio, 30% a mitad de obra, 30% final.
- Plazo: 12 semanas desde confirmación.

---

## Tono

Práctico y visual. Explicar **qué elementos debe tener un presupuesto profesional** (no solo números, también contexto: cliente, fecha, plazos, notas). Enfatizar que **Veta automatiza la generación del PDF** desde los datos del proyecto, con estructura profesional lista, sin depender de plantillas Excel que hay que mantener a mano.
