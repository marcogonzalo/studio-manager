-- Gate budget_settings on public costs view for basic (BASE) pdf_export_mode.

create or replace function get_owner_pdf_export_mode(p_user_id uuid)
returns plan_feature_modality
language sql
security definer
set search_path = public
stable
as $$
  with active_assignment as (
    select pl.pdf_export_mode
    from plan_assignments pa
    join plans pl on pl.id = pa.plan_id
    where pa.user_id = p_user_id
      and pa.assigned_at <= now()
      and pa.expires_at >= current_date
    order by pa.assigned_at desc
    limit 1
  )
  select coalesce(
    (select pdf_export_mode from active_assignment),
    (select pdf_export_mode from plans where code = 'BASE' limit 1),
    'basic'::plan_feature_modality
  );
$$;

comment on function get_owner_pdf_export_mode(uuid) is
  'Effective pdf_export_mode for a user (active assignment or BASE fallback). Used by public RPCs.';

drop function if exists get_project_public_currency(text);

create function get_project_public_currency(share_token text)
returns table (
  currency text,
  tax_rate numeric,
  multitax boolean,
  budget_notes text,
  budget_settings jsonb
)
language sql security definer set search_path = public
as $$
  select
    p.currency::text,
    coalesce(p.tax_rate, 0)::numeric,
    coalesce(p.multitax, false),
    p.budget_notes,
    case
      when get_owner_pdf_export_mode(p.user_id) in ('plus', 'full')
      then coalesce(p.budget_settings, '{}'::jsonb)
      else '{}'::jsonb
    end
  from projects p
  where p.token = share_token and p.is_public_enabled = true;
$$;

grant execute on function get_project_public_currency(text) to anon;
grant execute on function get_project_public_currency(text) to authenticated;
