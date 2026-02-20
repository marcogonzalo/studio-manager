# Revisión de Seguridad OWASP TOP 10

**Fecha:** 20 de Febrero, 2026  
**Aplicación:** Veta - Interior Design Project Manager  
**Framework:** Next.js 16.1.4 (App Router) + Supabase

---

## Resumen Ejecutivo

Esta revisión evalúa la aplicación según las categorías del OWASP TOP 10 2021. La aplicación utiliza Next.js con Supabase como backend, implementando autenticación mediante magic links (sin contraseñas) y Row Level Security (RLS) para control de acceso.

**Nota importante:** Esta aplicación usa exclusivamente magic links para autenticación. No se emplean contraseñas, por lo que las políticas relacionadas con contraseñas no aplican. El sistema de autenticación es más seguro al eliminar el vector de ataque de contraseñas débiles o comprometidas.

**Estado General:** ✅ **BUENO** con áreas de mejora identificadas.

---

## 1. Broken Access Control (A01:2021)

### ✅ **Fortalezas**

1. **Row Level Security (RLS) habilitado:**
   - Todas las tablas principales tienen RLS habilitado (`profiles`, `clients`, `projects`, `products`, `suppliers`, `purchase_orders`, `payments`, `plan_assignments`, etc.)
   - Políticas RLS correctamente implementadas usando `auth.uid() = user_id`
   - Políticas para SELECT, INSERT, UPDATE y DELETE en todas las tablas críticas

2. **Middleware de autenticación:**
   - Middleware protege rutas autenticadas (`src/lib/supabase/middleware.ts`)
   - Redirección automática a `/auth` para usuarios no autenticados
   - Verificación de sesión en todas las rutas API

3. **Validación de autorización en API routes:**
   - Todas las rutas API verifican `supabase.auth.getUser()` antes de procesar
   - Verificación de propiedad de recursos (ej: `user_id` matching)

### ⚠️ **Vulnerabilidades Identificadas**

1. **CRÍTICO - Falta validación de propiedad en DELETE de documentos/imágenes:**

   ```typescript
   // src/app/api/upload/document/route.ts línea 59
   // DELETE endpoint acepta cualquier URL sin verificar que pertenece al usuario
   const url = searchParams.get("url");
   await deleteProductImage(url); // ⚠️ No valida ownership
   ```

   **Riesgo:** Un usuario podría eliminar archivos de otros usuarios si conoce la URL.
   **Recomendación:** Validar que la URL pertenece al usuario actual antes de eliminar.

2. **MEDIO - Falta verificación de ownership en uploads:**
   - Los endpoints de upload verifican autenticación pero no validan explícitamente que `projectId` pertenece al usuario
   - Aunque RLS protege a nivel de base de datos, debería validarse también en la API

3. **BAJO - Account deletion endpoint usa Service Role Key:**
   - El endpoint `/api/account/delete` usa Service Role Key para operaciones administrativas
   - Aunque valida el email del usuario, el uso de Service Role Key bypassa RLS
   - **Mitigación:** Solo se usa para operaciones de eliminación de cuenta del propio usuario

### 📋 **Recomendaciones**

1. **Implementar validación de ownership en DELETE endpoints:**

   ```typescript
   // Verificar que el archivo/documento pertenece al usuario antes de eliminar
   const { data: document } = await supabase
     .from("project_documents")
     .select("project_id, projects!inner(user_id)")
     .eq("url", url)
     .single();

   if (!document || document.projects.user_id !== user.id) {
     return NextResponse.json({ error: "No autorizado" }, { status: 403 });
   }
   ```

2. **Agregar validación explícita de ownership en uploads:**

   ```typescript
   // Verificar que projectId pertenece al usuario
   const { data: project } = await supabase
     .from("projects")
     .select("id")
     .eq("id", projectId)
     .eq("user_id", user.id)
     .single();

   if (!project) {
     return NextResponse.json(
       { error: "Proyecto no encontrado" },
       { status: 404 }
     );
   }
   ```

---

## 2. Cryptographic Failures (A02:2021)

### ✅ **Fortalezas**

1. **Autenticación segura:**
   - Supabase Auth maneja el hashing de contraseñas (bcrypt)
   - Magic links con tokens seguros
   - PKCE flow implementado correctamente

2. **HTTPS:**
   - Automático en producción (Vercel/Supabase)
   - Configuración correcta de redirects en Supabase

3. **Manejo de secretos:**
   - Service Role Key solo usado en servidor (`getSupabaseServiceRoleKey()`)
   - Variables de entorno separadas para cliente/servidor
   - No se exponen secretos en el bundle del cliente

