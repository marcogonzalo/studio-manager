-- F4: Create funnel analytics views (service role only)

-- funnel_users: one row per user with activation status
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
  exists(select 1 from projects pr where pr.user_id = p.id limit 1) as has_project,
  (
    exists(select 1 from project_budget_lines pbl join projects pr on pr.id = pbl.project_id where pr.user_id = p.id limit 1)
    or exists(select 1 from suppliers s where s.user_id = p.id limit 1)
  ) as has_budget_or_supplier,
  (
    exists(select 1 from projects pr where pr.user_id = p.id limit 1)
    and (
      exists(select 1 from project_budget_lines pbl join projects pr on pr.id = pbl.project_id where pr.user_id = p.id and pbl.created_at <= p.created_at + interval '7 days' limit 1)
      or exists(select 1 from suppliers s where s.user_id = p.id and s.created_at <= p.created_at + interval '7 days' limit 1)
    )
  ) as activated_7d,
  case
    when not exists(select 1 from projects pr where pr.user_id = p.id limit 1) then 'signup'
    when (
      exists(select 1 from projects pr where pr.user_id = p.id limit 1)
      and (
        exists(select 1 from project_budget_lines pbl join projects pr on pr.id = pbl.project_id where pr.user_id = p.id and pbl.created_at <= p.created_at + interval '7 days' limit 1)
        or exists(select 1 from suppliers s where s.user_id = p.id and s.created_at <= p.created_at + interval '7 days' limit 1)
      )
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

comment on view funnel_users is 'Funnel analytics: one row per user with plan, activation status, and stage. Service role only.';

-- leads_users: join leads to users by email to track demo-to-signup conversion
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
  p.created_at as user_signup_at,
  case
    when p.id is not null then extract(epoch from (p.created_at - l.created_at)) / 3600
    else null
  end as hours_to_signup
from leads l
left join profiles p on lower(trim(p.email)) = lower(trim(l.email));

comment on view leads_users is 'Join leads to users by email to track demo-to-signup conversion. Service role only.';

-- Grant select on views to service role only (views inherit table RLS by default, but explicit grant for clarity)
grant select on funnel_users to service_role;
grant select on leads_users to service_role;
