---
name: veta-security-owasp
description: >-
  Use when reviewing or implementing security-sensitive code in Veta: forms, Server
  Actions, Route Handlers under src/app/api, auth boundaries, redirects, Supabase
  access, or when the user asks for OWASP Top 10, injection hardening, or private
  route protection.
---

# Veta – Ciberseguridad, formularios, API y OWASP Top 10

## Cuándo aplicar esta skill

- Nuevo o cambio en **formularios**, **Server Actions** o **validación** de entrada.
- Nuevo o cambio en **Route Handlers** bajo `src/app/api/` (GET/POST/PUT/PATCH/DELETE).
- Nueva **ruta o layout** que pueda ser privada o pública.
- Auditoría, PR de seguridad, o petición explícita de **OWASP** / hardening.

Relacionadas: `veta-forms-validation` (RHF + Zod + Select), `veta-supabase-rls` (cliente y RLS), `veta-app-routing` (público vs privado, `PUBLIC_ROUTES`). La regla `.cursor/rules/01-security.mdc` resume políticas; esta skill es la **checklist operativa** al implementar o revisar.

---

## 1. Formularios y entradas (inyección y datos malformados)

- **Servidor primero:** Toda entrada que persista o dispare efectos secundarios debe validarse con **Zod** (o equivalente) en **Server Action** o **API**, no solo en el cliente.
- **Mismo esquema o equivalente** entre cliente (UX) y servidor (autoridad); el servidor nunca confía en el cliente.
- **SQL:** Usar el cliente Supabase (consultas parametrizadas). Evitar SQL crudo en aplicación salvo migraciones/controlado; nunca concatenar input de usuario en SQL.
- **NoSQL / filtros:** No pasar objetos de query construidos desde el usuario sin whitelist de campos y tipos.
- **XSS:** Evitar `dangerouslySetInnerHTML` con contenido de usuario. Si es inevitable, sanitizar con librería mantenida y política clara.
- **Subidas:** Limitar tipo MIME/tamaño en servidor; no confiar en la extensión del nombre; para rutas críticas valorar comprobaciones adicionales según negocio.

---

## 2. API (`src/app/api/...`) — crítico en Veta

El middleware **no redirige** peticiones sin sesión hacia `/api/*`; la solicitud llega al handler. Por tanto **cada ruta que deba ser privada debe comprobar sesión explícitamente**.

Checklist por handler:

1. **`supabase.auth.getUser()`** (u otro mecanismo acordado) al inicio; si no hay usuario, **`401`** (JSON), no asumir que el middleware bloqueó.
2. **Cuerpo, query y params:** parsear y validar con **Zod**; rechazar con **`400`** si falla.
3. **Autorización (IDOR):** No tomar `userId`, `projectId`, etc. del cuerpo como verdad. Derivar identidad del **usuario autenticado** y comprobar en BD/RLS que el recurso le pertenece o que su rol lo permite.
4. **Secretos:** `SUPABASE_SERVICE_ROLE_KEY` solo en servidor; nunca en bundles ni en código enviado al cliente.
5. **Errores:** Respuestas genéricas al cliente si hace falta; no filtrar stack traces ni detalles internos en producción.

---

## 3. Vistas y rutas privadas

- **App autenticada:** Rutas bajo `src/app/veta-app/...` con layouts que verifiquen sesión (p. ej. `getUser()` y redirección a sign-in).
- **Marketing / auth:** `(marketing)` y `(auth)` son públicos por convención; no mezclar datos sensibles solo con “ocultar” en UI.
- **Nueva ruta pública** (fuera de grupos conocidos): actualizar **`PUBLIC_ROUTES`** en `src/lib/supabase/middleware.ts` y revisar `isPublicPath()` con prefijos de locale (`/en`, `/es`).
- **Redirects:** Parámetros `redirect` deben ser rutas internas seguras (en este repo: patrón tipo `getSafeRedirectPath` — evitar open redirect).

Verificación manual rápida:

- Sin cookie de sesión: **no** debe cargar datos privados en páginas que requieren login.
- Con sesión de otro usuario: **no** debe acceder a IDs de recursos ajenos (comprobar RLS + comprobaciones en API).

---

## 4. OWASP Top 10 (mapa breve para Veta)

| Riesgo                            | Qué comprobar en Veta                                                                                                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A01 Broken Access Control**     | RLS en todas las tablas; políticas SELECT/INSERT/UPDATE/DELETE; API y acciones con `getUser()` + comprobación de recurso; sin confiar en IDs enviados por el cliente. |
| **A02 Cryptographic Failures**    | Sin secretos en cliente; HTTPS (hosting); contraseñas solo vía Supabase Auth.                                                                                         |
| **A03 Injection**                 | Zod en servidor; cliente Supabase; sin SQL concatenado con input.                                                                                                     |
| **A04 Insecure Design**           | Defensa en profundidad: UI + API + RLS; rate limiting en rutas sensibles si aplica.                                                                                   |
| **A05 Security Misconfiguration** | `npm audit`; buckets/storage no más públicos de lo necesario; cabeceras y config de Next revisadas en cambios relevantes.                                             |
| **A06 Vulnerable Components**     | Dependencias actualizadas; eliminar paquetes sin uso.                                                                                                                 |
| **A07 Auth failures**             | Sesión vía Supabase; cookies coherentes con el flujo documentado en middleware; flujos demo/restricciones donde existan.                                              |
| **A08 Data integrity**            | CI reproducible (`npm ci`); no ejecutar código no confiable en build.                                                                                                 |
| **A09 Logging / monitoring**      | Logs sin PII innecesaria; errores críticos rastreables sin filtrar secretos.                                                                                          |
| **A10 SSRF**                      | Si el servidor **fetch**ea URLs elegidas por el usuario (imágenes, webhooks), validar esquema/host y allowlist cuando sea posible.                                    |

---

## 5. Archivos y carpetas a revisar

- `src/lib/supabase/middleware.ts` — `PUBLIC_ROUTES`, `isPublicPath`, redirects.
- `src/app/veta-app/**/layout.tsx` — comprobación de sesión.
- `src/app/api/**/route.ts` — auth, Zod, autorización por recurso.
- Server Actions y formularios que mutan datos — validación y usuario actual.
- `supabase/migrations/**` — RLS y políticas nuevas o alteradas.

---

## 6. Si encuentras un hueco

1. Corregir en **servidor** (validación, auth, RLS) antes que solo en UI.
2. Añadir o ajustar **tests** (p. ej. API devuelve 401 sin sesión, 403/404 para recurso ajeno) cuando el flujo sea estable.
3. No documentar vulnerabilidades activas en comentarios públicos del repo; usar issue privado o proceso interno.
