# Uso de capacidades por plan en la app

En la app, la visibilidad o habilitación de funcionalidades se decide con **`usePlanCapability`** (`src/lib/use-plan-capability.ts`) y la lógica en **`src/lib/plan-capability.ts`**, sin depender del copy comercial (`plan-copy.ts`).

## API

- **`usePlanCapability(featureKey, options?)`**  
  Devuelve `true` si la capacidad está disponible. Con `options.minModality: "plus"` o `"full"` exige ese nivel mínimo (p. ej. filtro de presupuesto solo con plus o full).

- **`checkCapability(config, featureKey, options?)`**  
  Versión pura; usar cuando no haya contexto de sesión (o en tests).

## Clave → qué controla en la app

| Clave                                      | Dónde se usa                                                                                       | Nivel típico                                                                                                       |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `pdf_export_mode`                          | Pestaña Presupuesto; filtros y opciones de export PDF; opciones "excluir del proyecto" en add-item | Disponible: basic. Filtros/opciones plus: `minModality: "plus"`. White label / export full: `minModality: "full"`. |
| `documents`                                | Pestaña Espacios (subida de renders/documentos); pestaña Documentos                                | Disponible: no none. Subida completa: `minModality: "full"`.                                                       |
| `costs_management`                         | Pestaña Gastos; opciones extra en línea de gastos                                                  | Disponible: no none. Opciones full: `minModality: "full"`.                                                         |
| `purchase_orders`                          | Pestaña Pedidos de compra                                                                          | `usePlanCapability("purchase_orders")` para mostrar/deshabilitar.                                                  |
| `payments_management`                      | Pestaña Pagos                                                                                      | Idem.                                                                                                              |
| `multi_currency_per_project`               | Moneda/impuesto por proyecto                                                                       | Según necesidad (disponible vs plus/full).                                                                         |
| `support_level`                            | Enlaces o CTAs de soporte                                                                          | Según necesidad.                                                                                                   |
| `projects_limit`, `storage_limit_mb`, etc. | Límites de uso (barras en settings/plan)                                                           | `isCapabilityAvailable` para "¿tiene acceso?" (límite > 0 o -1).                                                   |

Al añadir una restricción nueva, usar la clave de esta tabla y, si aplica, `minModality: "plus"` o `"full"`.
