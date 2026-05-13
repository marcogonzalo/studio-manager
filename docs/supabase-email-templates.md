# Plantillas de email de Supabase Auth (Veta)

Plantillas de correo personalizadas para Supabase Auth, adaptadas a la marca Veta (inglés y español según preferencia del usuario, paleta sage/cream, tipografía Montserrat).

## Idioma (ES / EN)

El cuerpo del HTML usa [plantillas Go](https://supabase.com/docs/guides/auth/auth-email-templates) y la variable **`{{ .Data }}`**, que refleja `auth.users.user_metadata`.

- Si **`user_metadata.lang`** es **`"en"`**, se muestra la variante en inglés.
- En cualquier otro caso (incluido ausente o **`"es"`**), se usa español.

La app guarda `lang` en metadata al enviar el magic link (`/api/auth/magic-link`, formularios sign-in / sign-up), al cambiar el correo en ajustes (junto con `updateUser`), y al guardar el idioma en **Ajustes → Personalización** (sincroniza `auth.updateUser({ data: { lang } })`).

**Asunto del correo:** una sola cadena por tipo de plantilla. En `config.toml` y en **producción** los asuntos están **solo en inglés** (marca Veta al final). El **cuerpo** del HTML sigue bifurcando ES/EN según `user_metadata.lang`.

## Ubicación

- **Local / self-hosted:** `supabase/templates/`
- **Config:** `supabase/config.toml` (secciones `[auth.email.template.*]` y `[auth.email.notification.*]`).

Los HTML mezclan atributos con sintaxis Go (`{{ ... }}`); **Prettier los ignora** (ver `.prettierignore`) para no romper el formateo del repo.

## Flujo de registro con confirmación de email

Desde `config.toml`: `enable_confirmations = true`.

Supabase distingue automáticamente entre usuario nuevo y usuario existente al llamar a `signInWithOtp`:

| Situación                     | Plantilla enviada                        |
| ----------------------------- | ---------------------------------------- |
| **Nuevo usuario** (signup)    | `confirmation.html` — tono de bienvenida |
| **Usuario existente** (login) | `magic_link.html` — acceso neutro        |

El perfil (`public.profiles`) y `account_settings` **no se crean hasta que el usuario confirma el email**:

- Trigger `on_auth_user_created` (AFTER INSERT): solo crea perfil si `email_confirmed_at IS NOT NULL` (OAuth, admin API con `email_confirm: true`).
- Trigger `on_auth_user_confirmed` (AFTER UPDATE OF `email_confirmed_at`): crea perfil cuando `email_confirmed_at` pasa de `NULL` a `NOT NULL` (confirmación de signup email).

Ambas funciones son idempotentes (comprueban existencia antes de insertar).

## Plantillas incluidas

| Plantilla                         | Archivo                              | Cuándo se envía                                       |
| --------------------------------- | ------------------------------------ | ----------------------------------------------------- |
| Confirmación de registro          | `confirmation.html`                  | Signup nuevo: bienvenida + enlace para activar cuenta |
| Invitación                        | `invite.html`                        | Invitación a unirse a la app                          |
| Recuperación de contraseña        | `recovery.html`                      | Solicitud de restablecer contraseña                   |
| Magic link                        | `magic_link.html`                    | Login de usuario ya registrado (sin contraseña)       |
| Cambio de email                   | `email_change.html`                  | Usuario solicita cambiar su correo                    |
| Reautenticación                   | `reauthentication.html`              | Código OTP para acciones sensibles                    |
| Notificación: contraseña cambiada | `password_changed_notification.html` | Aviso tras cambiar la contraseña                      |
| Notificación: email cambiado      | `email_changed_notification.html`    | Aviso tras cambiar el correo                          |

## Desarrollo local

1. Las rutas están ya configuradas en `config.toml`.
2. Tras cambiar plantillas o config, reinicia Supabase:

   ```bash
   supabase stop && supabase start
   ```

3. Los correos locales se pueden ver en Inbucket: `http://127.0.0.1:54324` (puerto por defecto).

## Producción (Supabase Hosted)

### Plantillas y asuntos ya aplicados (proyecto enlazado)

En el proyecto **studio-manager** se ejecutó `supabase config push` para desplegar el HTML de `supabase/templates/*.html` y los **asuntos en inglés** del `config.toml`. La configuración sensible de Auth en producción (Site URL `https://veta.pro`, redirect URLs de Vercel, contraseñas 12+ con complejidad, MFA TOTP activo, confirmación de email, etc.) se **restauró** en un segundo push; el `config.toml` del repo sigue pensado para **desarrollo local** (localhost, reglas laxas).

### Peligro: `supabase config push`

El comando sube **toda** la sección `[auth]` del `config.toml`, no solo las plantillas. Si ese archivo tiene `site_url` y políticas de **local**, **sobrescribirás producción** (URLs, MFA, OTP, contraseñas). Antes de un push a hosted hay que **igualar** `[auth]` a los valores de producción (o usar solo el Dashboard / [Management API](https://supabase.com/docs/guides/auth/auth-email-templates#manage-email-templates) con campos `mailer_*`).

### Opción manual (Dashboard)

Si no usas `config push`:

1. Dashboard del proyecto → **Authentication** → **Email Templates**.
2. Para cada tipo (Confirm signup, Invite, Reset password, Magic link, Change email, Reauthentication):
   - **Subject:** mismo valor que en `config.toml` (tabla abajo).
   - **Body:** pegar el HTML del archivo en `supabase/templates/`.
3. Notificaciones: **Password changed** / **Email changed** → subject y body de los HTML correspondientes.

### Subjects de referencia (inglés, alineados con `config.toml`)

- Confirm signup: `Confirm your account — Veta`
- Invite: `Invitation to Veta`
- Reset password: `Reset your password — Veta`
- Magic link: `Your sign-in link — Veta`
- Change email: `Confirm email change — Veta`
- Reauthentication: `Confirm your identity — Veta`
- Password changed (notification): `Password updated — Veta`
- Email changed (notification): `Email updated — Veta`

## Variables de plantilla (Go templates)

Supabase inyecta estas variables en el HTML:

- `{{ .ConfirmationURL }}` — URL completa de confirmación/acción.
- `{{ .Token }}` — OTP de 6 dígitos (reauthentication).
- `{{ .TokenHash }}` — Hash del token (para construir enlaces propios).
- `{{ .SiteURL }}` — URL base de la app (Site URL del proyecto).
- `{{ .Email }}` — Correo del usuario.
- `{{ .NewEmail }}` — Nuevo correo (solo plantilla change email).
- `{{ .OldEmail }}` — Correo anterior (solo notificación email changed).
- `{{ .RedirectTo }}` — URL de redirección tras confirmar.
- `{{ .Data }}` — Metadatos del usuario; usar **`{{ .Data.lang }}`** con `eq` para bifurcar EN/ES en el HTML (ver archivos en `supabase/templates/`).

No modificar los nombres de estas variables salvo al añadir condicionales alrededor del contenido; el diseño puede adaptarse manteniendo las variables de sustitución.

## Diseño

- Marca: **Veta**, color principal `#759b6d` (verde).
- Fondo: `#f5f3ef` (cream); tarjeta blanca, bordes redondeados.
- Tipografía: Montserrat (en cliente de correo puede fallback a system fonts).
- Pie: según idioma, texto equivalente en ES o EN + enlace a `{{ .SiteURL }}`.
- **Botón CTA:** además de la clase `.button` en `<style>`, el `<a>` del botón debe incluir **`style="color: #ffffff !important"`** en línea. Clientes como Gmail suelen forzar el azul de enlace si el color solo está en la hoja de estilos embebida; el mismo patrón está en `src/lib/email/templates/demo-access.ts`.

## Error 500 "Error sending confirmation email" en producción

Si en producción al pedir el magic link (o cualquier email de Auth) recibes **500** con mensaje **"Error sending confirmation email"**, el fallo está en el **envío de correo** por parte de Supabase, no en tu código.

### Qué hacer

1. **Configurar Custom SMTP** en el proyecto de Supabase:
   - Dashboard del proyecto → **Authentication** → **SMTP Settings** (o **Project Settings** → **Auth** → **SMTP**).
   - Activar "Custom SMTP" y rellenar:
     - **Host / Port**: p. ej. `smtp.resend.com` puerto `465` (o el que indique tu proveedor).
     - **User**: normalmente tu API key o usuario del proveedor.
     - **Password**: API key o contraseña de aplicación (en Gmail, contraseña de aplicación, no la contraseña normal).
     - **Sender email**: debe ser un correo **verificado** en tu proveedor (Resend, SendGrid, Mailgun, SES, etc.).
     - **Sender name**: p. ej. "Veta".

2. **Comprobar límites del proveedor**:
   - AWS SES en sandbox solo envía a direcciones verificadas.
   - Resend/SendGrid requieren dominio o remitente verificados.

3. **URLs de producción**:
   - **Site URL**: debe ser la URL pública de tu app (p. ej. `https://tu-dominio.com`).
   - **Redirect URLs**: incluir `https://tu-dominio.com/auth/callback` y variantes con `?*` si las usas.

4. **Errores frecuentes**:
   - Intercambiar "SMTP admin email" y "SMTP user".
   - Espacios en blanco en la URL o en la API key.
   - Usar puerto 25 (suele dar timeout); preferir 587 o 465 según documentación del proveedor.

Referencia: [Configure a Custom SMTP (Supabase)](https://supabase.com/docs/guides/auth/auth-smtp).

## Referencias

- [Email Templates (Supabase Docs)](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Customizing email templates - Local development](https://supabase.com/docs/guides/local-development/customizing-email-templates)
