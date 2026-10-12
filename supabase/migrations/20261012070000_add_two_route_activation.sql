-- F4 Update: Add two-route activation tracking to funnel_users view

-- Drop existing view
drop view if exists funnel_users;

-- Recreate funnel_users view with two-route activation
create or replace view funnel_users as
select
  p.id as user_id,
  p.email,
  coalesce(pa_recent.plan_code, 'BASE') as plan,
  p.created_at as signup_at,
  latest_event.last_active_at,
  case
    when latest_event.last_active_at is null then null
    else date_part('day', now() - latest_event.last_active_at)::int
  end as days_since_active,
  
  -- Existing fields
  exists(select 1 from projects pr where pr.user_id = p.id limit 1) as has_project,
  (
    exists(select 1 from project_budget_lines pbl join projects pr on pr.id = pbl.project_id where pr.user_id = p.id limit 1)
    or exists(select 1 from suppliers s where s.user_id = p.id limit 1)
  ) as has_budget_or_supplier,
  
  -- PRIMARY activation route: first project + budget or supplier within 7 days of signup
  (
    exists(select 1 from projects pr where pr.user_id = p.id limit 1)
    and (
      exists(select 1 from project_budget_lines pbl join projects pr on pr.id = pbl.project_id where pr.user_id = p.id and pbl.created_at <= p.created_at + interval '7 days' limit 1)
      or exists(select 1 from suppliers s where s.user_id = p.id and s.created_at <= p.created_at + interval '7 days' limit 1)
    )
  ) as activated_7d,
  
  -- NEW: Session count (login events) in 30 days after signup
  (
    select count(*)
    from user_events ue
    where ue.user_id = p.id
      and ue.event = 'login'
      and ue.created_at >= p.created_at
      and ue.created_at <= p.created_at + interval '30 days'
  ) as sessions_30d,
  
  -- NEW: Project update count in 30 days after signup (excludes example/demo projects)
  (
    select count(*)
    from user_events ue
    where ue.user_id = p.id
      and ue.event = 'project_updated'
      and ue.created_at >= p.created_at
      and ue.created_at <= p.created_at + interval '30 days'
  ) as project_updates_30d,
  
  -- NEW: Combined activation (primary OR secondary)
  (
    -- Primary route
    (
      exists(select 1 from projects pr where pr.user_id = p.id limit 1)
      and (
        exists(select 1 from project_budget_lines pbl join projects pr on pr.id = pbl.project_id where pr.user_id = p.id and pbl.created_at <= p.created_at + interval '7 days' limit 1)
        or exists(select 1 from suppliers s where s.user_id = p.id and s.created_at <= p.created_at + interval '7 days' limit 1)
      )
    )
    or
    -- Secondary route: 2+ sessions AND 1+ project updates within 30 days
    (
      (
        select count(*)
        from user_events ue
        where ue.user_id = p.id
          and ue.event = 'login'
          and ue.created_at >= p.created_at
          and ue.created_at <= p.created_at + interval '30 days'
      ) >= 2
      and
      (
        select count(*)
        from user_events ue
        where ue.user_id = p.id
          and ue.event = 'project_updated'
          and ue.created_at >= p.created_at
          and ue.created_at <= p.created_at + interval '30 days'
      ) >= 1
    )
  ) as activated,
  
  -- NEW: Activation route identifier
  case
    -- Primary takes precedence
    when (
      exists(select 1 from projects pr where pr.user_id = p.id limit 1)
      and (
        exists(select 1 from project_budget_lines pbl join projects pr on pr.id = pbl.project_id where pr.user_id = p.id and pbl.created_at <= p.created_at + interval '7 days' limit 1)
        or exists(select 1 from suppliers s where s.user_id = p.id and s.created_at <= p.created_at + interval '7 days' limit 1)
      )
    ) then 'primary'
    -- Secondary fallback
    when (
      (
        select count(*)
        from user_events ue
        where ue.user_id = p.id
          and ue.event = 'login'
          and ue.created_at >= p.created_at
          and ue.created_at <= p.created_at + interval '30 days'
      ) >= 2
      and
      (
        select count(*)
        from user_events ue
        where ue.user_id = p.id
          and ue.event = 'project_updated'
          and ue.created_at >= p.created_at
          and ue.created_at <= p.created_at + interval '30 days'
      ) >= 1
    ) then 'secondary'
    else null
  end as activation_route,
  
  case
    when not exists(select 1 from projects pr where pr.user_id = p.id limit 1) then 'signup'
    when (
      -- Activated via primary route
      exists(select 1 from projects pr where pr.user_id = p.id limit 1)
      and (
        exists(select 1 from project_budget_lines pbl join projects pr on pr.id = pbl.project_id where pr.user_id = p.id and pbl.created_at <= p.created_at + interval '7 days' limit 1)
        or exists(select 1 from suppliers s where s.user_id = p.id and s.created_at <= p.created_at + interval '7 days' limit 1)
      )
    ) or (
      -- Activated via secondary route
      (
        select count(*)
        from user_events ue
        where ue.user_id = p.id
          and ue.event = 'login'
          and ue.created_at >= p.created_at
          and ue.created_at <= p.created_at + interval '30 days'
      ) >= 2
      and
      (
        select count(*)
        from user_events ue
        where ue.user_id = p.id
          and ue.event = 'project_updated'
          and ue.created_at >= p.created_at
          and ue.created_at <= p.created_at + interval '30 days'
      ) >= 1
    ) then 'activated'
    when latest_event.last_active_at is not null and date_part('day', now() - latest_event.last_active_at)::int <= 30 then 'habitual'
    when coalesce(pa_recent.plan_code, 'BASE') in ('PRO', 'STUDIO') then 'paid'
    else 'signup'
  end as stage
from profiles p
left join lateral (
  select max(created_at) as last_active_at
  from user_events ue
  where ue.user_id = p.id
) latest_event on true
left join lateral (
  select
    pl.code as plan_code
  from plan_assignments pa
  join plans pl on pl.id = pa.plan_id
  where pa.user_id = p.id
    and pa.assigned_at <= now()
  order by pa.assigned_at desc
  limit 1
) pa_recent on true;

comment on view funnel_users is 'Funnel analytics with two-route activation: PRIMARY (first project + budget/supplier within 7 days) OR SECONDARY (2+ sessions + 1+ project updates within 30 days of signup). Sessions and project_updates counted from signup date. Service role only.';

-- Grant select to service role
grant select on funnel_users to service_role;
