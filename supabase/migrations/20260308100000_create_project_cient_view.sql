-- Vista pública del proyecto: token y flag en projects (issues #74, #75).

-- Si existía la versión anterior con project_share_links, eliminarla
drop function if exists get_project_share_by_token(text);

-- Columnas en projects para compartir vista con cliente
alter table projects
  add column if not exists token text,
  add column if not exists is_public_enabled boolean not null default false;

-- Tokens únicos para proyectos existentes (sin token)
update projects
set token = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
where token is null;

-- Índice y constraint para búsqueda pública por token
create unique index if not exists idx_projects_token on projects(token) where token is not null;

-- Función pública por token: SECURITY DEFINER para lectura anónima
-- Devuelve nombre, arquitecto/a, fase, fechas solo si token coincide y is_public_enabled = true
create or replace function get_project_share_by_token(share_token text)
returns table (
  project_name text,
  architect_name text,
  phase text,
  start_date date,
  end_date date
)
language sql security definer set search_path = public
as $$
  select
    p.name,
    pr.full_name,
    p.phase,
    p.start_date,
    p.end_date
  from projects p
  join profiles pr on pr.id = p.user_id
  where p.token = share_token and p.is_public_enabled = true;
$$;

comment on function get_project_share_by_token(text) is 'Returns project and architect for public client view; only when project token is valid and is_public_enabled.';

grant execute on function get_project_share_by_token(text) to anon;
grant execute on function get_project_share_by_token(text) to authenticated;
