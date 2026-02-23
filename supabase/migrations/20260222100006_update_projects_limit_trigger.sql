-- Update project limit trigger to count only ACTIVE projects
-- Check limit when project is created as active or when status changes to active

-- Drop existing trigger and function
drop trigger if exists enforce_projects_plan_limit on projects;
drop function if exists check_projects_plan_limit();

-- Create new function that counts only active projects
create or replace function check_active_projects_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_config jsonb;
  v_limit int;
  v_count int;
  v_is_becoming_active boolean;
begin
  -- Determine if this operation is making the project active
  if TG_OP = 'INSERT' then
    v_is_becoming_active := (NEW.status = 'active');
  elsif TG_OP = 'UPDATE' then
    v_is_becoming_active := (OLD.status IS DISTINCT FROM 'active' AND NEW.status = 'active');
  else
    return NEW;
  end if;

  -- Only check limit if project is becoming active
  if not v_is_becoming_active then
    return NEW;
  end if;

  -- Get effective plan config
  select config into v_config from get_effective_plan(auth.uid()) limit 1;
  if v_config is null then
    return NEW;
  end if;

  -- Get effective active projects limit (includes extras)
  v_limit := (v_config->>'effective_active_projects_limit')::int;
  if v_limit = -1 then
    return NEW;
  end if;

  -- Count current active projects
  select count(*) into v_count 
  from projects 
  where user_id = auth.uid() 
    and status = 'active'
    and (TG_OP = 'INSERT' or id <> NEW.id); -- Exclude current row if UPDATE

  -- Check if limit would be exceeded
  if v_count >= v_limit then
    raise exception 'PLAN_LIMIT_EXCEEDED: El plan actual permite un máximo de % proyecto(s) activo(s). Actualiza tu plan para crear más proyectos.', v_limit
      using errcode = 'P0001';
  end if;

  return NEW;
end;
$$;

-- Create trigger for both INSERT and UPDATE
create trigger enforce_active_projects_plan_limit
  before insert or update on projects
  for each row execute function check_active_projects_plan_limit();

comment on function check_active_projects_plan_limit() is 'Enforces active projects limit from effective plan. Only counts projects with status = active. Raises PLAN_LIMIT_EXCEEDED on violation.';
