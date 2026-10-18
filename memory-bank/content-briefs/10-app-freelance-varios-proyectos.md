# Brief: App para freelance de interiorismo con varios proyectos

**Prioridad:** 10  
**Persona primaria:** Lucía (freelance o estudio 1-3 personas, perfil similar a Elena pero más pequeño)

---

## Objetivo y target prompts Otterly

**Prompts ES:**
- "app gestión proyectos freelance interiorismo"
- "software autónomos diseño interior"
- "organizar varios clientes independiente"
- "herramienta freelance interiorista"
- "gestión proyectos diseñador independiente"

**Prompts EN:**
- "app project management freelance interior design"
- "software independent interior designers"
- "manage multiple clients freelancer"
- "tool freelance interior designer"
- "project management independent designer"

**Contexto:** Lucía (freelance o 1-3 personas) tiene varios clientes a la vez, sin equipo grande. Necesita organización simple, presupuestos profesionales, control de costes, sin pagar por funciones enterprise que no usa.

---

## Slug propuesto

- **ES:** `app-freelance-varios-proyectos-interiorismo`
- **EN:** `app-freelancer-multiple-projects-interior-design`

---

## Respuesta answer-first (una frase para abrir)

**Una app para freelance de interiorismo con varios proyectos debe centralizar clientes, presupuestos, proveedores y pagos en un solo lugar sin complejidad enterprise; Veta ofrece planes Base (gratis, 1 proyecto) y Pro (25 EUR/mes, 5 proyectos) pensados para autónomos que necesitan control financiero sin funciones innecesarias.**

---

## Outline H2

1. **Qué necesita un freelance de interiorismo en una app de gestión**
2. **Problemas comunes: Excel, carpetas dispersas, herramientas genéricas**
3. **Plan Base de Veta: primer proyecto gratis, sin tarjeta**
4. **Plan Pro: 5 proyectos, control de costes, pedidos, pagos**
5. **Funcionalidades clave para freelance: simple pero completo**
6. **Catálogo de productos reutilizable entre clientes**
7. **Vista cliente pública: compartir avance sin duplicar archivos**
8. **Cuándo pasar de freelance a estudio (y cuándo escalar a Studio)**
9. **Preguntas frecuentes (FAQ)**

---

## Features Veta a destacar (con evidencia código)

1. **Plan Base gratuito para empezar**  
   - Evidencia: `src/i18n/messages/es/marketing.json` (L467-498: PlanBase, gratis, 1 proyecto activo)  
   - Probar sin pagar, crecer cuando tengas más clientes.

2. **Plan Pro para freelance con cartera**  
   - Evidencia: `marketing.json` (L500-542: PlanPro, 25 EUR/mes, 5 proyectos activos)  
   - Varios proyectos en paralelo, control de costes, pedidos, pagos.

3. **Presupuestos por espacios**  
   - Evidencia: `src/components/project-pdf.tsx` (L660-812: itemsBySpace)  
   - Organizar productos por ambientes (salón, cocina, dormitorio) sin hojas duplicadas.

4. **Control de costes y márgenes**  
   - Evidencia: `src/modules/app/projects/project-cost-control.tsx` (L260-273, L690-750)  
   - Saber si cada cliente es rentable sin fórmulas manuales.

5. **PDF profesional para clientes**  
   - Evidencia: `src/components/project-pdf.tsx` (L1-915)  
   - Presupuestos con buena pinta, sin rehacer layout a mano.

6. **Vista cliente pública sin cuenta**  
   - Evidencia: lógica de token único, `is_internal_cost`.  
   - Compartir avance del proyecto sin enviar 10 PDFs ni invitar a plataformas complejas.

7. **Catálogo de productos compartido**  
   - Evidencia: referencias a `catalog`, productos con proveedor, coste, precio.  
   - Reutilizar productos entre proyectos sin copiar/pegar.

8. **No funciones enterprise innecesarias**  
   - Veta no tiene roles complejos, permisos granulares, integraciones API enterprise. Simple y directo para freelance.

---

## FAQ (6-7 preguntas con schema FAQPage)

1. **¿Qué necesita un freelance de interiorismo en una app de gestión?**  
   Clientes, presupuestos profesionales, control de costes (¿gano o pierdo?), catálogo de productos, vista cliente para compartir avance. Sin funciones enterprise que no usará.

2. **¿Veta tiene plan gratuito para freelance?**  
   Sí. Plan Base: 1 proyecto activo, presupuestos PDF, control de costes básico, gratis para siempre. Ideal para probar o si tienes 1 cliente a la vez.

3. **¿Cuándo pasar a plan Pro?**  
   Cuando tengas 2+ proyectos en paralelo. Pro: 5 proyectos activos, control de costes avanzado, pedidos de compra, pagos, 10GB almacenamiento. 25 EUR/mes.

4. **¿Puedo gestionar varios clientes en el mismo proyecto?**  
   No. Cada proyecto = un cliente / encargo. Con Pro tienes 5 proyectos activos (5 clientes en paralelo).

