-- Add storage_limit_mb and support_level to plans table
-- Update seed data for BASE, PRO, STUDIO according to new specifications

-- Add new columns
alter table plans
  add column storage_limit_mb integer not null default 0,
  add column support_level plan_feature_modality not null default 'none';

comment on column plans.storage_limit_mb is 'Storage limit in MB: 0 = no storage, -1 = unlimited, N = limit in MB';
comment on column plans.support_level is 'Support level: none, basic (email), full (priority)';

-- Update existing plans with new values according to specifications:
-- BASE: 1 active project, 10 clients, 50 suppliers, 50 products, 500 MB storage
--       pdf_export_mode: none, support: none, costs_management: basic, multi_currency: basic
-- PRO: 5 active projects, unlimited clients/suppliers/products, 10 GB storage
--      pdf_export_mode: basic (Veta branding), support: basic, costs_management: full, multi_currency: full
-- STUDIO: 50 active projects, unlimited, 100 GB storage
--         pdf_export_mode: full (white label), support: full, costs_management: full, multi_currency: full

update plans set
  projects_limit = 1,
  clients_limit = 10,
  suppliers_limit = 50,
  catalog_products_limit = 50,
  storage_limit_mb = 500,
  pdf_export_mode = 'none',
  support_level = 'none',
  costs_management = 'basic',
  multi_currency_per_project = 'basic',
  purchase_orders = 'none',
  payments_management = 'none',
  documents = 'full',
  notes = 'full',
  summary = 'full'
where code = 'BASE';

update plans set
  projects_limit = 5,
  clients_limit = -1,
  suppliers_limit = -1,
  catalog_products_limit = -1,
  storage_limit_mb = 10240,
  pdf_export_mode = 'basic',
  support_level = 'basic',
  costs_management = 'full',
  multi_currency_per_project = 'full',
  purchase_orders = 'full',
  payments_management = 'full',
  documents = 'full',
  notes = 'full',
  summary = 'full'
where code = 'PRO';

update plans set
  projects_limit = 50,
  clients_limit = -1,
  suppliers_limit = -1,
  catalog_products_limit = -1,
  storage_limit_mb = 102400,
  pdf_export_mode = 'full',
  support_level = 'full',
  costs_management = 'full',
  multi_currency_per_project = 'full',
  purchase_orders = 'full',
  payments_management = 'full',
  documents = 'full',
  notes = 'full',
  summary = 'full'
where code = 'STUDIO';

-- Update plan descriptions
update plans set
  description = 'Plan gratuito con límites básicos: 1 proyecto activo, 500 MB almacenamiento'
where code = 'BASE';

update plans set
  description = 'Plan profesional: 5 proyectos activos, 10 GB almacenamiento, funcionalidades completas'
where code = 'PRO';

update plans set
  description = 'Plan ilimitado para estudios: 50 proyectos activos, 100 GB almacenamiento'
where code = 'STUDIO';