### ⚠️ **Vulnerabilidades Identificadas**

1. **BAJO - JWT expiry configurado:**
   ```toml
   # supabase/config.toml línea 138
   jwt_expiry = 3600  # 1 hora - aceptable pero podría ser más corto para operaciones sensibles
   ```

### 📋 **Recomendaciones**

1. **Considerar refresh token rotation más estricto:**
   - Ya está habilitado (`enable_refresh_token_rotation = true`)
   - Considerar reducir `refresh_token_reuse_interval` si es necesario

---

## 3. Injection (A03:2021)

### ✅ **Fortalezas**

1. **Uso de cliente Supabase:**
   - Todas las consultas usan el cliente Supabase que usa queries parametrizadas automáticamente
   - No se encontraron consultas SQL crudas sin parametrizar

2. **Validación con Zod:**
   - Formularios validan con esquemas Zod antes de enviar
   - Validación tanto cliente como servidor en algunos casos

3. **Validación de tipos de archivo:**
   - Validación estricta de MIME types para imágenes y documentos
   - Whitelist de tipos permitidos

### ⚠️ **Vulnerabilidades Identificadas**

1. **BAJO - Uso de `dangerouslySetInnerHTML` en JSON-LD:**

   ```typescript
   // src/components/json-ld.tsx línea 8
   dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
   ```

   **Riesgo:** Si `data` contiene contenido malicioso, podría ejecutarse.
   **Mitigación:** El contenido es generado internamente y no viene de usuario, pero debería sanitizarse.

2. **BAJO - Validación de entrada en algunos endpoints:**
   - Algunos endpoints aceptan `FormData` sin validación exhaustiva de tipos
   - Aunque hay validación de tamaño y tipo de archivo, podría mejorarse

### 📋 **Recomendaciones**

1. **Sanitizar JSON-LD:**

   ```typescript
   // Usar una librería como DOMPurify o validar estrictamente el schema
   import DOMPurify from 'isomorphic-dompurify';
   dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(JSON.stringify(data)) }}
   ```

2. **Agregar validación Zod en todos los endpoints API:**
   ```typescript
   // Crear schemas Zod para validar FormData en endpoints
   const uploadSchema = z.object({
     file: z.instanceof(File),
     projectId: z.string().uuid(),
     // ...
   });
   ```

---

## 4. Insecure Design (A04:2021)

### ✅ **Fortalezas**

1. **Rate limiting en Supabase:**
   - Configurado para auth endpoints (sign_in_sign_ups: 30/5min)
   - Rate limiting para emails (2/hora)
   - Token refresh limitado (150/5min)

2. **Validación de límites de plan:**
   - Trigger en base de datos valida límites de proyectos
   - Función `check_projects_plan_limit()` previene exceder límites

### ⚠️ **Vulnerabilidades Identificadas**

1. **MEDIO - Falta rate limiting en endpoints API personalizados:**
   - Los endpoints `/api/upload/*` y `/api/account/delete` no tienen rate limiting explícito
   - Dependen únicamente del rate limiting de Supabase Auth

2. **BAJO - Falta protección CSRF explícita:**
   - Next.js App Router tiene protección CSRF por defecto, pero no está documentada
   - Debería verificarse y documentarse

### 📋 **Recomendaciones**

1. **Implementar rate limiting en endpoints críticos:**

   ```typescript
   // Usar una librería como `@upstash/ratelimit` o `rate-limiter-flexible`
   import { Ratelimit } from "@upstash/ratelimit";

   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(10, "1 m"),
   });

   const { success } = await ratelimit.limit(user.id);
   if (!success) {
     return NextResponse.json(
       { error: "Demasiadas solicitudes" },
       { status: 429 }
     );
   }
   ```

2. **Documentar protección CSRF:**
   - Verificar que Next.js está protegiendo contra CSRF
   - Agregar headers de seguridad explícitos si es necesario

---

## 5. Security Misconfiguration (A05:2021)

### ✅ **Fortalezas**

1. **Configuración de Supabase:**
   - RLS habilitado en todas las tablas
   - Anonymous sign-ins deshabilitado (`enable_anonymous_sign_ins = false`)
   - Double email confirmation habilitado (`double_confirm_changes = true`)

2. **Configuración de Next.js:**
   - React Strict Mode habilitado
   - Configuración de imágenes con `remotePatterns` restrictivo

### ⚠️ **Vulnerabilidades Identificadas**

