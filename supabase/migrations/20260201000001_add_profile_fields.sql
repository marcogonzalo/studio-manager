-- Add profile fields for "Mi cuenta" / "Mi perfil"
-- first_name, last_name, company, public_name (for budgets)

alter table profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists company text,
  add column if not exists public_name text;

comment on column profiles.public_name is 'Nombre a mostrar en presupuestos (ej. estudio, arquitecto)';
