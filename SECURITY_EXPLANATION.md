# Explicación Detallada: Vulnerabilidades Críticas 2 y 3

## 2. Falta Headers de Seguridad HTTP

### ¿Qué son los Security Headers?

Los Security Headers son instrucciones que el servidor envía al navegador en cada respuesta HTTP para indicarle cómo debe comportarse con respecto a la seguridad. Son como "reglas de seguridad" que el navegador debe seguir.

### Estado Actual

En tu aplicación, **NO hay headers de seguridad configurados**. Esto significa que el navegador no tiene instrucciones específicas sobre cómo proteger tu aplicación.

**Archivo actual (`next.config.ts`):**

```typescript
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // ❌ No hay configuración de headers de seguridad
};
```

### ¿Por qué es crítico?

Sin estos headers, tu aplicación es vulnerable a varios ataques:

#### 1. **Clickjacking (Ataque de Capa Invisible)**

**Sin `X-Frame-Options`:**

- Un atacante puede incrustar tu aplicación en un iframe invisible
- Puede engañar a usuarios para que hagan clic en elementos que no ven
- Ejemplo: Un botón "Eliminar cuenta" invisible sobre un botón "Me gusta" visible

**Ejemplo de ataque:**

```html
<!-- Sitio malicioso -->
<iframe
  src="https://tu-app.com/dashboard"
  style="opacity: 0; position: absolute;"
>
  <!-- Tu app está aquí pero invisible -->
</iframe>
<button style="position: absolute; z-index: 999;">
  ¡Haz clic aquí para ganar un premio!
  <!-- El usuario hace clic pero realmente está haciendo clic en tu app -->
</button>
```

#### 2. **MIME Type Sniffing (Ataque de Tipo de Contenido)**

**Sin `X-Content-Type-Options: nosniff`:**

- El navegador puede "adivinar" el tipo de contenido de un archivo
- Un archivo JavaScript malicioso podría ejecutarse como si fuera una imagen
- Ejemplo: Un atacante sube `malicious.js` pero el servidor lo sirve como `image.jpg`

**Ejemplo de ataque:**

```javascript
// Archivo: malicious.js
fetch("/api/account/delete", {
  method: "POST",
  body: JSON.stringify({ email: "victim@email.com" }),
});

// Si el servidor lo sirve como imagen pero el navegador lo interpreta como JS:
// <img src="/uploads/malicious.js"> podría ejecutar código JavaScript
```

#### 3. **XSS (Cross-Site Scripting)**

**Sin `Content-Security-Policy`:**

- No hay restricciones sobre qué scripts pueden ejecutarse
- Cualquier script malicioso inyectado puede ejecutarse sin restricciones
- Ejemplo: Un comentario con `<script>alert('XSS')</script>` podría ejecutarse

#### 4. **Información de Referrer Expuesta**

**Sin `Referrer-Policy`:**

- El navegador envía información sobre de dónde viene el usuario
- Puede exponer tokens o información sensible en URLs
- Ejemplo: `https://tu-app.com/auth/callback?token=SECRET&referrer=https://sitio-malicioso.com`

### Solución: Agregar Headers de Seguridad

**Configuración recomendada en `next.config.ts`:**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ AGREGAR: Headers de seguridad
  async headers() {
    return [
      {
        // Aplicar a todas las rutas
        source: "/:path*",
        headers: [
          {
            // Previene clickjacking - no permite que la página se cargue en iframes
            key: "X-Frame-Options",
            value: "DENY", // o 'SAMEORIGIN' si necesitas iframes de tu mismo dominio
          },
          {
            // Previene MIME type sniffing - el navegador debe respetar el Content-Type
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Controla qué información de referrer se envía
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
            // Solo envía el origen (no la URL completa) cuando es cross-origin
          },
          {
            // Política de seguridad de contenido - controla qué recursos pueden cargarse
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'", // Por defecto, solo recursos del mismo origen
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Scripts: mismo origen + inline (necesario para Next.js)
              "style-src 'self' 'unsafe-inline'", // Estilos: mismo origen + inline (necesario para Tailwind)
              "img-src 'self' data: https:", // Imágenes: mismo origen + data URIs + HTTPS
              "font-src 'self' data:", // Fuentes: mismo origen + data URIs
              "connect-src 'self' https://*.supabase.co", // Conexiones: mismo origen + Supabase
              "frame-ancestors 'none'", // No permite iframes (complementa X-Frame-Options)
            ].join("; "),
          },
          {
            // Previene que el navegador detecte automáticamente el tipo de contenido
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            // Controla qué características del navegador pueden usarse
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()", // Deshabilita características no necesarias
          },
        ],
      },
    ];
  },

  // ... resto de configuración
};

