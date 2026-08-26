-- Issue #191: project-level budget customization for public view and PDF export.

alter table projects
  add column if not exists budget_settings jsonb not null default '{}'::jsonb;

comment on column projects.budget_settings is
  'JSON settings for client-facing budget presentation: phase filter, sort, product field visibility, space filter.';

-- Public currency RPC also returns budget_settings for the shared costs view.
drop function if exists get_project_public_currency(text);

create function get_project_public_currency(share_token text)
returns table (
  currency text,
  tax_rate numeric,
  multitax boolean,
  budget_notes text,
  budget_settings jsonb
)
language sql security definer set search_path = public
as $$
  select
    p.currency::text,
    coalesce(p.tax_rate, 0)::numeric,
    coalesce(p.multitax, false),
    p.budget_notes,
    coalesce(p.budget_settings, '{}'::jsonb)
  from projects p
  where p.token = share_token and p.is_public_enabled = true;
$$;

grant execute on function get_project_public_currency(text) to anon;
grant execute on function get_project_public_currency(text) to authenticated;

-- Expose catalog reference and supplier name for optional product field visibility (#185).
drop function if exists get_project_public_products(text);

create function get_project_public_products(share_token text)
returns table (
  id uuid,
  name text,
  description text,
  internal_reference text,
  reference_code text,
  supplier_name text,
  quantity numeric,
  unit_price numeric,
  total_price numeric,
  status text,
  image_url text,
  space_name text,
  space_id uuid,
  is_price_tbd boolean,
  space_created_at timestamptz,
  created_at timestamptz,
  tax_rate numeric
)
language sql security definer set search_path = public
as $$
  select
    pi.id,
    pi.name::text,
    coalesce(pi.description, '')::text,
    pi.internal_reference::text,
    coalesce(prod.reference_code, '')::text as reference_code,
    coalesce(sup.name, '')::text as supplier_name,
    pi.quantity,
    pi.unit_price,
    (pi.unit_price * pi.quantity) as total_price,
    coalesce(pi.status, '')::text,
    pi.image_url::text,
    coalesce(s.name, '')::text as space_name,
    pi.space_id,
    coalesce(pi.is_price_tbd, false) as is_price_tbd,
    s.created_at as space_created_at,
    pi.created_at,
    coalesce(pi.tax_rate, p.tax_rate, 0) as tax_rate
  from projects p
  join project_items pi on pi.project_id = p.id
  left join spaces s on s.id = pi.space_id
  left join products prod on prod.id = pi.product_id
  left join suppliers sup on sup.id = prod.supplier_id
  where p.token = share_token and p.is_public_enabled = true
    and (pi.is_excluded = false or pi.is_excluded is null)
  order by
    s.created_at asc nulls last,
    pi.created_at,
    pi.id;
$$;

grant execute on function get_project_public_products(text) to anon;
grant execute on function get_project_public_products(text) to authenticated;
