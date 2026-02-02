-- Add profile fields for "Mi cuenta" / "Mi perfil"
-- company, public_name (for budgets) - full_name already exists from initial schema

alter table profiles
  add column if not exists company text,
  add column if not exists public_name text;

comment on column profiles.public_name is 'Nombre a mostrar en presupuestos (ej. estudio, arquitecto)';