export default nextConfig;
```

### Verificación

Después de agregar los headers, puedes verificarlos:

```bash
# Usando curl
curl -I https://tu-dominio.com

# O usando herramientas online:
# - https://securityheaders.com
# - https://observatory.mozilla.org
```

### Impacto

**Antes (sin headers):**

- ❌ Vulnerable a clickjacking
- ❌ Vulnerable a MIME type sniffing
- ❌ Sin protección contra XSS
- ❌ Información de referrer expuesta

**Después (con headers):**

- ✅ Protegido contra clickjacking
- ✅ Protegido contra MIME type sniffing
- ✅ Protección mejorada contra XSS
- ✅ Control sobre información de referrer

---

## 3. Logging Insuficiente

### ¿Qué es el Logging de Seguridad?

El logging de seguridad es el proceso de registrar eventos importantes relacionados con la seguridad de tu aplicación para poder detectar, investigar y responder a incidentes.

### Estado Actual

En tu aplicación, el logging es **muy básico**:

**Ejemplo actual (`src/app/api/account/delete/route.ts`):**

```typescript
try {
  await deleteAllFilesForUser(userId);
} catch (b2Err) {
  // ❌ Solo console.error - no estructurado, no persistente
  console.error("B2 deleteAllFilesForUser error:", b2Err);
}

console.error("auth.admin.deleteUser error:", deleteUserError);
console.error("Account delete error:", err);
```

**Función de utilidad (`src/lib/utils.ts`):**

```typescript
export function reportError(error: unknown, context?: string): void {
  if (context) {
    console.error(context, error); // ❌ Solo console.error
  } else {
    console.error(error);
  }
}
```

### ¿Por qué es crítico?

Sin logging adecuado, es **imposible**:

1. **Detectar ataques en tiempo real**
   - No sabes si alguien está intentando acceder a cuentas de otros usuarios
   - No puedes detectar patrones de comportamiento sospechoso
   - No tienes alertas cuando ocurre algo crítico

2. **Investigar incidentes después del hecho**
   - Si un usuario reporta que su cuenta fue eliminada, no tienes logs para investigar
   - No puedes determinar qué pasó, cuándo pasó, o quién lo hizo
   - No puedes proporcionar evidencia en caso de problemas legales

3. **Cumplir con regulaciones**
   - GDPR requiere que puedas demostrar qué datos se accedieron y cuándo
   - Sin logs, no puedes cumplir con auditorías de seguridad

### Ejemplos de Problemas Reales

#### Escenario 1: Cuenta Eliminada Sospechosamente

**Situación:** Un usuario reporta que su cuenta fue eliminada sin su consentimiento.

**Sin logging adecuado:**

```
❌ No hay registro de quién eliminó la cuenta
❌ No hay registro de cuándo ocurrió
❌ No hay registro de desde qué IP
❌ No hay registro de qué datos se eliminaron
❌ No puedes investigar ni prevenir futuros incidentes
```

**Con logging adecuado:**

```json
{
  "event": "account_deletion",
  "userId": "user-123",
  "deletedBy": "user-123", // o "admin-456" si fue un admin
  "timestamp": "2026-02-20T10:30:00Z",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "emailConfirmed": true,
  "dataDeleted": {
    "projects": 5,
    "clients": 12,
    "files": 23
  },
  "status": "success"
}
```

#### Escenario 2: Intento de Acceso No Autorizado

**Situación:** Alguien intenta acceder a datos de otro usuario.

**Sin logging:**

```
❌ No sabes que ocurrió
❌ No puedes bloquear al atacante
❌ No puedes alertar al usuario afectado
```

**Con logging:**

```json
{
  "event": "unauthorized_access_attempt",
  "userId": "user-123",
  "attemptedResource": "project-456",
  "resourceOwner": "user-789",
  "timestamp": "2026-02-20T10:30:00Z",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "action": "SELECT",
  "blocked": true,
  "reason": "RLS policy violation"
}
```

#### Escenario 3: Múltiples Intentos Fallidos de Login

**Situación:** Alguien está intentando hacer fuerza bruta en cuentas.

**Sin logging:**

```
❌ No detectas el patrón de ataques
❌ No puedes bloquear IPs sospechosas
❌ No puedes alertar a usuarios afectados
```

**Con logging:**

```json
{
  "event": "failed_login_attempt",
  "email": "user@example.com",
  "timestamp": "2026-02-20T10:30:00Z",
  "ipAddress": "192.168.1.100",
  "attemptCount": 5,
  "blocked": true,
  "reason": "Too many failed attempts"
}
```

### Solución: Implementar Logging Estructurado

#### Paso 1: Crear Sistema de Logging

**Crear `src/lib/logger.ts`:**

```typescript
/**
 * Sistema de logging estructurado para seguridad y monitoreo
 */