1. **CRÍTICO - Falta headers de seguridad HTTP:**

   ```typescript
   // No se encontraron headers de seguridad configurados
   // Falta: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, etc.
   ```

   **Riesgo:** Vulnerable a clickjacking, MIME type sniffing, XSS.
   **Recomendación:** Agregar headers de seguridad en `next.config.ts` o middleware.

2. **MEDIO - Configuración de imágenes muy permisiva:**

   ```typescript
   // next.config.ts línea 15
   hostname: "**"; // ⚠️ Permite cualquier hostname
   ```

   **Riesgo:** Podría permitir cargar imágenes de dominios maliciosos.
   **Recomendación:** Restringir a dominios específicos conocidos.

3. **MEDIO - Dependencias vulnerables:**
   - `npm audit` muestra vulnerabilidades en `@eslint/eslintrc`, `@typescript-eslint/*`, `eslint`
   - Aunque son dependencias de desarrollo, deberían actualizarse

4. **BAJO - Configuración de CORS no explícita:**
   - Next.js maneja CORS automáticamente, pero no está documentado
   - Para producción, debería configurarse explícitamente

### 📋 **Recomendaciones**

1. **Agregar headers de seguridad:**

   ```typescript
   // next.config.ts
   const nextConfig: NextConfig = {
     async headers() {
       return [
         {
           source: "/:path*",
           headers: [
             {
               key: "X-Frame-Options",
               value: "DENY",
             },
             {
               key: "X-Content-Type-Options",
               value: "nosniff",
             },
             {
               key: "Referrer-Policy",
               value: "strict-origin-when-cross-origin",
             },
             {
               key: "Content-Security-Policy",
               value:
                 "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
             },
           ],
         },
       ];
     },
   };
   ```

2. **Restringir hostnames de imágenes:**

   ```typescript
   images: {
     remotePatterns: [
       {
         protocol: "https",
         hostname: "backblaze.com", // Solo dominios conocidos
         // o usar el dominio de Supabase Storage
       },
     ],
   },
   ```

3. **Actualizar dependencias vulnerables:**
   ```bash
   npm audit fix
   # O actualizar manualmente las dependencias afectadas
   ```

---

## 6. Vulnerable and Outdated Components (A06:2021)

### ⚠️ **Vulnerabilidades Identificadas**

1. **MEDIO - Dependencias de desarrollo con vulnerabilidades conocidas:**

   **Vulnerabilidades detectadas:**
   - `@eslint/eslintrc`: vulnerabilidades HIGH en `ajv` (ReDoS) y `minimatch`
   - `@typescript-eslint/*`: múltiples vulnerabilidades HIGH relacionadas con `minimatch`
   - `eslint`: vulnerabilidades HIGH relacionadas con `@eslint/config-array`
   - `eslint-config-next`: vulnerabilidades HIGH relacionadas con `eslint-plugin-import`
   - `ajv`: vulnerabilidad MODERATE (ReDoS cuando se usa `$data` option)

   **Impacto:** Aunque son dependencias de desarrollo (no se incluyen en el bundle de producción), podrían:
   - Afectar el proceso de build en CI/CD
   - Exponer el entorno de desarrollo a vulnerabilidades
   - Potencialmente afectar herramientas de desarrollo si se explotan localmente

### 📋 **Recomendaciones**

#### Opción 1: Actualización Automática (Recomendada)

```bash
# 1. Intentar corrección automática
npm audit fix

# 2. Si hay actualizaciones mayores (breaking changes), revisar manualmente
npm audit fix --force  # ⚠️ Usar con precaución, puede romper compatibilidad
```

#### Opción 2: Actualización Manual Selectiva

```bash
# Actualizar dependencias específicas
npm install --save-dev \
  eslint@latest \
  @eslint/eslintrc@latest \
  @typescript-eslint/eslint-plugin@latest \
  @typescript-eslint/parser@latest \
  typescript-eslint@latest

# Verificar que no se rompió nada
npm run lint
npm run build
```

#### Opción 3: Usar Resoluciones/Overrides (Solución Temporal)

Si las actualizaciones rompen compatibilidad, puedes forzar versiones seguras:

**En `package.json`:**

```json
{
  "overrides": {
    "minimatch": "^10.0.0",
    "ajv": "^8.18.0"
  }
}
```

#### Opción 4: Implementar Actualizaciones Automáticas

**Configurar Dependabot (GitHub):**

Crear `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "tu-usuario"
    labels:
      - "dependencies"
      - "security"
    commit-message:
      prefix: "chore"
      include: "scope"
```

**O usar Renovate:**

Crear `renovate.json`:

```json
{
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchDepTypes": ["devDependencies"],
      "automerge": true,
      "automergeType": "pr",
      "labels": ["dependencies", "dev"]
    }
  ],
  "vulnerabilityAlerts": {
    "enabled": true,
    "labels": ["security"]
  }
}
```

