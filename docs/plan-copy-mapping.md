# Propuesta: documento de mapeo plan → copy comercial

Objetivo: una única fuente de verdad que relacione las **columnas y modalidades de la tabla `plans`** (y valores derivados como `effective_storage_limit_mb`) con **texto comercial humanizado**, para consumir desde **`/pricing`**, las vistas de planes **`/plan-base-primer-proyecto-interiorismo`**, **`/plan-pro-independientes-diseno-interior`**, **`/plan-studio-empresas-arquitectura-diseno-interior`** y **`/settings/plan`** (y `/settings/plan/change`) de forma homologada.

---

## 1. Origen de datos (BD)

La tabla `plans` expone:

- **Consumibles (integer):** `projects_limit`, `clients_limit`, `suppliers_limit`, `catalog_products_limit`, `storage_limit_mb`  
  Convención: `0` = no disponible, `-1` = ilimitado, `N` = tope.

- **Modalidades (enum `plan_feature_modality`):** `none` | `basic` | `plus` | `full`  
  Progresión: **none** → **basic** → **plus** → **full**.
  - **none:** la funcionalidad no está disponible (oculta o desactivada).
  - **basic**, **plus**, **full:** niveles crecientes de capacidad.

  Columnas de modalidad: `pdf_export_mode`, `multi_currency_per_project`, `purchase_orders`, `costs_management`, `payments_management`, `documents`, `notes`, `summary`, `support_level`.

**Homologación:** en todos los casos donde “basic” significaba “no existe” o “desactivado”, se usa **none** para que solo `none` represente “no disponible”.

### Ejemplo: exportación / presupuesto (`pdf_export_mode`)

| Modalidad | Significado                                            |
| --------- | ------------------------------------------------------ |
| **none**  | No se puede exportar presupuesto.                      |
| **basic** | Exportación de PDF sin filtros ni personalización.     |
| **plus**  | Personalización con marca Veta y filtro del contenido. |
| **full**  | Personalización white label (marca propia).            |

En planes: **Base** = `basic`, **Pro** = `plus`, **Studio** = `full`.

El tipo frontend `PlanConfig` (`src/types/index.ts`) refleja estos campos y añade opcionales como `effective_storage_limit_mb` / `effective_active_projects_limit` cuando aplica.

---

## 2. Tabla: funcionalidades y modalidades por plan

Valor por plan para cada columna de la BD. Consumibles = número (0, N o -1); modalidades = `none` | `basic` | `plus` | `full`. Donde antes “basic” significaba “no disponible”, se homologa a **none**.

**Regla de diseño:** cuando todos los planes tienen la misma modalidad (p. ej. todos `basic`) o se repite en varios, es porque esa funcionalidad aún no tiene mayor desarrollo y todos reciben lo mismo. Cuando se desarrollen más niveles, se diferenciará por plan.

| Funcionalidad (columna)      | Base  | Pro   | Studio |
| ---------------------------- | ----- | ----- | ------ |
| **Consumibles**              |       |       |        |
| `projects_limit`             | 1     | 5     | 50     |
| `clients_limit`              | 10    | -1    | -1     |
| `suppliers_limit`            | 50    | -1    | -1     |
| `catalog_products_limit`     | 50    | -1    | -1     |
| `storage_limit_mb`           | 500   | 10240 | 102400 |
| **Modalidades**              |       |       |        |
| `summary`                    | basic | basic | basic  |
| `documents`                  | basic | basic | basic  |
| `notes`                      | basic | basic | basic  |
| `pdf_export_mode`            | basic | plus  | full   |
| `costs_management`           | basic | plus  | plus   |
| `purchase_orders`            | none  | basic | plus   |
| `payments_management`        | none  | basic | plus   |
| `multi_currency_per_project` | basic | plus  | full   |
| `support_level`              | none  | basic | full   |

Nota: `multi_currency_per_project` en Base se deja en **basic** en el plan gratuito porque se puede establecer una moneda para todos los proyectos. Si en BD está hoy `none`, la migración deberá cambiarlo a `basic`.

---

## 3. Consumidores

| Vista                                                | Origen del plan                                              | Uso del mapeo                                            |
| ---------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| `/pricing`                                           | Datos estáticos o fetch de `plans` (Base, Pro, Studio)       | Lista de features por plan para las tarjetas de precios. |
| `/plan-base-primer-proyecto-interiorismo`            | Config estática Base (`getPlanConfigForDisplay("BASE")`)     | Landing comercial del plan Base; lista de features.      |
| `/plan-pro-independientes-diseno-interior`           | Config estática Pro (`getPlanConfigForDisplay("PRO")`)       | Landing comercial del plan Pro; lista de features.       |
| `/plan-studio-empresas-arquitectura-diseno-interior` | Config estática Studio (`getPlanConfigForDisplay("STUDIO")`) | Landing comercial del plan Studio; lista de features.    |
| `/settings/plan`                                     | `get_effective_plan` (plan actual)                           | Resumen de qué incluye el plan actual.                   |
| `/settings/plan/change`                              | Lista de planes (Pro, Studio) o fetch de `plans`             | Lista de features por plan en el comparador.             |

Todos deben obtener el array de strings comerciales llamando a la misma función/helpers que lean este mapeo.

