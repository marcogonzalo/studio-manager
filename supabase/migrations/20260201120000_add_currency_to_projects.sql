-- Add currency to projects (per-project amount display)
alter table projects
  add column if not exists currency text default 'EUR';

comment on column projects.currency is 'Código ISO de moneda (EUR, USD, etc.) para importes del proyecto';