#### Opción 5: Monitoreo Continuo

**Agregar a CI/CD pipeline:**

```yaml
# .github/workflows/security.yml
name: Security Audit
on:
  schedule:
    - cron: "0 0 * * 1" # Cada lunes
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: npm ci
      - run: npm audit --audit-level=moderate
      - name: Create issue on failure
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Security Audit Failed',
              body: 'npm audit detected vulnerabilities. Please review and update dependencies.',
              labels: ['security', 'dependencies']
            })
```

### Plan de Acción Recomendado

1. **Inmediato:**

   ```bash
   npm audit fix
   npm run lint  # Verificar que todo sigue funcionando
   npm run build # Verificar que el build funciona
   ```

2. **Corto plazo (esta semana):**
   - Si `npm audit fix` no resuelve todo, actualizar manualmente las dependencias críticas
   - Probar exhaustivamente que lint y build funcionan
   - Commitear los cambios

3. **Mediano plazo (este mes):**
   - Configurar Dependabot o Renovate
   - Agregar `npm audit` al pipeline de CI/CD
   - Documentar proceso de actualización de dependencias

### Notas Importantes

- **Dependencias de desarrollo:** Estas vulnerabilidades NO afectan el bundle de producción, solo el entorno de desarrollo
- **Breaking changes:** Las actualizaciones pueden requerir cambios en configuración de ESLint
- **Testing:** Siempre probar `npm run lint` y `npm run build` después de actualizar

---

## 7. Identification and Authentication Failures (A07:2021)

### ✅ **Fortalezas**

1. **Autenticación robusta:**
   - Magic links con PKCE flow
   - Refresh token rotation habilitado
   - Tokens JWT con expiración configurada

2. **Protección de sesiones:**
   - Cookies manejadas por Supabase SSR
   - Sesiones verificadas en middleware

### ⚠️ **Vulnerabilidades Identificadas**

1. **BAJO - Aclaración sobre email confirmation:**

   ```toml
   # supabase/config.toml línea 189
   enable_confirmations = false
   ```

   **Aclaración:** Con magic links, el email SÍ se confirma cuando el usuario hace clic en el enlace del correo. El flag `enable_confirmations` es para el flujo tradicional con contraseñas donde se requiere confirmar el email ANTES de poder iniciar sesión. Con magic links, la confirmación ocurre automáticamente al hacer clic en el enlace, por lo que `enable_confirmations = false` es correcto para este flujo.

   **Estado:** ✅ Correcto - No requiere cambios.

**Nota importante:** Esta aplicación usa magic links exclusivamente (no contraseñas), por lo que:

- Las políticas de contraseñas (`minimum_password_length`, `password_requirements`) no aplican
- `secure_password_change` no aplica (no hay contraseñas que cambiar)
- El sistema de autenticación es más seguro al no requerir contraseñas

### 📋 **Recomendaciones**

1. **Mantener configuración actual:**
   - Magic links ya proporcionan confirmación de email automática
   - No se requieren cambios en políticas de contraseñas (no aplican)

---

## 8. Software and Data Integrity Failures (A08:2021)

### ✅ **Fortalezas**

1. **Integridad de datos:**
   - Foreign keys en base de datos
   - Constraints de validación en tablas
   - Transacciones para operaciones críticas

2. **Build reproducible:**
   - `package-lock.json` presente
   - Uso de versiones fijas en dependencias

### ⚠️ **Vulnerabilidades Identificadas**

1. **BAJO - Falta verificación de integridad de dependencias:**
   - No se encontró uso de `npm ci` en documentación
   - Falta verificación de checksums de dependencias

2. **BAJO - CI/CD no documentado:**
   - No se encontró configuración de CI/CD en el repositorio
   - Debería documentarse el proceso de despliegue

### 📋 **Recomendaciones**

1. **Usar `npm ci` en producción:**

   ```bash
   # En lugar de npm install
   npm ci
   ```

2. **Implementar verificación de integridad:**
   - Usar `npm audit` en CI/CD
   - Verificar checksums de dependencias críticas

3. **Documentar proceso de despliegue:**
   - Incluir pasos de verificación de integridad
   - Documentar proceso de rollback

---

## 9. Security Logging and Monitoring Failures (A09:2021)

### ⚠️ **Vulnerabilidades Identificadas**

