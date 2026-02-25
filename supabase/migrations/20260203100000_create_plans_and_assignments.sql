-- Plans and plan assignments for subscription/plan-based permissions.
-- Convention: consumables 0 = not available, -1 = unlimited, N = max.
-- Features: null = not available, basic = basic level, full = full/personalized.
--
-- Plan rules (registro de cambios):
-- - BASE (Prueba): notas y resumen (full); NO subida de renders ni documentos (documents = null).
--   Límites: 3 proyectos, 10 clientes, 10 proveedores, 50 productos. pdf_export_mode basic (exportación y excluir limitados).
--   Una sola moneda por defecto. Sin órdenes de compra, control de costes ni pagos.
-- - PRO: todas las funcionalidades (documents full = subida de renders y documentos). Cambio de moneda por proyecto.
--   pdf_export_mode full (opciones de exportación y excluir del proyecto). Límites: 10 proyectos, 50 clientes, 50 proveedores, 500 productos.
-- - STUDIO: igual que PRO con límites ilimitados (-1).

create type plan_feature_modality as enum ('basic', 'full');

create table plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  description text,
  -- Consumables (integer: 0 = no, -1 = unlimited, N = max)
  projects_limit integer not null,
  clients_limit integer not null,
  suppliers_limit integer not null,
  catalog_products_limit integer not null,
  -- Feature modalities (null = not available, basic = basic level, full = full/personalized)
  pdf_export_mode plan_feature_modality,
  multi_currency_per_project plan_feature_modality,
  purchase_orders plan_feature_modality,
  costs_management plan_feature_modality,
  payments_management plan_feature_modality,
  documents plan_feature_modality,
  notes plan_feature_modality,
  summary plan_feature_modality,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table plans is 'Plan definitions (BASE, PRO, STUDIO). Wide table: one column per consumable and per feature modality.';
comment on type plan_feature_modality is 'null = not available, basic = basic level, full = full/personalized level.';

create table plan_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  plan_id uuid not null references plans(id),
  assigned_at timestamptz not null default now(),
  duration text not null check (duration in ('1m', '1y', '15d')),
  expires_at date not null,
  next_period_duration text check (next_period_duration is null or next_period_duration in ('1m', '1y')),
  config_snapshot jsonb not null,
  created_at timestamptz default now() not null
);

create index plan_assignments_user_assigned_at_idx on plan_assignments (user_id, assigned_at desc);

comment on table plan_assignments is 'User plan assignments. config_snapshot stores plan config at acquisition time. Most recent assignment determines effective plan if not expired.';
comment on column plan_assignments.duration is 'Current period: 1m, 1y, or 30d (trial).';
comment on column plan_assignments.next_period_duration is '1m, 1y, or null if not renewing.';

alter table plans enable row level security;
alter table plan_assignments enable row level security;

-- Plans: readable by everyone (anon + authenticated) for pricing and display
create policy "Plans are viewable by everyone"
  on plans for select
  using (true);

-- Plan assignments: users can only see their own
create policy "Users can view own plan assignments"
  on plan_assignments for select
  using (auth.uid() = user_id);

-- Insert/update plan_assignments typically via backend (e.g. after payment). Allow authenticated user to insert/update own row for now (e.g. trial start).
create policy "Users can insert own plan assignments"
  on plan_assignments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own plan assignments"
  on plan_assignments for update
  using (auth.uid() = user_id);

-- Seed BASE, PRO, STUDIO (BASE: documents null = no subida renders/documentos)
insert into plans (
  name,
  code,
  description,
  projects_limit,
  clients_limit,
  suppliers_limit,
  catalog_products_limit,
  pdf_export_mode,
  multi_currency_per_project,
  purchase_orders,
  costs_management,
  payments_management,
  documents,
  notes,
  summary
) values
(
  'Prueba',
  'BASE',
  'Plan de prueba con límites básicos',
  3,
  10,
  10,
  50,
  'basic'::plan_feature_modality,
  null,
  null,
  null,
  null,
  null,
  'full',
  'full'
),
(
  'Pro',
  'PRO',
  'Plan profesional con más recursos y funcionalidades',
  10,
  50,
  50,
  500,
  'full',
  'full',
  'full',
  'full',
  'full',
  'full',
  'full',
  'full'
),
(
  'Studio',
  'STUDIO',
  'Plan ilimitado para estudios',
  -1,
  -1,
  -1,
  -1,
  'full'::plan_feature_modality,
  'full'::plan_feature_modality,
  'full'::plan_feature_modality,
  'full'::plan_feature_modality,
  'full'::plan_feature_modality,
  'full'::plan_feature_modality,
  'full'::plan_feature_modality,
  'full'::plan_feature_modality
);

-- Function: get effective plan for a user.
-- Plan vigente: el asignamiento más reciente que haya iniciado en la fecha actual o anterior (assigned_at <= now()).
-- Cualquier asignación futura se ignora hasta que entre en vigencia. Si la vigente está vencida, se usa BASE.
create or replace function get_effective_plan(p_user_id uuid)
returns table (plan_code text, config jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment plan_assignments%rowtype;
  v_base_plan plans%rowtype;
begin
  if p_user_id is null or p_user_id <> auth.uid() then
    return;
  end if;

  select pa.* into v_assignment
  from plan_assignments pa
  where pa.user_id = p_user_id
    and pa.assigned_at <= now()
  order by pa.assigned_at desc
  limit 1;

  if found and v_assignment.expires_at >= current_date then
    plan_code := (select p.code from plans p where p.id = v_assignment.plan_id);
    config := v_assignment.config_snapshot;
    return next;
    return;
  end if;

  -- Fallback to BASE
  select * into v_base_plan from plans where code = 'BASE' limit 1;
  plan_code := v_base_plan.code;
  config := jsonb_build_object(
    'projects_limit', v_base_plan.projects_limit,
    'clients_limit', v_base_plan.clients_limit,
    'suppliers_limit', v_base_plan.suppliers_limit,
    'catalog_products_limit', v_base_plan.catalog_products_limit,
    'pdf_export_mode', v_base_plan.pdf_export_mode,
    'multi_currency_per_project', v_base_plan.multi_currency_per_project,
    'purchase_orders', v_base_plan.purchase_orders,
    'costs_management', v_base_plan.costs_management,
    'payments_management', v_base_plan.payments_management,
    'documents', v_base_plan.documents,
    'notes', v_base_plan.notes,
    'summary', v_base_plan.summary
  );
  return next;
end;
$$;

comment on function get_effective_plan(uuid) is 'Returns effective plan: most recent assignment that has started (assigned_at <= now()) and not expired; otherwise BASE. Future assignments ignored until they start.';
