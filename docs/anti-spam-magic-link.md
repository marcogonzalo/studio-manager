# Anti-spam para magic link (configuración)

Esta guía explica cómo configurar el paquete anti-spam usado en los endpoints de auth (`/api/auth/magic-link` y `/api/auth/demo-request`), incluyendo Turnstile y el bypass temporal de reenvío.

## Objetivo

- Reducir abuso de correos sospechosos en flujos de magic link.
- Hacer step-up con captcha (Turnstile) solo cuando aplica.
- Permitir reenvío inmediato sin repetir captcha usando una cookie HttpOnly firmada y de corta duración.

## Componentes

- Lógica reusable: `src/lib/anti-spam/`
  - `evaluateEmailRisk` (heurística del email)
  - `verifyTurnstileToken` (validación servidor Turnstile)
  - `resolveMagicLinkAntiSpam` (decisión de flujo)
- Config host (env wiring): `src/lib/auth/magic-link-anti-spam-config.ts`
- Cookie bypass (firma HMAC): `src/lib/auth/magic-link-captcha-bypass.ts`
- UI captcha: `CaptchaGuard` desde `@/lib/anti-spam/react`

## Variables de entorno

Define estas variables en cada entorno (dev/staging/prod):

```bash
SIGNUP_SPAM_STEPUP_ENABLED=true
TURNSTILE_SECRET_KEY=...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
ANTI_SPAM_RISK_THRESHOLD=45
ANTI_SPAM_ACTION=silent_block
MAGIC_LINK_CAPTCHA_BYPASS_SECRET=...
```

### Descripción

- `SIGNUP_SPAM_STEPUP_ENABLED`
  - Activa/desactiva el sistema anti-spam.
  - `false`: no hay step-up/captcha.

- `TURNSTILE_SECRET_KEY`
  - Secret server-side para verificar tokens de Turnstile contra Cloudflare.

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - Site key para renderizar el widget en cliente.

- `ANTI_SPAM_RISK_THRESHOLD`
  - Rango válido: `0..100`.
  - Default: `45`.
  - Más bajo = más estricto.
  - `0` significa tratar todo como sospechoso.

- `ANTI_SPAM_ACTION`
  - Valores: `silent_block | hard_block | flag_for_review`.
  - `silent_block`: comportamiento recomendado por defecto.

- `MAGIC_LINK_CAPTCHA_BYPASS_SECRET` (opcional, recomendado)
  - Clave HMAC para firmar la cookie de bypass (`veta_ml_cap`).
  - Si no se define, usa fallback a `TURNSTILE_SECRET_KEY`.
  - Recomendado definirla para poder rotarla de forma independiente.

## Flujo de decisión (resumen)

1. Se calcula riesgo del email.
2. Si no supera threshold: `proceed`.
3. Si supera threshold:
   - Con Turnstile configurado:
     - sin token válido: `captcha_required`
     - con token válido: `proceed` (o `reject` según acción)
   - Sin Turnstile:
     - según acción (`fake_success`, `reject`, o `flag_for_review`).

## Bypass de reenvío (cookie firmada)

- Nombre cookie: `veta_ml_cap`
- Tipo: HttpOnly, `SameSite=Lax`, `path=/`
- Duración: ~15 minutos
- Finalidad:
  - Evitar que el usuario tenga que repetir captcha en reenvíos inmediatos.
  - Importante porque los tokens Turnstile son de un solo uso.

## Recomendaciones de seguridad

- Usa secretos distintos para:
  - `TURNSTILE_SECRET_KEY` (verificación captcha)
  - `MAGIC_LINK_CAPTCHA_BYPASS_SECRET` (firma cookie bypass)
- Rota `MAGIC_LINK_CAPTCHA_BYPASS_SECRET` cuando sea necesario (revoca bypasses activos).
- No expongas `TURNSTILE_SECRET_KEY` ni `MAGIC_LINK_CAPTCHA_BYPASS_SECRET` al cliente.

## Checklist de configuración

- [ ] Variables definidas en el entorno correcto.
- [ ] Turnstile site key válida para el dominio actual.
- [ ] `SIGNUP_SPAM_STEPUP_ENABLED=true` en entornos donde quieras protección activa.
- [ ] CSP permite `https://challenges.cloudflare.com`.
- [ ] Probado caso sospechoso: solicita captcha, envía correo tras validar captcha.
- [ ] Probado reenvío: funciona sin exigir captcha de nuevo dentro de la ventana de bypass.

## Runbook operativo (local / staging / producción)

### 1) Preparar secretos

Genera secretos fuertes (32+ bytes) para:

- `TURNSTILE_SECRET_KEY`
- `MAGIC_LINK_CAPTCHA_BYPASS_SECRET` (recomendado separado)

Ejemplo para generar uno:

```bash
openssl rand -base64 48
```

### 2) Configuración por entorno

#### Local (desarrollo)

1. Añade variables en `.env.local`.
2. Usa claves Turnstile válidas para el dominio local que uses (`localhost`).
3. Activa el sistema:
   - `SIGNUP_SPAM_STEPUP_ENABLED=true`

#### Staging

1. Configura variables en el proveedor de hosting (sin commitear secretos).
2. Crea/usa una site key de Turnstile permitida para el dominio de staging.
3. Mantén `MAGIC_LINK_CAPTCHA_BYPASS_SECRET` independiente para rotación segura.

#### Producción

1. Configura variables en entorno productivo.
2. Verifica que Turnstile permite el dominio real de producción.
3. Usa secreto dedicado para bypass (`MAGIC_LINK_CAPTCHA_BYPASS_SECRET`).
4. Revisa que CSP permita `https://challenges.cloudflare.com`.

### 3) Smoke tests post-deploy

Ejecuta estas pruebas después de desplegar:

1. **Email bajo riesgo**
   - No debe mostrar captcha.
   - Debe enviar magic link normal.

2. **Email sospechoso**
   - Debe responder `captcha_required`.
   - Tras resolver captcha, debe enviar magic link.

3. **Reenvío inmediato**
   - Debe funcionar sin pedir captcha de nuevo durante la ventana de bypass (~15 min).

4. **Sin secretos o mala config**
   - Verifica errores esperados (`captcha_misconfigured`) y observabilidad en logs.

### 4) Rotación de secretos

#### Rotar solo bypass (recomendado)

1. Genera nuevo `MAGIC_LINK_CAPTCHA_BYPASS_SECRET`.
2. Actualiza variable y despliega.
3. Resultado esperado: bypasses anteriores quedan inválidos; usuarios pueden volver a resolver captcha.

#### Rotar Turnstile

1. Cambia `TURNSTILE_SECRET_KEY`.
2. Mantén sincronía con `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y configuración de dominio en Cloudflare.
3. Despliega y repite smoke tests.

### 5) Troubleshooting rápido

- **Siempre `captcha_required`**
  - Revisar `SIGNUP_SPAM_STEPUP_ENABLED`, threshold, y presencia/envío de `captchaToken`.

- **`captcha_misconfigured`**
  - Revisar `TURNSTILE_SECRET_KEY` y conectividad al endpoint de verificación.

- **Widget no carga**
  - Revisar `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, dominio permitido, bloqueadores, y CSP.

- **Reenvío vuelve a pedir captcha siempre**
  - Verificar cookie `veta_ml_cap` (HttpOnly) y secreto de firma.