type LogLevel = "info" | "warn" | "error" | "security";

interface LogContext {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: unknown;
}

interface SecurityEvent {
  event: string;
  level: LogLevel;
  timestamp: string;
  context: LogContext;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const logEntry: SecurityEvent = {
      event: message,
      level,
      timestamp: new Date().toISOString(),
      context: context || {},
    };

    // En desarrollo: console
    if (process.env.NODE_ENV === "development") {
      const method =
        level === "error" ? "error" : level === "warn" ? "warn" : "log";
      console[method](`[${level.toUpperCase()}]`, logEntry);
    }

    // En producción: enviar a servicio de logging
    if (process.env.NODE_ENV === "production") {
      this.sendToLoggingService(logEntry);
    }
  }

  private async sendToLoggingService(entry: SecurityEvent) {
    // Opción 1: Enviar a Supabase (crear tabla de logs)
    // Opción 2: Enviar a servicio externo (Sentry, LogRocket, etc.)
    // Opción 3: Enviar a sistema de logging (ELK, CloudWatch, etc.)

    try {
      // Ejemplo: Guardar en Supabase
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // Implementar guardado en tabla de logs
      }
    } catch (error) {
      // Fallback a console si falla el servicio
      console.error("Failed to send log:", error);
      console.error("Original log:", entry);
    }
  }

  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  error(message: string, error: unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : String(error),
    };
    this.log("error", "Error occurred", errorContext);
  }

  security(event: string, context?: LogContext) {
    this.log("security", event, context);
  }
}

export const logger = new Logger();
```

#### Paso 2: Crear Tabla de Auditoría en Supabase

**Crear migración `supabase/migrations/YYYYMMDD_create_security_audit_log.sql`:**

```sql
-- Tabla de auditoría de seguridad
create table security_audit_log (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  level text not null check (level in ('info', 'warn', 'error', 'security')),
  user_id uuid references profiles(id),
  ip_address text,
  user_agent text,
  details jsonb not null,
  created_at timestamptz default now() not null
);

-- Índices para búsquedas rápidas
create index security_audit_log_user_id_idx on security_audit_log (user_id);
create index security_audit_log_event_type_idx on security_audit_log (event_type);
create index security_audit_log_created_at_idx on security_audit_log (created_at desc);
create index security_audit_log_level_idx on security_audit_log (level);

-- RLS: Solo usuarios pueden ver sus propios logs de seguridad
alter table security_audit_log enable row level security;

create policy "Users can view own security logs"
  on security_audit_log for select
  using (auth.uid() = user_id);

