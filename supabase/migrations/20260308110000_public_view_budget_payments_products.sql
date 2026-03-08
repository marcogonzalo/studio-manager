-- RPCs para área pública del proyecto (issues #104, #105, #107): presupuesto, pagos, productos por token.

-- Moneda e impuesto del proyecto (para formatear costes)
create or replace function get_project_public_currency(share_token text)
returns table (currency text, tax_rate numeric)
language sql security definer set search_path = public
as $$
  select p.currency::text, coalesce(p.tax_rate, 0)::numeric
  from projects p
  where p.token = share_token and p.is_public_enabled = true;
$$;

grant execute on function get_project_public_currency(text) to anon;
grant execute on function get_project_public_currency(text) to authenticated;

-- Presupuesto: partidas visibles (sin is_internal_cost) para el proyecto del token
create or replace function get_project_public_budget(share_token text)
returns table (
  id uuid,
  category text,
  subcategory text,
  description text,
  estimated_amount numeric,
  phase text
)
language sql security definer set search_path = public
as $$
  select
    pbl.id,
    pbl.category::text,
    pbl.subcategory,
    pbl.description,
    pbl.estimated_amount,
    pbl.phase
  from projects p
  join project_budget_lines pbl on pbl.project_id = p.id
  where p.token = share_token and p.is_public_enabled = true
    and (pbl.is_internal_cost = false or pbl.is_internal_cost is null);
$$;

-- Pagos: historial de pagos del proyecto
create or replace function get_project_public_payments(share_token text)
returns table (
  id uuid,
  amount numeric,
  payment_date date,
  reference_number text,
  description text,
  payment_type text
)
language sql security definer set search_path = public
as $$
  select
    pay.id,
    pay.amount,
    pay.payment_date,
    pay.reference_number,
    pay.description,
    pay.payment_type
  from projects p
  join payments pay on pay.project_id = p.id
  where p.token = share_token and p.is_public_enabled = true
  order by pay.payment_date desc;
$$;

-- Productos del proyecto: ítems no excluidos, con precio venta y total (sin precio unitario interno)
create or replace function get_project_public_products(share_token text)
returns table (
  id uuid,
  name text,
  description text,
  quantity numeric,
  unit_price numeric,
  total_price numeric,
  status text,
  image_url text,
  space_name text
)
language sql security definer set search_path = public
as $$
  select
    pi.id,
    pi.name::text,
    coalesce(pi.description, '')::text,
    pi.quantity,
    pi.unit_price,
    (pi.unit_price * pi.quantity) as total_price,
    coalesce(pi.status, '')::text,
    pi.image_url::text,
    coalesce(s.name, '')::text as space_name
  from projects p
  join project_items pi on pi.project_id = p.id
  left join spaces s on s.id = pi.space_id
  where p.token = share_token and p.is_public_enabled = true
    and (pi.is_excluded = false or pi.is_excluded is null)
  order by space_name, pi.name;
$$;

grant execute on function get_project_public_budget(text) to anon;
grant execute on function get_project_public_budget(text) to authenticated;
grant execute on function get_project_public_payments(text) to anon;
grant execute on function get_project_public_payments(text) to authenticated;
grant execute on function get_project_public_products(text) to anon;
grant execute on function get_project_public_products(text) to authenticated;