1. **CRÍTICO - Logging insuficiente:**

   ```typescript
   // Solo se encontraron console.error en algunos lugares
   // src/app/api/account/delete/route.ts
   console.error("B2 deleteAllFilesForUser error:", b2Err);
   console.error("auth.admin.deleteUser error:", deleteUserError);
   ```

   **Riesgo:** Sin logging estructurado, es difícil detectar y responder a incidentes de seguridad.
   **Recomendación:** Implementar logging estructurado con servicio de monitoreo.

2. **MEDIO - Falta monitoreo de eventos de seguridad:**
   - No se monitorean intentos de acceso fallidos
   - No se registran cambios críticos (eliminación de cuenta, cambios de permisos)
   - No hay alertas configuradas

3. **BAJO - Información sensible en logs:**
   - Aunque no se encontraron casos obvios, debería verificarse que no se loguean PII

### 📋 **Recomendaciones**

1. **Implementar logging estructurado:**

   ```typescript
   // Usar una librería como Winston o Pino
   import { logger } from "@/lib/logger";

   logger.info("Account deletion initiated", {
     userId: user.id,
     timestamp: new Date().toISOString(),
   });

   logger.error("Account deletion failed", {
     userId: user.id,
     error: err.message,
     stack: err.stack,
   });
   ```

2. **Integrar servicio de monitoreo:**
   - Configurar Sentry o similar para errores
   - Monitorear eventos de autenticación en Supabase Dashboard
   - Configurar alertas para eventos críticos

3. **Auditar eventos de seguridad:**
   ```typescript
   // Crear tabla de auditoría
   create table security_audit_log (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references profiles(id),
     event_type text not null,
     details jsonb,
     ip_address text,
     user_agent text,
     created_at timestamptz default now()
   );
   ```

---

## 10. Server-Side Request Forgery (SSRF) (A10:2021)

### ✅ **Fortalezas**

1. **No se encontraron endpoints que acepten URLs de usuarios:**
   - Los endpoints de upload solo aceptan archivos locales
   - No hay endpoints que hagan fetch a URLs proporcionadas por usuarios

### ⚠️ **Vulnerabilidades Identificadas**

1. **BAJO - Configuración de imágenes permite cualquier hostname:**
   ```typescript
   // next.config.ts
   hostname: "**"; // Podría permitir SSRF si se usa en contexto incorrecto
   ```
   **Mitigación:** Next.js Image Optimization hace requests internos, no desde el cliente.

### 📋 **Recomendaciones**

1. **Si en el futuro se aceptan URLs de usuarios:**
   - Validar que las URLs sean de dominios permitidos
   - Usar whitelist de dominios
   - Validar formato de URL antes de hacer requests
   - Limitar protocolos (solo HTTPS)

---

## Resumen de Vulnerabilidades por Severidad

### 🔴 **CRÍTICAS (3)**

1. Falta validación de ownership en DELETE endpoints de archivos
2. Falta headers de seguridad HTTP
3. Logging insuficiente para detección de incidentes

### 🟠 **MEDIAS (4)**

1. Falta rate limiting en endpoints API personalizados
2. Configuración de imágenes muy permisiva
3. Dependencias vulnerables (ver sección 6 para solución detallada)
4. Falta monitoreo de eventos de seguridad

### 🟡 **BAJAS (4)**

1. Uso de `dangerouslySetInnerHTML` sin sanitización
2. Falta verificación de integridad de dependencias
3. CI/CD no documentado
4. Configuración de CORS no explícita

---

## Plan de Acción Recomendado

### Prioridad 1 (Inmediato)

1. ✅ Agregar headers de seguridad HTTP
2. ✅ Implementar validación de ownership en DELETE endpoints
3. ✅ Configurar logging estructurado y monitoreo

### Prioridad 2 (Corto plazo - 1-2 semanas)

1. ✅ Restringir hostnames de imágenes
2. ✅ Actualizar dependencias vulnerables (ver sección 6 para plan detallado)
3. ✅ Implementar logging estructurado

### Prioridad 3 (Mediano plazo - 1 mes)

1. ✅ Implementar rate limiting en endpoints críticos
2. ✅ Agregar tabla de auditoría de seguridad
3. ✅ Documentar proceso de CI/CD y despliegue
4. ✅ Implementar verificación de integridad de dependencias

---

## Conclusión

La aplicación tiene una base sólida de seguridad con RLS correctamente implementado, autenticación robusta y uso de queries parametrizadas. Sin embargo, hay áreas críticas que requieren atención inmediata, especialmente en logging, headers de seguridad y validación de ownership en operaciones de eliminación.

**Puntuación General:** 7/10

**Recomendación:** Implementar las correcciones de Prioridad 1 antes de producción, y las de Prioridad 2 dentro del primer mes de producción.
