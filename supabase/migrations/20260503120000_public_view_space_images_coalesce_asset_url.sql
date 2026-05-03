-- Vista pública: URL del render puede vivir en space_images.url o, si quedó vacía, en assets.url (asset_id).

create or replace function get_project_public_space_images(share_token text)
returns table (
  id uuid,
  url text,
  description text,
  space_name text
)
language sql security definer set search_path = public
as $$
  select
    si.id,
    coalesce(
      nullif(trim(si.url), ''),
      nullif(trim(ast.url), '')
    )::text as url,
    coalesce(si.description, '')::text,
    coalesce(s.name, '')::text as space_name
  from projects p
  join spaces s on s.project_id = p.id
  join space_images si on si.space_id = s.id
  left join assets ast on ast.id = si.asset_id
  where p.token = share_token and p.is_public_enabled = true
    and coalesce(
      nullif(trim(si.url), ''),
      nullif(trim(ast.url), '')
    ) is not null
  order by space_name, si.created_at;
$$;
