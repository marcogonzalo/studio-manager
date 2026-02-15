-- Plan limit check: reject project creation when user is at or over plan limit.
-- Raises with message containing PLAN_LIMIT_EXCEEDED so client can show upgrade message.

create or replace function check_projects_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_config jsonb;
  v_limit int;
  v_count int;
begin
  select config into v_config from get_effective_plan(auth.uid()) limit 1;
  if v_config is null then
    return new;
  end if;

  v_limit := (v_config->>'projects_limit')::int;
  if v_limit = -1 then
    return new;
  end if;

  select count(*) into v_count from projects where user_id = auth.uid();

  if v_count >= v_limit then
    raise exception 'PLAN_LIMIT_EXCEEDED: El plan actual no permite crear más proyectos.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger enforce_projects_plan_limit
  before insert on projects
  for each row execute function check_projects_plan_limit();

comment on function check_projects_plan_limit() is 'Enforces projects_limit from effective plan. Raises with PLAN_LIMIT_EXCEEDED in message.';
