-- Restore public budget/products RPC shape from 20260820120000 (created_at + order)
-- and keep per-line tax_rate from 20260821120000.

drop function if exists get_project_public_budget(text);
drop function if exists get_project_public_products(text);

create function get_project_public_budget(share_token text)
returns table (
  id uuid,
  category text,
  subcategory text,
  description text,
  estimated_amount numeric,
  phase text,
  is_price_tbd boolean,
  created_at timestamptz,
  tax_rate numeric
)
language sql security definer set search_path = public
as $$
  select
    pbl.id,
    pbl.category::text,
    pbl.subcategory,
    pbl.description,
    pbl.estimated_amount,
    pbl.phase,
    coalesce(pbl.is_price_tbd, false) as is_price_tbd,
    pbl.created_at,
    coalesce(pbl.tax_rate, p.tax_rate, 0) as tax_rate
  from projects p
  join project_budget_lines pbl on pbl.project_id = p.id
  where p.token = share_token and p.is_public_enabled = true
    and (pbl.is_internal_cost = false or pbl.is_internal_cost is null)
  order by
    coalesce(
      array_position(
        array[
          'diagnosis',
          'design',
          'executive',
          'budget',
          'construction',
          'delivery'
        ]::text[],
        pbl.phase::text
      ),
      999
    ),
    coalesce(
      array_position(
        array[
          'own_fees',
          'external_services',
          'construction',
          'operations'
        ]::text[],
        pbl.category::text
      ),
      999
    ),
    pbl.created_at,
    pbl.id;
$$;

create function get_project_public_products(share_token text)
returns table (
  id uuid,
  name text,
  description text,
  internal_reference text,
  quantity numeric,
  unit_price numeric,
  total_price numeric,
  status text,
  image_url text,
  space_name text,
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
    pi.quantity,
    pi.unit_price,
    (pi.unit_price * pi.quantity) as total_price,
    coalesce(pi.status, '')::text,
    pi.image_url::text,
    coalesce(s.name, '')::text as space_name,
    coalesce(pi.is_price_tbd, false) as is_price_tbd,
    s.created_at as space_created_at,
    pi.created_at,
    coalesce(pi.tax_rate, p.tax_rate, 0) as tax_rate
  from projects p
  join project_items pi on pi.project_id = p.id
  left join spaces s on s.id = pi.space_id
  where p.token = share_token and p.is_public_enabled = true
    and (pi.is_excluded = false or pi.is_excluded is null)
  order by
    s.created_at asc nulls last,
    pi.created_at,
    pi.id;
$$;

grant execute on function get_project_public_budget(text) to anon;
grant execute on function get_project_public_budget(text) to authenticated;
grant execute on function get_project_public_products(text) to anon;
grant execute on function get_project_public_products(text) to authenticated;
