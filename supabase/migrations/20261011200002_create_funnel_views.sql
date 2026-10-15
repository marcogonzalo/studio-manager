-- F4: Create funnel analytics views (service role only)
-- Signup timestamp comes from auth.users.created_at (profiles has no created_at).
-- Two-route activation: PRIMARY (project + budget/supplier within 7 days) OR
-- SECONDARY (2+ sessions + 1+ project updates within 30 days of signup).

create or replace view funnel_users as
select
  p.id as user_id,
  p.email,
  coalesce(pa_recent.plan_code, 'BASE') as plan,
  u.created_at as signup_at,
  latest_event.last_active_at,
  case
    when latest_event.last_active_at is null then null
    else date_part('day', now() - latest_event.last_active_at)::int
  end as days_since_active,

  exists(select 1 from projects pr where pr.user_id = p.id limit 1) as has_project,
  (
    exists(select 1 from project_budget_lines pbl join projects pr on pr.id = pbl.project_id where pr.user_id = p.id limit 1)
    or exists(select 1 from suppliers s where s.user_id = p.id limit 1)
  ) as has_budget_or_supplier,

  (
    exists(select 1 from projects pr where pr.user_id = p.id limit 1)
    and (
      exists(select 1 from project_budget_lines pbl join projects pr on pr.id = pbl.project_id where pr.user_id = p.id and pbl.created_at <= u.created_at + interval '7 days' limit 1)
      or exists(select 1 from suppliers s where s.user_id = p.id and s.created_at <= u.created_at + interval '7 days' limit 1)
    )
  ) as activated_7d,

  (
    select count(*)
    from user_events ue
    where ue.user_id = p.id
      and ue.event = 'login'
      and ue.created_at >= u.created_at
      and ue.created_at <= u.created_at + interval '30 days'
  ) as sessions_30d,

  (
    select count(*)
    from user_events ue
    where ue.user_id = p.id
      and ue.event = 'project_updated'
      and ue.created_at >= u.created_at
      and ue.created_at <= u.created_at + interval '30 days'
  ) as project_updates_30d,

  (
    (
      exists(select 1 from projects pr where pr.user_id = p.id limit 1)
      and (
        exists(select 1 from project_budget_lines pbl join projects pr on pr.id = pbl.project_id where pr.user_id = p.id and pbl.created_at <= u.created_at + interval '7 days' limit 1)
        or exists(select 1 from suppliers s where s.user_id = p.id and s.created_at <= u.created_at + interval '7 days' limit 1)
      )
    )
    or
    (
      (
        select count(*)
        from user_events ue
        where ue.user_id = p.id
          and ue.event = 'login'
          and ue.created_at >= u.created_at
          and ue.created_at <= u.created_at + interval '30 days'
      ) >= 2
      and
      (
        select count(*)
        from user_events ue
        where ue.user_id = p.id
          and ue.event = 'project_updated'
          and ue.created_at >= u.created_at
          and ue.created_at <= u.created_at + interval '30 days'
      ) >= 1
    )
  ) as activated,

  case
    when (
      exists(select 1 from projects pr where pr.user_id = p.id limit 1)
      and (
        exists(select 1 from project_budget_lines pbl join projects pr on pr.id = pbl.project_id where pr.user_id = p.id and pbl.created_at <= u.created_at + interval '7 days' limit 1)
        or exists(select 1 from suppliers s where s.user_id = p.id and s.created_at <= u.created_at + interval '7 days' limit 1)
      )
    ) then 'primary'
    when (
      (
        select count(*)
        from user_events ue
        where ue.user_id = p.id
          and ue.event = 'login'
          and ue.created_at >= u.created_at
          and ue.created_at <= u.created_at + interval '30 days'
      ) >= 2
      and
      (
        select count(*)
        from user_events ue
        where ue.user_id = p.id
          and ue.event = 'project_updated'
          and ue.created_at >= u.created_at
          and ue.created_at <= u.created_at + interval '30 days'
      ) >= 1
    ) then 'secondary'
    else null
  end as activation_route,

  case
    when not exists(select 1 from projects pr where pr.user_id = p.id limit 1) then 'signup'
    when (
      exists(select 1 from projects pr where pr.user_id = p.id limit 1)
      and (
        exists(select 1 from project_budget_lines pbl join projects pr on pr.id = pbl.project_id where pr.user_id = p.id and pbl.created_at <= u.created_at + interval '7 days' limit 1)
        or exists(select 1 from suppliers s where s.user_id = p.id and s.created_at <= u.created_at + interval '7 days' limit 1)
      )
    ) or (
      (
        select count(*)
        from user_events ue
        where ue.user_id = p.id
          and ue.event = 'login'
          and ue.created_at >= u.created_at
          and ue.created_at <= u.created_at + interval '30 days'
      ) >= 2
      and
      (
        select count(*)
        from user_events ue
        where ue.user_id = p.id
          and ue.event = 'project_updated'
          and ue.created_at >= u.created_at
          and ue.created_at <= u.created_at + interval '30 days'
      ) >= 1
    ) then 'activated'
    when latest_event.last_active_at is not null and date_part('day', now() - latest_event.last_active_at)::int <= 30 then 'habitual'
    when coalesce(pa_recent.plan_code, 'BASE') in ('PRO', 'STUDIO') then 'paid'
    else 'signup'
  end as stage
from profiles p
join auth.users u on u.id = p.id
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

create or replace view leads_users as
select
  l.id as lead_id,
  l.email,
  l.name as lead_name,
  l.studio,
  l.role,
  l.locale as lead_locale,
  l.created_at as lead_created_at,
  l.source,
  l.utm_source,
  l.utm_medium,
  l.utm_campaign,
  l.utm_term,
  l.utm_content,
  l.referrer,
  l.landing_path,
  l.demo_accessed_at,
  l.marketing_consent,
  l.consent_at,
  p.id as user_id,
  u.created_at as user_signup_at,
  case
    when p.id is not null then extract(epoch from (u.created_at - l.created_at)) / 3600
    else null
  end as hours_to_signup
from leads l
left join profiles p on lower(trim(p.email)) = lower(trim(l.email))
left join auth.users u on u.id = p.id;

comment on view leads_users is 'Join leads to users by email to track demo-to-signup conversion. Service role only.';

grant select on funnel_users to service_role;
grant select on leads_users to service_role;
