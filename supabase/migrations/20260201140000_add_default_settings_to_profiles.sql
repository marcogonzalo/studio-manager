-- Add default settings to profiles (for new projects and products)
alter table profiles
  add column if not exists default_tax_rate numeric,
  add column if not exists default_currency text default 'EUR';

comment on column profiles.default_tax_rate is 'Impuesto por defecto sugerido al crear nuevo proyecto';
comment on column profiles.default_currency is 'Moneda por defecto para nuevos proyectos y productos';