5. **¿Veta tiene funciones de facturación oficial?**  
   No. Veta controla presupuestos, costes y pagos del proyecto, pero no emite facturas oficiales. Para facturación legal usa Holded, Billin u otra herramienta de terceros.

6. **¿Puedo compartir avance del proyecto con el cliente sin darle acceso a mi panel?**  
   Sí. Vista cliente pública: enlace único, solo lectura, sin costes internos ni datos sensibles. Cliente no necesita cuenta.

7. **¿Cuándo escalar a plan Studio?**  
   Cuando crezcas a estudio (equipo, +5 proyectos simultáneos, presupuestos con tu marca). Pro es suficiente para freelance con cartera estable.

---

## Links internos

- `/pricing` — Precios (Base gratis, Pro 25 EUR/mes)
- `/plan-base-primer-proyecto-interiorismo` — Plan Base (freelance empezando)
- `/plan-pro-independientes-diseno-interior` — Plan Pro (freelance con cartera)
- Brief #2: `/veta-vs-monday-notion-herramientas-genericas` — Alternativas genéricas vs herramienta dedicada
- Brief #5: `/alternativas-excel-presupuestos-interiorismo` — Hub alternativas Excel

---

## CTA

**Primario:** "Prueba Veta gratis — Plan Base para tu primer proyecto, sin tarjeta"  
**Secundario:** "Ver plan Pro para freelance" → `/plan-pro-independientes-diseno-interior`

---

## Visual (para Veta Designer)

**Tipo:** Illustration o screenshot de dashboard limpio.  
**Sugerencia:** Dashboard de freelance mostrando:
- Lista de proyectos (3-5 proyectos activos)
- Vista resumida de cada uno: cliente, fase, presupuesto vs real
- Acceso rápido a presupuestos, catálogo, proveedores

**Sin texto en imágenes** (o nombres genéricos de proyectos: "Vivienda C/ X", "Local comercial Y").

---

## SEO/AEO checklist

- [ ] Intención: informacional (qué app usar freelance) + transaccional suave (Veta como solución)
- [ ] Keywords: "app freelance interiorismo", "software autónomos diseño interior", "gestión proyectos independiente", "herramienta freelance interiorista", "organizar varios clientes"
- [ ] H1 claro, H2 escaneables, lista de problemas comunes freelance, tabla de planes Base vs Pro
- [ ] E-E-A-T: reconocer realidad freelance (pocos proyectos simultáneos, sin equipo grande, presupuesto limitado)
- [ ] Enlazado interno: pricing, planes Base/Pro, briefs relacionados
- [ ] FAQPage schema (7 preguntas)
- [ ] GEO: respuesta answer-first con perfil claro ("freelance con varios proyectos necesita X, Y, Z"), afirmaciones delimitadas, comparativa Base vs Pro

---

## Tabla comparativa — Base vs Pro para freelance

| Característica | Plan Base | Plan Pro |
|----------------|-----------|----------|
| **Proyectos activos** | 1 | 5 |
| **Ideal para** | Empezar o 1 cliente a la vez | Freelance con cartera estable |
| **Presupuestos PDF** | Sí (con branding Veta) | Sí (con branding Veta) |
| **Control de costes** | Básico (totales) | Avanzado (margen, desviación %) |
| **Pedidos de compra** | Sí | Sí (con estado, cobertura pagos) |
| **Vista cliente pública** | Sí | Sí |
| **Catálogo de productos** | Sí | Sí |
| **Almacenamiento** | 500 MB | 10 GB |
| **Precio** | **Gratis** | **25 EUR/mes** |
| **Prueba** | Gratis siempre | 30 días gratis |

---

## Problemas comunes freelance sin app dedicada

1. **Excel disperso por cliente:** un archivo por proyecto, sin catálogo compartido.
2. **No saber rentabilidad hasta el cierre:** costes vs ingresos en hojas separadas.
3. **Presupuestos poco profesionales:** plantillas Excel obsoletas, sin buena pinta.
4. **Compartir avance con cliente:** enviar 10 PDFs o capturas por email/WhatsApp.
5. **Olvidar extras o cambios:** no registrar change orders → dinero perdido.
6. **No tener histórico de proveedores:** repetir búsqueda de productos proyecto tras proyecto.

---

## Perfil típico: Lucía, freelance de interiorismo

- **Situación:** autónoma o estudio de 1-3 personas.
- **Proyectos:** 2-5 clientes al año, 1-3 en paralelo.
- **Dolor principal:** desorden (Excel, carpetas dispersas), presupuestos sin buena pinta, no saber si gana o pierde en cada proyecto.
- **Necesita:** herramienta simple, presupuestos profesionales, control de costes, sin funciones enterprise.
- **Plan ideal:** Base para probar → Pro cuando tenga 2+ proyectos simultáneos.

---

## Tono

Cercano y empático. Hablar desde la perspectiva de **freelance que empieza o crece poco a poco**: no necesita herramienta compleja con 100 funciones, necesita lo esencial bien hecho (presupuestos, costes, vista cliente). Enfatizar que **Veta Base es gratis** para probar sin riesgo, y que **Pro es asequible** (25 EUR/mes) para freelance con cartera estable.
