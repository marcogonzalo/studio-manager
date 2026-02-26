# Limitaciones y convenciones (no inferibles solo del código)

## Entorno y variables

- **Supabase:** Local con `npx supabase start`. Producción: Supabase Cloud. Claves: `NEXT_PUBLIC_SUPABASE_*` (cliente), `SUPABASE_SECRET_KEY` o `SUPABASE_SERVICE_ROLE_KEY` en servidor (ver `src/lib/supabase/keys.ts`).
- **Backblaze B2:** Imágenes y documentos. Variables: `B2_APPLICATION_KEY_ID`, `B2_APPLICATION_KEY`, `B2_BUCKET_ID`, `B2_BUCKET_NAME`. Rutas: `assets/{userId}/catalog/`, `assets/{userId}/projects/{projectId}/img/`, `.../doc/`.
- **Docker:** `extra_hosts: localhost:host-gateway` para que el contenedor alcance Supabase en el host.
- **CI/CD:** Pipeline en `.github/workflows/ci.yml`; documentación en `docs/ci-cd.md`.

## Patrones de datos

- **Assets y almacenamiento:** Cada subida crea fila en tabla `assets` y opcionalmente `asset_id` en tablas de dominio (`products`, `project_documents`, `space_images`). Bytes en B2. `user_storage_usage` mantenido por triggers.
- **RLS:** Todas las tablas con RLS habilitado; políticas por `user_id` / `auth.uid()`. No confiar solo en comprobaciones en cliente.

## Limitaciones técnicas

- **Dependencias circulares:** Evitar importar interfaces desde archivos de componentes; usar `src/types/index.ts`.
- **PostCSS:** Tailwind v4 requiere el plugin `@tailwindcss/postcss`.