---

## 4. Mapeo: consumibles → copy

Solo se emite línea cuando el valor es “visible” (p. ej. no mostrar “0 proyectos” si se considera no disponible). Se usa el límite efectivo si existe (`effective_active_projects_limit`, `effective_storage_limit_mb`), si no el de la fila del plan.

| Columna                                           | Valor             | Copy (es)                                                |
| ------------------------------------------------- | ----------------- | -------------------------------------------------------- |
| `projects_limit`                                  | 1                 | 1 proyecto activo                                        |
|                                                   | 5                 | 5 proyectos activos                                      |
|                                                   | 50                | 50 proyectos activos                                     |
|                                                   | N (otro)          | {N} proyectos activos                                    |
|                                                   | -1                | Proyectos ilimitados                                     |
|                                                   | 0                 | _(no mostrar o "No disponible")_                         |
| `clients_limit`                                   | 10                | 10 clientes                                              |
|                                                   | N (otro positivo) | {N} clientes                                             |
|                                                   | -1                | Clientes ilimitados                                      |
|                                                   | 0                 | _(no mostrar)_                                           |
| `suppliers_limit`                                 | 50                | 50 proveedores                                           |
|                                                   | N (otro positivo) | {N} proveedores                                          |
|                                                   | -1                | Proveedores ilimitados                                   |
|                                                   | 0                 | _(no mostrar)_                                           |
| `catalog_products_limit`                          | 50                | 50 productos en catálogo                                 |
|                                                   | N (otro positivo) | {N} productos en catálogo                                |
|                                                   | -1                | Productos ilimitados                                     |
|                                                   | 0                 | _(no mostrar)_                                           |
| `storage_limit_mb` / `effective_storage_limit_mb` | 500               | 500 MB de almacenamiento                                 |
|                                                   | 10240             | 10 GB de almacenamiento                                  |
|                                                   | 102400            | 100 GB de almacenamiento                                 |
|                                                   | N (otro positivo) | {N} MB de almacenamiento _(o formatear en GB si ≥ 1024)_ |
|                                                   | -1                | Almacenamiento ilimitado                                 |
|                                                   | 0                 | _(no mostrar)_                                           |

---

## 5. Mapeo: modalidades → copy

Solo se emite línea cuando la modalidad **no** es `none`. Si es `none`, no se añade ningún ítem (o se puede tener un modo “incluir no disponible” para listas explícitas).

| Columna                      | basic                                | plus                                                   | full                                                      |
| ---------------------------- | ------------------------------------ | ------------------------------------------------------ | --------------------------------------------------------- |
| `pdf_export_mode`            | Exportación de presupuesto en PDF    | Presupuesto personalizado con membrete de la app       | Presupuesto personalizable con marca propia (white label) |
| `multi_currency_per_project` | Una única moneda para toda la cuenta | Una única moneda y un único impuesto en toda la cuenta | Definición de moneda e impuestos por proyecto             |
| `purchase_orders`            | Pedidos de compra                    | Ídem                                                   | Ídem                                                      |
| `costs_management`           | Control de costes                    | Añade control de márgenes                              | Ídem                                                      |
| `payments_management`        | Control de pagos                     | Ídem                                                   | Ídem                                                      |
| `documents`                  | Subida de renders y documentos       | Ídem                                                   | Ídem                                                      |
| `notes`                      | Notas por proyecto                   | Ídem                                                   | Ídem                                                      |
| `summary`                    | Resumen de estado de proyecto        | Ídem                                                   | Ídem                                                      |
| `support_level`              | Soporte por email                    | Soporte por email                                      | Soporte prioritario                                       |

---

## 6. Orden de aparición recomendado

Para que el listado sea comercial y legible, se sugiere este orden al generar el array de features:

1. Consumibles en orden: proyectos → clientes → proveedores → productos en catálogo → almacenamiento.
2. Luego características por modalidad en un orden fijo, p. ej.: presupuesto → pedidos de compra → control de costes/márgenes → control de pagos → moneda/impuestos → documentos → notas → resumen → soporte.
3. Opcionalmente, al inicio o al final, las “generales” (p. ej. exportación PDF).

Cada consumidor puede decidir si añade prefijos tipo “Todo lo incluido en Base/Pro” en la vista (no forman parte del mapeo).

---

## 7. Implementación prevista (híbrido)

- **Código:** módulo en `src/lib/plan-copy.ts` (o `plan-features.ts`) que:
  - Define constantes/objetos con las tablas anteriores (consumibles por valor, modalidades por columna).
  - Exporta una función `getCommercialFeatures(config: PlanConfig): string[]` que recorre consumibles y modalidades y devuelve el array de strings en el orden definido.
  - Opcional: `getGeneralFeatures(config?: PlanConfig): string[]` para las generales, o integrarlas dentro de `getCommercialFeatures`.
- **Datos:** los valores (límites, modalidades) vendrán siempre de la BD (o de un snapshot estático alineado con la BD). El copy vive solo en este módulo.

Con esto, las dos vistas solo tienen que pasar `PlanConfig` (o el plan estático equivalente) y renderizar el array devuelto, manteniendo el mismo texto en `/pricing` y en `/settings` de forma homologada.
