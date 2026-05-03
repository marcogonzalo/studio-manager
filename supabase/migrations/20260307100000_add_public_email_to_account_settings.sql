-- Correo público independiente del de login: para presupuestos y personalización.
-- Si no se define, se puede seguir usando profiles.email como fallback en la app.

alter table account_settings
  add column if not exists public_email text;

comment on column account_settings.public_email is 'Correo público para presupuestos (independiente del email de login). Si null, la app puede usar profiles.email como fallback.';
