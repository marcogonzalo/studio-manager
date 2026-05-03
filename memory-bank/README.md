# Memory Bank — Guía de uso

Este directorio mantiene contexto que **no se infiere bien del código**: decisiones de producto, convenciones no obvias y estado actual del proyecto.

## Regla de contenido

- **Incluir:** Preferencias, decisiones de negocio, estado/fase, WIP, limitaciones conocidas, copy/SEO que es fuente de verdad, rutas de producto (planes/landings).
- **Excluir:** Stack y versiones (→ `package.json`, `tsconfig`), esquema de tablas (→ `src/types`, migraciones), estructura de carpetas (→ `src/`), flujos que se ven en el código.

## Archivos

| Archivo | Propósito |
|---------|-----------|
| `activeContext.md` | Fase actual, WIP, próximos pasos, decisiones activas. **Única fuente de "qué está pasando ahora".** |
| `productContext.md` | Producto (nombre, audiencia), plan landings (rutas, perfiles, pains), palabras clave SEO, copy de marketing de referencia. |
| `constraints.md` | Limitaciones técnicas y convenciones no obvias (env B2/Supabase/Docker, circular deps, PostCSS, RLS, patrón assets). |
| `progress.md` | Resumen por áreas de lo completado y pendiente. Detalle histórico en git. |

Ver `OPTIMIZATION_PROPOSAL.md` para el criterio de la optimización aplicada.