-- Los logs de seguridad se insertan desde el servidor (bypass RLS)
-- No permitir inserción desde el cliente
```

#### Paso 3: Usar Logger en Endpoints Críticos

**Actualizar `src/app/api/account/delete/route.ts`:**

```typescript
import { logger } from "@/lib/logger";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for") ||
    headersList.get("x-real-ip") ||
    "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  try {
    // ... código de autenticación ...

    // ✅ LOG: Inicio de eliminación de cuenta
    logger.security("account_deletion_initiated", {
      userId: user.id,
      email: user.email,
      ipAddress,
      userAgent,
    });

    // ... código de eliminación ...

    // ✅ LOG: Eliminación exitosa
    logger.security("account_deletion_completed", {
      userId: user.id,
      email: user.email,
      ipAddress,
      userAgent,
      dataDeleted: {
        projects: ids.length,
        // ... otros datos
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // ✅ LOG: Error en eliminación
    logger.error("account_deletion_failed", err, {
      userId: user?.id,
      email: user?.email,
      ipAddress,
      userAgent,
    });

    // ... manejo de error ...
  }
}
```

#### Paso 4: Logging en Middleware

**Actualizar `src/lib/supabase/middleware.ts`:**

```typescript
import { logger } from "@/lib/logger";

export async function updateSession(request: NextRequest) {
  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // ... código existente ...

  // ✅ LOG: Intento de acceso no autorizado
  if (!user && !isPublicPath(pathname)) {
    logger.security("unauthorized_access_attempt", {
      path: pathname,
      ipAddress,
      userAgent,
      method: request.method,
    });
  }

  // ✅ LOG: Acceso exitoso a ruta protegida
  if (user && !isPublicPath(pathname)) {
    logger.info("authenticated_access", {
      userId: user.id,
      path: pathname,
      ipAddress,
      userAgent,
    });
  }

  // ... resto del código ...
}
```

### Eventos Críticos a Registrar

1. **Autenticación:**
   - Login exitoso
   - Login fallido
   - Logout
   - Cambio de contraseña
   - Reset de contraseña

2. **Autorización:**
   - Intento de acceso no autorizado
   - Violación de RLS
   - Acceso a recurso protegido

3. **Operaciones Críticas:**
   - Eliminación de cuenta
   - Eliminación de datos masivos
   - Cambios en configuración crítica
   - Exportación de datos

4. **Errores:**
   - Errores de servidor
   - Errores de base de datos
   - Errores de autenticación

### Integración con Servicios Externos

**Opción 1: Sentry (Recomendado para errores)**

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

logger.error("error", err, context);
// También enviar a Sentry
Sentry.captureException(err, { extra: context });
```

**Opción 2: LogRocket (Recomendado para sesiones)**

```typescript
import LogRocket from "logrocket";

LogRocket.init(process.env.LOGROCKET_APP_ID);
```

### Impacto

**Antes (sin logging adecuado):**

- ❌ No puedes detectar ataques
- ❌ No puedes investigar incidentes
- ❌ No puedes cumplir con regulaciones
- ❌ No tienes visibilidad de qué está pasando

**Después (con logging adecuado):**

- ✅ Detectas ataques en tiempo real
- ✅ Puedes investigar incidentes completamente
- ✅ Cumples con regulaciones (GDPR, etc.)
- ✅ Tienes visibilidad completa de la aplicación
- ✅ Puedes configurar alertas automáticas

---

## Resumen

### 2. Headers de Seguridad

- **Problema:** Sin protección contra clickjacking, MIME sniffing, XSS
- **Solución:** Agregar headers en `next.config.ts`
- **Tiempo de implementación:** 15-30 minutos
- **Impacto:** Protección inmediata contra múltiples vectores de ataque

### 3. Logging Insuficiente

- **Problema:** No puedes detectar ni investigar incidentes de seguridad
- **Solución:** Implementar logging estructurado + tabla de auditoría
- **Tiempo de implementación:** 2-4 horas
- **Impacto:** Visibilidad completa y capacidad de respuesta a incidentes

Ambas son críticas porque:

1. **Headers:** Previenen ataques comunes
2. **Logging:** Te permite detectar y responder a ataques que ocurran
