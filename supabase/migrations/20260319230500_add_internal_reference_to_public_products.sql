-- Expose internal product code in public shared products view.
drop function if exists get_project_public_products(text);

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
  space_name text
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
    coalesce(s.name, '')::text as space_name
  from projects p
  join project_items pi on pi.project_id = p.id
  left join spaces s on s.id = pi.space_id
  where p.token = share_token and p.is_public_enabled = true
    and (pi.is_excluded = false or pi.is_excluded is null)
  order by space_name, pi.name;
$$;

grant execute on function get_project_public_products(text) to anon;
grant execute on function get_project_public_products(text) to authenticated;
