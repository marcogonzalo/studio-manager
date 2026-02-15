# Plantillas de email de Supabase Auth (Veta)

Plantillas de correo personalizadas para Supabase Auth, adaptadas a la marca Veta (español, paleta sage/cream, tipografía Montserrat).

## Ubicación

- **Local / self-hosted:** `supabase/templates/`
- **Config:** `supabase/config.toml` (secciones `[auth.email.template.*]` y `[auth.email.notification.*]`).

## Plantillas incluidas

| Plantilla                         | Archivo                              | Cuándo se envía                            |
| --------------------------------- | ------------------------------------ | ------------------------------------------ |
| Confirmación de registro          | `confirmation.html`                  | Usuario se registra y debe confirmar email |
| Invitación                        | `invite.html`                        | Invitación a unirse a la app               |
| Recuperación de contraseña        | `recovery.html`                      | Solicitud de restablecer contraseña        |
| Magic link                        | `magic_link.html`                    | Login sin contraseña por enlace            |
| Cambio de email                   | `email_change.html`                  | Usuario solicita cambiar su correo         |
| Reautenticación                   | `reauthentication.html`              | Código OTP para acciones sensibles         |
| Notificación: contraseña cambiada | `password_changed_notification.html` | Aviso tras cambiar la contraseña           |
| Notificación: email cambiado      | `email_changed_notification.html`    | Aviso tras cambiar el correo               |

## Desarrollo local

1. Las rutas están ya configuradas en `config.toml`.
2. Tras cambiar plantillas o config, reinicia Supabase:

   ```bash
   supabase stop && supabase start
   ```

3. Los correos locales se pueden ver en Inbucket: `http://127.0.0.1:54324` (puerto por defecto).

## Producción (Supabase Hosted)

En proyectos alojados en Supabase, **la config de `config.toml` no se aplica** a los emails. Hay que copiar contenido y asuntos manualmente:

1. Dashboard del proyecto → **Authentication** → **Email Templates**.
2. Para cada tipo (Confirm signup, Invite, Reset password, Magic link, Change email, Reauthentication):
   - **Subject:** usar el mismo que en `config.toml` (ver tabla abajo).
   - **Body:** copiar el HTML del archivo correspondiente en `supabase/templates/`.
3. En **Auth** → **Settings** (o configuración de notificaciones), activar y personalizar:
   - **Password changed** → subject y body de `password_changed_notification.html`.
   - **Email changed** → subject y body de `email_changed_notification.html`.

### Subjects de referencia (producción)

- Confirm signup: `Confirma tu cuenta en Veta`
- Invite: `Invitación a Veta`
- Reset password: `Restablece tu contraseña — Veta`
- Magic link: `Tu enlace de acceso — Veta`
- Change email: `Confirma el cambio de correo — Veta`
- Reauthentication: `Confirmar identidad — Veta`
- Password changed (notification): `Contraseña modificada — Veta`
- Email changed (notification): `Correo de la cuenta actualizado — Veta`

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

No modificar los nombres de estas variables; solo se puede cambiar el texto y el diseño alrededor.

## Diseño

- Marca: **Veta**, color principal `#759b6d` (verde).
- Fondo: `#f5f3ef` (cream); tarjeta blanca, bordes redondeados.
- Tipografía: Montserrat (en cliente de correo puede fallback a system fonts).
- Pie: “Veta — Gestión de proyectos de diseño interior.” + enlace a `{{ .SiteURL }}`.

## Referencias

- [Email Templates (Supabase Docs)](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Customizing email templates - Local development](https://supabase.com/docs/guides/local-development/customizing-email-templates)
