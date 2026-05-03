-- RPCs para área pública del proyecto: renders por espacio y documentos por token.

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
    si.url::text,
    coalesce(si.description, '')::text,
    coalesce(s.name, '')::text as space_name
  from projects p
  join spaces s on s.project_id = p.id
  join space_images si on si.space_id = s.id
  where p.token = share_token and p.is_public_enabled = true
  order by space_name, si.created_at;
$$;

create or replace function get_project_public_documents(share_token text)
returns table (
  id uuid,
  name text,
  file_url text,
  file_type text
)
language sql security definer set search_path = public
as $$
  select
    d.id,
    d.name::text,
    d.file_url::text,
    coalesce(d.file_type, '')::text
  from projects p
  join project_documents d on d.project_id = p.id
  where p.token = share_token and p.is_public_enabled = true
  order by d.created_at desc;
$$;

grant execute on function get_project_public_space_images(text) to anon;
grant execute on function get_project_public_space_images(text) to authenticated;
grant execute on function get_project_public_documents(text) to anon;
grant execute on function get_project_public_documents(text) to authenticated;
