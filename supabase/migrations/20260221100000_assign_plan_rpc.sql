-- RPC to assign a plan (PRO or STUDIO) to the current user for a given duration (1m or 1y).
-- Used by "Modifica tu plan" flow (no payment yet).
-- Drop first so we can change parameter order (PostgreSQL does not allow changing signature with create or replace).
drop function if exists assign_plan(text, text);

create or replace function assign_plan(p_duration text, p_plan_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan plans%rowtype;
  v_config jsonb;
  v_expires_at date;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  if p_plan_code is null or p_plan_code not in ('PRO', 'STUDIO') then
    raise exception 'invalid plan code';
  end if;
  if p_duration is null or p_duration not in ('1m', '1y') then
    raise exception 'invalid duration';
  end if;

  select * into v_plan from plans where code = p_plan_code limit 1;
  if not found then
    raise exception 'plan not found';
  end if;

  v_config := jsonb_build_object(
    'projects_limit', v_plan.projects_limit,
    'clients_limit', v_plan.clients_limit,
    'suppliers_limit', v_plan.suppliers_limit,
    'catalog_products_limit', v_plan.catalog_products_limit,
    'pdf_export_mode', v_plan.pdf_export_mode,
    'multi_currency_per_project', v_plan.multi_currency_per_project,
    'purchase_orders', v_plan.purchase_orders,
    'costs_management', v_plan.costs_management,
    'payments_management', v_plan.payments_management,
    'documents', v_plan.documents,
    'notes', v_plan.notes,
    'summary', v_plan.summary
  );

  v_expires_at := case p_duration
    when '1m' then (current_timestamp + interval '1 month')::date
    when '1y' then (current_timestamp + interval '1 year')::date
    else current_date
  end case;

  insert into plan_assignments (
    user_id,
    plan_id,
    assigned_at,
    duration,
    expires_at,
    next_period_duration,
    config_snapshot
  ) values (
    v_user_id,
    v_plan.id,
    now(),
    p_duration,
    v_expires_at,
    p_duration,
    v_config
  );
end;
$$;

comment on function assign_plan(text, text) is 'Assigns PRO or STUDIO plan to the current user for 1m or 1y. Used by Modifica tu plan flow.';

grant execute on function assign_plan(text, text) to authenticated;

-- Tell PostgREST to reload schema cache so the new function is visible to the API.
notify pgrst, 'reload schema';
